"""Recolor only the four Dialog header backgrounds from the supplied Nhap kho reference.

Run with Pillow and NumPy. Original boards are never overwritten. No text is redrawn.
"""
from pathlib import Path
import hashlib
import json

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BOARDS = ROOT / 'design/01_Main/BOARDS'
SOURCE = BOARDS / '01_UPDATED_BOARDS/01_dialog_fixed.png'
REFERENCE = BOARDS / '01_UPDATED_BOARDS/02_nhap_kho.png'
OUTPUT = SOURCE.with_name('01_dialog_header_aligned_v2.png')
EVIDENCE = ROOT / 'handoff/dialog-header-color-v2'
BOXES = [(50, 33, 444, 142), (477, 33, 871, 142),
         (903, 33, 1297, 142), (1328, 33, 1723, 142)]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def design_matrix(width, height):
    y, x = np.mgrid[0:height, 0:width].astype(float)
    x = 2 * x / (width - 1) - 1
    y = 2 * y / (height - 1) - 1
    return np.stack([x ** i * y ** j for i in range(5) for j in range(5 - i)], -1)


def fit_background(pixels):
    """Estimate the smooth blue surface, excluding white text and rounded edges."""
    height, width = pixels.shape[:2]
    mat = design_matrix(width, height)
    red, green, blue = pixels.transpose(2, 0, 1)
    sample = (red < 12) & (green > 25) & (blue - green > 12)
    sample[:6] = False
    sample[-3:] = False
    sample[:, :8] = False
    sample[:, -8:] = False
    for _ in range(4):
        coeff = np.linalg.lstsq(mat[sample], pixels[sample], rcond=None)[0]
        field = mat @ coeff
        residual = np.max(np.abs(field - pixels), axis=-1)
        sample &= residual < max(6, float(np.percentile(residual[sample], 90)))
    return coeff, field


def main():
    # Protect every existing board, including the two locked originals.
    originals = [p for p in BOARDS.rglob('*') if p.is_file() and p != OUTPUT]
    before_hashes = {str(p.relative_to(ROOT)): sha(p) for p in originals}
    source_image = Image.open(SOURCE).convert('RGB')
    src = np.asarray(source_image).copy()
    out = src.copy()
    ref = np.asarray(Image.open(REFERENCE).convert('RGB')).astype(float)
    # First Nhap kho header: the area above its rounded white body, no body/CTA samples.
    ref_coeff, _ = fit_background(ref[40:133, 36:375])
    change_mask = np.zeros(src.shape[:2], dtype=bool)
    white_mask = np.zeros_like(change_mask)
    rectangle_mask = np.zeros_like(change_mask)
    stats = []
    for number, (left, top, right, bottom) in enumerate(BOXES, 1):
        old = src[top:bottom, left:right].astype(float)
        _, old_field = fit_background(old)
        height, width = old.shape[:2]
        target = np.clip(design_matrix(width, height) @ ref_coeff, 0, 255)
        red, green, blue = old.transpose(2, 0, 1)
        # Preserve solid white/light UI ink exactly; only its blue antialiased
        # edges blend with the new background. Pale body/background pixels excluded.
        white = np.min(old, axis=-1) >= 160
        mask = (red < 160) & (green - red > 20) & (blue - green > 15) & ~white
        ink_alpha = np.clip((red - old_field[:, :, 0]) / (255 - old_field[:, :, 0]), 0, 1)
        corrected = np.clip(np.rint(old + (target - old_field) * (1 - ink_alpha[:, :, None])), 0, 255).astype(np.uint8)
        patch = out[top:bottom, left:right]
        patch[mask] = corrected[mask]
        change_mask[top:bottom, left:right] |= mask
        white_mask[top:bottom, left:right] |= white
        rectangle_mask[top:bottom, left:right] = True
        sample = mask & (red < 12)
        mae = np.abs(patch.astype(float)[sample] - target[sample]).mean(axis=0)
        stats.append({'header': number, 'box': [left, top, right, bottom],
                      'changed_pixels': int(np.any(patch != old, axis=-1).sum()),
                      'background_mean_before_rgb': old[sample].mean(axis=0).round(2).tolist(),
                      'background_mean_after_rgb': patch[sample].mean(axis=0).round(2).tolist(),
                      'reference_fitted_mean_rgb': target[sample].mean(axis=0).round(2).tolist(),
                      'mean_absolute_error_to_reference_rgb': mae.round(2).tolist()})
        assert float(mae.max()) < 4, 'Header color differs from sampled reference'

    changed = np.any(out != src, axis=-1)
    assert not np.any(changed & ~change_mask), 'Unexpected unmasked edit'
    assert not np.any(changed & ~rectangle_mask), 'Unexpected body edit'
    assert not np.any(changed & white_mask), 'White text/icon pixels changed'
    assert all(sha(ROOT / p) == value for p, value in before_hashes.items())
    result = Image.fromarray(out)
    result.save(OUTPUT)
    web_output = ROOT / 'docs' / OUTPUT.relative_to(ROOT)
    web_output.parent.mkdir(parents=True, exist_ok=True)
    web_output.write_bytes(OUTPUT.read_bytes())
    assert np.array_equal(np.asarray(Image.open(OUTPUT)), out)

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    # Inspector strip: original, recolored, reference. Not used by the gallery.
    strip = Image.new('RGB', (424, 428), 'white')
    draw = ImageDraw.Draw(strip)
    for y, label, picture in [(10, 'Before: Dialog', source_image.crop(BOXES[0])),
                              (150, 'After: Dialog', result.crop(BOXES[0])),
                              (290, 'Reference: Nhap kho', Image.open(REFERENCE).crop((36, 40, 375, 133)))]:
        draw.text((14, y), label, fill='black')
        strip.paste(picture.resize((394, 109)), (14, y + 20))
    strip.save(EVIDENCE / 'header-before-after-reference.png')
    Image.fromarray((changed * 255).astype(np.uint8)).save(EVIDENCE / 'changed-pixels-mask.png')
    report = {'source': str(SOURCE.relative_to(ROOT)), 'reference': str(REFERENCE.relative_to(ROOT)),
              'output': str(OUTPUT.relative_to(ROOT)), 'size': list(result.size),
              'changed_pixels': int(changed.sum()),
              'changed_pixels_outside_four_headers': int((changed & ~rectangle_mask).sum()),
              'changed_protected_white_text_icon_pixels': int((changed & white_mask).sum()),
              'unchanged_original_files_sha256': before_hashes, 'headers': stats,
              'output_sha256': sha(OUTPUT), 'public_copy_sha256': sha(web_output)}
    (EVIDENCE / 'pixel-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'unchanged_original_files_sha256'}, indent=2))


if __name__ == '__main__':
    main()
