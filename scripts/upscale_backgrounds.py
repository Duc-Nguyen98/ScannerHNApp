"""Create sharper delivery variants from approved raster assets.

The source pack contains a sharp 1920x1080 warehouse image and a deliberately
blurred dark thumbnail. This script derives a detailed dark grade from the
sharp source and exports 1920px and 4K delivery sizes without altering the
approved originals.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1] / "assets" / "scanner-approved"
OUT = ROOT / "01_backgrounds"
PEOPLE = ROOT / "02_people_staff"


def sharpen(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    return image.filter(ImageFilter.UnsharpMask(radius=1.25, percent=130, threshold=3))


def save_jpeg(image: Image.Image, path: Path) -> None:
    image.save(path, format="JPEG", quality=96, subsampling=0, optimize=True, progressive=True)


def dark_grade(image: Image.Image) -> Image.Image:
    image = ImageEnhance.Brightness(image).enhance(0.62)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(0.78)
    arr = np.asarray(image).astype(np.float32)
    # Preserve blue warehouse lighting while adding a restrained navy grade.
    arr *= np.array([0.86, 0.96, 1.06], dtype=np.float32)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def light_grade(image: Image.Image) -> Image.Image:
    image = ImageEnhance.Brightness(image).enhance(1.12)
    image = ImageEnhance.Contrast(image).enhance(0.98)
    return ImageEnhance.Color(image).enhance(0.92)


def main() -> None:
    main_source = Image.open(OUT / "bg_warehouse_main.jpg").convert("RGB")
    dark_1920 = dark_grade(sharpen(main_source, (1920, 1080)))
    save_jpeg(dark_1920, OUT / "bg_warehouse_dark_v2_1920.jpg")
    save_jpeg(dark_grade(sharpen(main_source, (3840, 2160))), OUT / "bg_warehouse_dark_v2_4k.jpg")

    save_jpeg(sharpen(main_source, (3840, 2160)), OUT / "bg_warehouse_main_4k.jpg")
    save_jpeg(light_grade(sharpen(main_source, (3840, 2160))), OUT / "bg_warehouse_light_v2_4k.jpg")

    for source_name, output_name in [
        ("staff_warehouse.jpg", "staff_warehouse_4k.jpg"),
        ("staff_smile.jpg", "staff_smile_4k.jpg"),
        ("staff_scan.jpg", "staff_scan_4k.jpg"),
    ]:
        source = Image.open(PEOPLE / source_name).convert("RGB")
        ratio = 3840 / source.width
        size = (3840, round(source.height * ratio))
        save_jpeg(sharpen(source, size), PEOPLE / output_name)


if __name__ == "__main__":
    main()
