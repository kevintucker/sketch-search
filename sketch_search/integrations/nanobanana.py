import os
from typing import List
from PIL import Image


def generate_keyframes(scene_json: dict, motion_json: dict, out_dir: str) -> List[str]:
    os.makedirs(out_dir, exist_ok=True)
    base_img_path = scene_json.get("reference_image_path")
    if not base_img_path or not os.path.exists(base_img_path):
        raise FileNotFoundError("reference_image_path missing in scene_json")
    base = Image.open(base_img_path).convert("RGB")

    paths = []
    w, h = base.size

    # Helper to save
    def save(img: Image.Image, idx: int):
        p = os.path.join(out_dir, f"frame_{idx:03d}.png")
        img.save(p)
        paths.append(p)

    # 1: baseline
    save(base.copy(), 1)

    # 2: small camera shift left (<=5%)
    shift_x = int(w * 0.05)
    b = base.crop((shift_x, 0, w, h)).resize((w, h))
    save(b, 2)

    # 3: small camera shift right (<=5%)
    b2 = base.crop((0, 0, w - shift_x, h)).resize((w, h))
    save(b2, 3)

    # 4: micro zoom-in (2%)
    zi = base.crop((int(w * 0.01), int(h * 0.01), int(w * 0.99), int(h * 0.99))).resize((w, h))
    save(zi, 4)

    # 5: micro zoom-out (pad with edge pixels)
    zo = base.copy().resize((int(w * 0.98), int(h * 0.98)))
    canvas = Image.new("RGB", (w, h))
    canvas.paste(zo, ((w - zo.size[0]) // 2, (h - zo.size[1]) // 2))
    save(canvas, 5)

    # 6: small vertical shift (<=5%)
    shift_y = int(h * 0.05)
    v = base.crop((0, shift_y, w, h)).resize((w, h))
    save(v, 6)

    return paths
