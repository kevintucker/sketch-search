# Image→Scene Graph→Video Pipeline

This project implements a pragmatic pipeline to convert a reference image into a storyboarded video using a structured approach:

- Shots, not full videos, as the unit of work
- Image normalization → Scene Graph → Motion Plan → Asset memory → Keyframes → Constrained img→video → Consistency loop → Stitch

## Quick Start

1. Ensure you have Python 3.10+
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run the demo to generate a full pass with a synthetic reference image:
   - `python scripts/demo.py`

## CLI Usage

All steps can be run via the pipeline CLI:

```bash
python scripts/pipeline.py normalize-image --input path/to/ref.png --aspect 16:9 --out data/reference_image.png
python scripts/pipeline.py extract-scene --input data/reference_image.png --out data/scene_graph.json
python scripts/pipeline.py motion-plan --shot_id shot_001 --duration 5 --out data/motion_plan.json
python scripts/pipeline.py index-assets --project_id demo --shot_id shot_001
python scripts/pipeline.py generate-keyframes --scene data/scene_graph.json --motion data/motion_plan.json --out data/keyframes
python scripts/pipeline.py generate-video --keyframes data/keyframes --motion data/motion_plan.json --out data/shot_001.mp4
python scripts/pipeline.py score-and-update --video data/shot_001.mp4 --scene data/scene_graph.json --update_memory
python scripts/pipeline.py stitch --inputs data/shot_001.mp4 data/shot_002.mp4 --out data/final_sequence.mp4
```

## Configuration

- Gemini API key: set `GOOGLE_API_KEY` in your environment to enable scene decomposition.
- Qdrant: set `QDRANT_URL` and `QDRANT_API_KEY`. Local default is `http://localhost:6333`. If unset, a local file-backed store is used.
- Freepik Studio: set `FREEPIK_API_KEY` and optionally `FREEPIK_API_URL` for remote img→video. Falls back to local MP4/GIF if unavailable.

## Project Layout

```
sketch_search/
  integrations/
    gemini.py            # Scene graph extraction via Gemini (with stub fallback)
    qdrant_store.py      # Qdrant client wrapper with local fallback
    nanobanana.py        # Keyframe generation stubs
    freepik_studio.py    # Img→video stub with motion constraints
  schemas/
    scene_graph.json     # JSON Schema for scene graphs
    motion_plan.json     # JSON Schema for motion plans
    models.py            # Python dataclasses + helpers
  utils/
    image_ops.py         # Normalization utilities
scripts/
  pipeline.py            # CLI orchestrator for steps
  demo.py                # Synthetic end-to-end demo
data/                    # Outputs and local memory
```

## Notes

- External services (Gemini, Qdrant, Freepik Studio) are integrated behind safe stubs.
- Video generation uses a GIF fallback when a system `ffmpeg` is not available.

## Assistant & Interactive UI

- Assistant: Toggle from header; dock to right-side drawer for guidance on scene/motion customization. Backend endpoint: `POST /api/assistant`.
- Interactive Scene Graph: Click nodes to view details and drag to reposition for exploratory layout.
- Search Modal: Quick navigation and actions (open assistant, export ZIP for current shot).

## Acceptance Tests

- `python3 scripts/test_acceptance.py` → full pipeline validation
- `python3 scripts/test_scene_graph_verify.py` → scene graph persistence
- `python3 scripts/test_assistant.py` → assistant endpoint reply

## Publish to GitHub

1. Initialize and commit locally:
   ```
   git init
   git add .
   git commit -m "Initial public release: Sketch Search MVP"
   ```
2. If using GitHub CLI and already authenticated:
   ```
   gh repo create kevintucker/sketch-search --public --source . --remote origin --push --confirm
   ```
3. Or create a repo named `sketch-search` on GitHub, then:
   ```
   git remote add origin https://github.com/kevintucker/sketch-search.git
   git branch -M main
   git push -u origin main
   ```
