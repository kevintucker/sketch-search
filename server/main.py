import os
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import json
import zipfile
import subprocess
import shlex

from sketch_search.utils.image_ops import normalize_image
from sketch_search.integrations.gemini import GeminiExtractor
from sketch_search.integrations.qdrant_store import QdrantWrapper, cheap_embed
from sketch_search.integrations.nanobanana import generate_keyframes
from sketch_search.integrations.freepik_studio import generate_video_from_keyframes
import os


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"error": "Invalid file type"})
    shot_id = f"shot_{uuid.uuid4().hex[:6]}"
    project_id = "demo"
    raw_path = os.path.join(DATA_DIR, f"{shot_id}_raw.png")
    with open(raw_path, "wb") as f:
        f.write(await file.read())

    norm_path, meta = normalize_image(raw_path, os.path.join(DATA_DIR, f"{shot_id}_normalized.png"), "16:9")
    with open(os.path.join(DATA_DIR, f"{shot_id}_meta.json"), "w") as f:
        json.dump({"aspect_ratio": meta["aspect_ratio"], "project_style_id": "demo"}, f, indent=2)

    extractor = GeminiExtractor()
    scene = extractor.extract(norm_path)
    scene["reference_image_path"] = norm_path
    scene_path = os.path.join(DATA_DIR, f"{shot_id}_scene_graph.json")
    with open(scene_path, "w") as f:
        json.dump(scene, f, indent=2)

    motion = {
        "shot_id": shot_id,
        "duration_s": 5,
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
    motion_path = os.path.join(DATA_DIR, f"{shot_id}_motion_plan.json")
    with open(motion_path, "w") as f:
        json.dump(motion, f, indent=2)

    store = QdrantWrapper()
    for ch in scene.get("characters", []):
        sig_text = f"{ch.get('identity')}|{ch.get('appearance')}|{ch.get('wardrobe')}"
        store.upsert_asset({
            "project_id": project_id,
            "shot_id": shot_id,
            "kind": "character_signature",
            "character_id": ch.get("identity"),
            "embedding": cheap_embed(sig_text),
            "approved": True,
        })

    keyframes_dir = os.path.join(DATA_DIR, f"{shot_id}_keyframes")
    generate_keyframes(scene, motion, keyframes_dir)

    video1 = os.path.join(DATA_DIR, f"{shot_id}_c1.mp4")
    video2 = os.path.join(DATA_DIR, f"{shot_id}_c2.mp4")
    generate_video_from_keyframes(keyframes_dir, motion | {"variant": "c1"}, video1)
    generate_video_from_keyframes(keyframes_dir, motion | {"variant": "c2"}, video2)

    prev_canonical = store.search(project_id, "canonical_frame", {})

    return {
        "shot_id": shot_id,
        "scene_graph_url": f"/data/{os.path.basename(scene_path)}",
        "motion_plan_url": f"/data/{os.path.basename(motion_path)}",
        "keyframes_url": f"/data/{os.path.basename(keyframes_dir)}",
        "video_urls": [
            f"/data/{os.path.basename(video1)}",
            f"/data/{os.path.basename(video2)}",
        ],
        "canonical": prev_canonical,
    }


@app.get("/api/export/{shot_id}")
def export_zip(shot_id: str):
    # Collect files
    sg = os.path.join(DATA_DIR, f"{shot_id}_scene_graph.json")
    mp = os.path.join(DATA_DIR, f"{shot_id}_motion_plan.json")
    kf_dir = os.path.join(DATA_DIR, f"{shot_id}_keyframes")
    mp4 = os.path.join(DATA_DIR, f"{shot_id}.mp4")
    gif = os.path.join(DATA_DIR, f"{shot_id}.gif")

    if not os.path.exists(sg):
        return JSONResponse(status_code=404, content={"error": "Shot not found"})

    zip_path = os.path.join(DATA_DIR, f"{shot_id}_export.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        if os.path.exists(sg):
            z.write(sg, arcname=f"{shot_id}/scene_graph.json")
        if os.path.exists(mp):
            z.write(mp, arcname=f"{shot_id}/motion_plan.json")
        if os.path.isdir(kf_dir):
            for root, _, files in os.walk(kf_dir):
                for f in files:
                    p = os.path.join(root, f)
                    rel = os.path.relpath(p, DATA_DIR)
                    z.write(p, arcname=f"{shot_id}/keyframes/{os.path.basename(p)}")
        if os.path.exists(mp4):
            z.write(mp4, arcname=f"{shot_id}/video.mp4")
        elif os.path.exists(gif):
            z.write(gif, arcname=f"{shot_id}/video.gif")

    return FileResponse(zip_path, media_type="application/zip", filename=f"{shot_id}_export.zip")


def _trim_video_clip(input_path: str, start_s: float, duration_s: float, out_path: str):
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        ff = get_ffmpeg_exe()
    except Exception:
        ff = "ffmpeg"
    cmd_copy = [
        ff,
        "-hide_banner",
        "-y",
        "-ss",
        str(start_s),
        "-t",
        str(duration_s),
        "-i",
        input_path,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        out_path,
    ]
    p = subprocess.run(cmd_copy, capture_output=True)
    if p.returncode != 0:
        cmd_re = [
            ff,
            "-hide_banner",
            "-y",
            "-ss",
            str(start_s),
            "-t",
            str(duration_s),
            "-i",
            input_path,
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "23",
            "-c:a",
            "copy",
            "-movflags",
            "+faststart",
            out_path,
        ]
        subprocess.run(cmd_re, check=True)


@app.post("/api/export/clip")
def export_clip(payload: dict = Body(...)):
    video_url = payload.get("video_url")
    start_s = float(payload.get("start_s", 0))
    duration_s = float(payload.get("duration_s", 5))
    shot_id = payload.get("shot_id", "clip")
    if not video_url:
        return JSONResponse(status_code=400, content={"error": "video_url required"})
    in_name = os.path.basename(video_url)
    in_path = os.path.join(DATA_DIR, in_name)
    if not os.path.exists(in_path):
        return JSONResponse(status_code=404, content={"error": "input video not found"})
    out_path = os.path.join(DATA_DIR, f"{shot_id}_export_{int(start_s)}_{int(duration_s)}.mp4")
    _trim_video_clip(in_path, start_s, duration_s, out_path)
    return {"url": f"/data/{os.path.basename(out_path)}"}
@app.get("/api/keyframes/{shot_id}")
def list_keyframes(shot_id: str):
    dir_path = os.path.join(DATA_DIR, f"{shot_id}_keyframes")
    if not os.path.isdir(dir_path):
        return JSONResponse(status_code=404, content={"error": "Keyframes not found"})
    files = [f for f in os.listdir(dir_path) if f.lower().endswith(".png")]
    files.sort()
    return {"items": [f"/data/{os.path.basename(dir_path)}/{fn}" for fn in files]}

@app.post("/api/scene_graph/{shot_id}")
def save_scene_graph(shot_id: str, payload: dict = Body(...)):
    path = os.path.join(DATA_DIR, f"{shot_id}_scene_graph.json")
    with open(path, "w") as f:
        json.dump(payload, f, indent=2)
    return {"ok": True, "scene_graph_url": f"/data/{os.path.basename(path)}"}

@app.post("/api/motion_plan/{shot_id}")
def save_motion_plan(shot_id: str, payload: dict = Body(...)):
    path = os.path.join(DATA_DIR, f"{shot_id}_motion_plan.json")
    with open(path, "w") as f:
        json.dump(payload, f, indent=2)
    return {"ok": True, "motion_plan_url": f"/data/{os.path.basename(path)}"}

@app.post("/api/qa/canonical_frame")
def set_canonical(project_id: str = Body(...), shot_id: str = Body(...), frame_url: str = Body(...)):
    store = QdrantWrapper()
    store.upsert_asset({
        "project_id": project_id,
        "shot_id": shot_id,
        "kind": "canonical_frame",
        "frame_url": frame_url,
        "approved": True,
        "embedding": cheap_embed(frame_url),
    })
    return {"ok": True}

@app.get("/api/canonical/{project_id}")
def get_canonical(project_id: str):
    store = QdrantWrapper()
    items = store.search(project_id, "canonical_frame", {})
    return {"items": items}
@app.post("/api/assistant")
def assistant(payload: dict = Body(...)):
    msgs = payload.get("messages", [])
    shot_id = payload.get("shot_id")
    context = {}
    if shot_id:
        sg_path = os.path.join(DATA_DIR, f"{shot_id}_scene_graph.json")
        mp_path = os.path.join(DATA_DIR, f"{shot_id}_motion_plan.json")
        if os.path.exists(sg_path):
            with open(sg_path, "r") as f:
                context["scene_graph"] = json.load(f)
        if os.path.exists(mp_path):
            with open(mp_path, "r") as f:
                context["motion_plan"] = json.load(f)
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        text = "Suggest setting duration to 5s and locking identity, wardrobe, and lighting."
        return {"reply": text}
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        sys = "You are an assistant helping customize scene graph and motion plan for consistent storyboarded video. Provide concise actionable steps and JSON snippets only when applicable."
        user = msgs[-1]["content"] if msgs else "Suggest improvements"
        prompt = f"{sys}\nContext:\n{json.dumps(context)}\nUser:\n{user}"
        resp = model.generate_content(prompt)
        return {"reply": resp.text or "No response"}
    except Exception:
        return {"reply": "Assistant unavailable. Try again later."}
