import os
from typing import List
from PIL import Image
import imageio
import base64
import json
import requests
from dotenv import load_dotenv

load_dotenv()


def _gif_fallback(frames: List[str], out_path: str, duration: float):
    images = [Image.open(p).convert("RGB") for p in frames]
    images[0].save(out_path, save_all=True, append_images=images[1:], duration=duration * 1000 / len(images), loop=0)


def generate_video_from_keyframes(keyframes_dir: str, motion_json: dict, out_path: str) -> str:
    frames = sorted([os.path.join(keyframes_dir, f) for f in os.listdir(keyframes_dir) if f.endswith(".png")])
    if not frames:
        raise FileNotFoundError("No keyframes found")
    duration = float(motion_json.get("duration_s", 4))
    api_key = os.environ.get("FREEPIK_API_KEY")
    api_url = os.environ.get("FREEPIK_API_URL", "https://api.freepik.studio/generate")

    if api_key:
        try:
            imgs64 = []
            for p in frames:
                with open(p, "rb") as f:
                    imgs64.append(base64.b64encode(f.read()).decode("utf-8"))
            payload = {
                "keyframes": imgs64,
                "motion": motion_json,
                "constraints": {
                    "motion_strength": "low",
                    "camera_path": "slow",
                },
                "duration": duration,
            }
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            resp = requests.post(api_url, headers=headers, data=json.dumps(payload), timeout=30)
            if resp.status_code == 200:
                try:
                    with open(out_path, "wb") as f:
                        f.write(resp.content)
                    return out_path
                except Exception:
                    pass
        except Exception:
            pass

    try:
        writer = imageio.get_writer(
            out_path,
            format="FFMPEG",
            fps=max(1, int(len(frames) / duration)),
            codec="libx264",
            macro_block_size=1,
            pixelformat="yuv420p",
            quality=8,
        )
        for p in frames:
            writer.append_data(imageio.v3.imread(p))
        writer.close()
    except Exception:
        _gif_fallback(frames, out_path.replace(".mp4", ".gif"), duration)
    return out_path
