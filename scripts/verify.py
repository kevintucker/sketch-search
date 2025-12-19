import os
import json
from jsonschema import validate, Draft7Validator


ROOT = os.path.dirname(os.path.dirname(__file__))
DATA = os.path.join(ROOT, "data")


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def exists(path):
    ok = os.path.exists(path)
    print(f"exists {path}: {ok}")
    return ok


def validate_schema(doc_path, schema_path):
    doc = load_json(doc_path)
    schema = load_json(schema_path)
    Draft7Validator(schema).validate(doc)
    print(f"validated {doc_path} against {schema_path}")
    return doc


def verify_keyframes(dir_path):
    frames = [f for f in os.listdir(dir_path) if f.endswith('.png')]
    print(f"keyframes count: {len(frames)} in {dir_path}")
    assert len(frames) >= 3
    return frames


def verify_memory():
    mem_path = os.path.join(DATA, "memory.json")
    mem = load_json(mem_path)
    items = mem.get("items", [])
    print(f"memory items: {len(items)}")
    assert any(i.get("project_id") == "demo" and i.get("shot_id") == "shot_001" for i in items)


def main():
    assert exists(os.path.join(DATA, "scene_graph.json"))
    assert exists(os.path.join(DATA, "motion_plan.json"))
    assert exists(os.path.join(DATA, "keyframes"))
    assert exists(os.path.join(DATA, "shot_001.mp4")) or exists(os.path.join(DATA, "shot_001.gif"))

    validate_schema(
        os.path.join(DATA, "scene_graph.json"),
        os.path.join(ROOT, "sketch_search/schemas/scene_graph.json"),
    )
    validate_schema(
        os.path.join(DATA, "motion_plan.json"),
        os.path.join(ROOT, "sketch_search/schemas/motion_plan.json"),
    )

    verify_keyframes(os.path.join(DATA, "keyframes"))
    verify_memory()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
