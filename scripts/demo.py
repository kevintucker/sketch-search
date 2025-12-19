import os
import sys
import json
from PIL import Image, ImageDraw

# Ensure project root on sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))


def make_demo_image(path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img = Image.new("RGB", (1280, 720), (200, 220, 240))
    d = ImageDraw.Draw(img)
    d.rectangle([540, 260, 740, 560], outline=(30, 30, 30), width=8)
    d.ellipse([600, 320, 680, 400], fill=(90, 60, 60))
    d.text((30, 30), "Demo Subject", fill=(20, 20, 20))
    img.save(path)


def main():
    ref = "data/reference_raw.png"
    make_demo_image(ref)

    # Normalize
    from sketch_search.utils.image_ops import normalize_image

    norm_path, meta = normalize_image(ref, "data/reference_image.png", "16:9")
    with open("data/reference_image.meta.json", "w") as f:
        json.dump({"aspect_ratio": meta["aspect_ratio"], "project_style_id": "demo"}, f, indent=2)

    # Scene
    from sketch_search.integrations.gemini import GeminiExtractor

    extractor = GeminiExtractor()
    scene = extractor.extract(norm_path)
    scene["reference_image_path"] = norm_path
    with open("data/scene_graph.json", "w") as f:
        json.dump(scene, f, indent=2)

    # Motion
    motion = {
        "shot_id": "shot_001",
        "duration_s": 4,
        "camera_motion": ["slow_pan"],
        "subject_motion": ["blink"],
        "background_motion": ["parallax"],
        "hard_constraints": [
            "No character identity drift",
            "No new objects",
            "No wardrobe changes",
            "No scene relighting",
        ],
    }
    with open("data/motion_plan.json", "w") as f:
        json.dump(motion, f, indent=2)

    # Keyframes
    from sketch_search.integrations.nanobanana import generate_keyframes

    kf_dir = "data/keyframes"
    paths = generate_keyframes(scene, motion, kf_dir)

    # Video
    from sketch_search.integrations.freepik_studio import generate_video_from_keyframes

    out_vid = generate_video_from_keyframes(kf_dir, motion, "data/shot_001.mp4")
    print("Demo completed:", out_vid)


if __name__ == "__main__":
    main()
