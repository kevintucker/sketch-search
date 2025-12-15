from typing import Tuple
from PIL import Image, ImageFilter


def parse_aspect(aspect: str) -> Tuple[int, int]:
    w, h = aspect.split(":")
    return int(w), int(h)


def crop_to_aspect(img: Image.Image, aspect: str) -> Image.Image:
    w_ratio, h_ratio = parse_aspect(aspect)
    target_ratio = w_ratio / h_ratio
    w, h = img.size
    current_ratio = w / h if h else 1.0
    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        x0 = (w - new_w) // 2
        box = (x0, 0, x0 + new_w, h)
    else:
        new_h = int(w / target_ratio)
        y0 = (h - new_h) // 2
        box = (0, y0, w, y0 + new_h)
    return img.crop(box)


def denoise(img: Image.Image) -> Image.Image:
    return img.filter(ImageFilter.MedianFilter(size=3))


def normalize_image(input_path: str, output_path: str, aspect: str) -> Tuple[str, dict]:
    img = Image.open(input_path).convert("RGB")
    img = crop_to_aspect(img, aspect)
    img = denoise(img)
    img.save(output_path)
    meta = {"aspect_ratio": aspect}
    return output_path, meta
