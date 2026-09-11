"""Package browser-captured design screens; never modifies image pixels."""
from pathlib import Path
import hashlib
import json
import zipfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / 'docs/flows/warranty-components'
BOARD_ROOT = ROOT / 'docs/design/01_Main/BOARDS/02_NEW_BOARDS'
OUTPUT = ROOT / 'handoff/scanner-screens-17-22'


def main():
    screens = sorted((FLOW / 'screens').glob('*.png'))
    boards = sorted(p for p in BOARD_ROOT.glob('*.png') if 17 <= int(p.name[:2]) <= 22)
    assert len(screens) == 24
    assert len(boards) == 6
    entries = []
    for group, paths, size in [('screens', screens, (780, 1688)), ('boards', boards, (3584, 2080))]:
        for p in paths:
            with Image.open(p) as image:
                image.load()
                assert image.size == size, (p.name, image.size)
            data = p.read_bytes()
            if group == 'boards':
                assert data == (ROOT / 'design/01_Main/BOARDS/02_NEW_BOARDS' / p.name).read_bytes()
            entries.append({'path': f'{group}/{p.name}', 'width': size[0], 'height': size[1],
                            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    manifest = {'version': 'screens-17-22-v1', 'screen_count': 24, 'board_count': 6,
                'method': 'Browser screenshots of editable HTML/CSS UI; not AI upscaled raster boards',
                'scope': 'Design and fixture interactions; no WMS integration', 'files': entries}
    manifest_path = OUTPUT / 'MANIFEST.json'
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    archive = ROOT / 'docs/assets/scanner-screens-17-22.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for group, paths in [('screens', screens), ('boards', boards)]:
            for p in paths:
                z.write(p, f'{group}/{p.name}')
        for name in ['HANDOFF.md', 'DEV_PROPOSAL.md']:
            z.write(FLOW / name, name)
        z.write(manifest_path, 'MANIFEST.json')
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        for e in entries:
            assert hashlib.sha256(z.read(e['path'])).hexdigest() == e['sha256']
    print(json.dumps({'screens': len(screens), 'boards': len(boards), 'zip_bytes': archive.stat().st_size,
                      'zip_sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
