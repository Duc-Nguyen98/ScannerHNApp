"""Validate and package the supplied replacement assets without transforming bytes."""
import argparse
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
ASSETS = REPO / "assets" / "scanner-approved"
PUBLIC = REPO / "docs" / "assets" / "scanner-approved"
GROUPS = ("01_backgrounds", "02_people_staff", "03_overlays_gradients")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify-source", type=Path, required=True)
    args = parser.parse_args()

    files = []
    for group in GROUPS:
        local = sorted(p for p in (ASSETS / group).iterdir() if p.is_file())
        supplied = sorted(p for p in (args.verify_source / group).iterdir() if p.is_file())
        assert [p.name for p in local] == [p.name for p in supplied], f"File set mismatch: {group}"
        for path, source in zip(local, supplied):
            assert digest(path) == digest(source), f"Source mismatch: {path.name}"
            with Image.open(path) as image:
                image.load()
                alpha = image.convert("RGBA").getchannel("A").getextrema()
                if group != "03_overlays_gradients":
                    assert image.size == (3840, 2160), f"Unexpected dimensions: {path}"
                else:
                    assert alpha[0] < 255, f"Overlay has no alpha: {path}"
                files.append({
                    "path": path.relative_to(ASSETS).as_posix(),
                    "width": image.width,
                    "height": image.height,
                    "mode": image.mode,
                    "format": image.format,
                    "has_transparency": alpha[0] < 255,
                    "alpha_range": list(alpha),
                    "bytes": path.stat().st_size,
                    "sha256": digest(path),
                    "provenance": "User-supplied replacement asset; copied byte-for-byte",
                })

    source_sheet = ASSETS / "SOURCE_APPROVED_ASSET_SHEET.png"
    assert digest(source_sheet) == digest(args.verify_source / source_sheet.name)
    release = "enhanced-" + hashlib.sha256("".join(item["sha256"] for item in files).encode()).hexdigest()[:12]
    manifest = {
        "name": "Hoa Nam Scanner — supplied replacement assets",
        "version": "2.1.0",
        "release": release,
        "source": {
            "folder": args.verify_source.name,
            "file": source_sheet.name,
            "dimensions": "1536x1024",
            "sha256": digest(source_sheet),
        },
        "note": "Images are published unchanged. Dimensions are measured; native-4K origin is not asserted.",
        "scope": list(GROUPS),
        "files": files,
    }
    (ASSETS / "ASSET_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    current = sorted(p for p in ASSETS.rglob("*") if p.is_file())
    assert len(current) == 17, f"Unexpected current pack files: {len(current)}"
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for path in current:
        target = PUBLIC / path.relative_to(ASSETS)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)

    archive = REPO / "assets" / "scanner-background-pack-v2-4k.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as pack:
        for path in current:
            pack.write(path, path.relative_to(ASSETS).as_posix())
    shutil.copyfile(archive, REPO / "docs" / "assets" / archive.name)
    with zipfile.ZipFile(archive) as pack:
        assert pack.testzip() is None
        for item in files:
            assert digest(Path(pack.extract(item["path"], REPO / ".asset-verify"))) == item["sha256"]
    shutil.rmtree(REPO / ".asset-verify")
    print(json.dumps({"release": release, "assets": len(files), "archive_entries": len(current), "archive_bytes": archive.stat().st_size, "archive_sha256": digest(archive), "source_bytes_unchanged": True}, indent=2))


if __name__ == "__main__":
    main()
