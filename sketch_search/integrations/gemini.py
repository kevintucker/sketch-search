import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


def _stub_scene_graph() -> Dict[str, Any]:
    return {
        "characters": [
            {
                "identity": "primary_subject",
                "appearance": {"hair": "brown", "age": "adult"},
                "pose": "standing",
                "expression": "neutral",
                "wardrobe": {"top": "jacket", "bottom": "jeans"},
            }
        ],
        "props": [
            {"name": "bag", "placement": "right_hand", "tags": ["leather"]}
        ],
        "environment": {
            "location": "street",
            "materials": ["concrete", "glass"],
            "weather": "clear",
            "time_of_day": "day",
        },
        "camera": {
            "shot_type": "medium",
            "focal_length": "50mm",
            "angle": "eye_level",
            "framing": "center",
            "depth_of_field": "shallow",
        },
        "lighting": {
            "key": "sun",
            "fill": "ambient",
            "rim": "none",
            "direction": "front",
            "softness": "hard",
            "color_temperature": "5500K",
        },
        "mood_style": ["cinematic", "minimal"],
        "constraints": {"must_not_change": ["face", "wardrobe"]},
    }


class GeminiExtractor:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        self._client = None
        if self.api_key:
            try:
                import google.generativeai as genai

                genai.configure(api_key=self.api_key)
                self._client = genai
            except Exception:
                self._client = None

    def extract(self, image_path: str) -> Dict[str, Any]:
        if not self._client:
            return _stub_scene_graph()
        try:
            model = self._client.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "Extract a structured Scene Graph JSON with keys: characters, props, environment, "
                "camera, lighting, mood_style, constraints. Keep concise but explicit values."
            )
            with open(image_path, "rb") as f:
                img_bytes = f.read()
            resp = model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": img_bytes},
            ])
            text = resp.text
            import json

            data = json.loads(text)
            return data
        except Exception:
            return _stub_scene_graph()
