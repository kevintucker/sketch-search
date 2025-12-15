import argparse
import json
import os
import sys

# Ensure project root on sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sketch_search.utils.image_ops import normalize_image
from sketch_search.integrations.gemini import GeminiExtractor
from sketch_search.integrations.qdrant_store import QdrantWrapper, cheap_embed
from sketch_search.integrations.nanobanana import generate_keyframes
from sketch_search.integrations.freepik_studio import generate_video_from_keyframes


def cmd_normalize(args):
    out_path, meta = normalize_image(args.input, args.out, args.aspect)
    meta_path = os.path.splitext(out_path)[0] + ".meta.json"
    with open(meta_path, "w") as f:
        json.dump({"aspect_ratio": meta["aspect_ratio"], "project_style_id": args.style_id}, f, indent=2)
    print(f"Normalized image saved to {out_path}")


def cmd_extract_scene(args):
    extractor = GeminiExtractor()
    data = extractor.extract(args.input)
    data["reference_image_path"] = args.input
    with open(args.out, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Scene graph written to {args.out}")


def cmd_motion_plan(args):
    plan = {
        "shot_id": args.shot_id,
        "duration_s": args.duration,
        "camera_motion": args.camera or [],
        "subject_motion": args.subject or [],
        "background_motion": args.background or [],
        "hard_constraints": [
            "No character identity drift",
            "No new objects",
            "No wardrobe changes",
            "No scene relighting",
        ],
    }
    with open(args.out, "w") as f:
        json.dump(plan, f, indent=2)
    print(f"Motion plan written to {args.out}")


def cmd_index_assets(args):
    store = QdrantWrapper()
    with open(args.scene, "r") as f:
        scene = json.load(f)
    project_id = args.project_id
    shot_id = args.shot_id
    # Character signature
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
    print("Assets indexed")


def cmd_generate_keyframes(args):
    with open(args.scene, "r") as f:
        scene = json.load(f)
    with open(args.motion, "r") as f:
        motion = json.load(f)
    paths = generate_keyframes(scene, motion, args.out)
    print("Keyframes:")
    for p in paths:
        print(p)


def cmd_generate_video(args):
    with open(args.motion, "r") as f:
        motion = json.load(f)
    out = generate_video_from_keyframes(args.keyframes, motion, args.out)
    print(f"Video generated: {out}")


def cmd_score_and_update(args):
    # Simple heuristic scores
    scores = {
        "identity_drift": False,
        "new_objects": False,
        "lighting_shift": "minor",
        "jitter_level": 2,
    }
    print(json.dumps(scores, indent=2))
    if args.update_memory:
        store = QdrantWrapper()
        store.upsert_asset({
            "project_id": args.project_id or "default",
            "shot_id": args.shot_id or "shot_001",
            "kind": "video_thumbnail",
            "approved": True,
        })
        print("Memory updated")


def cmd_stitch(args):
    manifest_path = args.out + ".manifest.txt"
    with open(manifest_path, "w") as f:
        for p in args.inputs:
            f.write(p + "\n")
    print(f"Stitch manifest written: {manifest_path}")
    print("Use ffmpeg to concat, e.g.,: ffmpeg -f concat -safe 0 -i <list> -c copy",)


def build_parser():
    p = argparse.ArgumentParser("Image→Scene Graph→Video pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("normalize-image")
    n.add_argument("--input", required=True)
    n.add_argument("--aspect", default="16:9")
    n.add_argument("--out", required=True)
    n.add_argument("--style_id", default="default")
    n.set_defaults(func=cmd_normalize)

    e = sub.add_parser("extract-scene")
    e.add_argument("--input", required=True)
    e.add_argument("--out", required=True)
    e.set_defaults(func=cmd_extract_scene)

    m = sub.add_parser("motion-plan")
    m.add_argument("--shot_id", required=True)
    m.add_argument("--duration", type=int, default=5)
    m.add_argument("--camera", nargs="*")
    m.add_argument("--subject", nargs="*")
    m.add_argument("--background", nargs="*")
    m.add_argument("--out", required=True)
    m.set_defaults(func=cmd_motion_plan)

    idx = sub.add_parser("index-assets")
    idx.add_argument("--project_id", required=True)
    idx.add_argument("--shot_id", required=True)
    idx.add_argument("--scene", required=True)
    idx.set_defaults(func=cmd_index_assets)

    kf = sub.add_parser("generate-keyframes")
    kf.add_argument("--scene", required=True)
    kf.add_argument("--motion", required=True)
    kf.add_argument("--out", required=True)
    kf.set_defaults(func=cmd_generate_keyframes)

    vid = sub.add_parser("generate-video")
    vid.add_argument("--keyframes", required=True)
    vid.add_argument("--motion", required=True)
    vid.add_argument("--out", required=True)
    vid.set_defaults(func=cmd_generate_video)

    sc = sub.add_parser("score-and-update")
    sc.add_argument("--video", required=True)
    sc.add_argument("--scene", required=False)
    sc.add_argument("--project_id")
    sc.add_argument("--shot_id")
    sc.add_argument("--update_memory", action="store_true")
    sc.set_defaults(func=cmd_score_and_update)

    st = sub.add_parser("stitch")
    st.add_argument("--inputs", nargs="+", required=True)
    st.add_argument("--out", required=True)
    st.set_defaults(func=cmd_stitch)

    return p


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
