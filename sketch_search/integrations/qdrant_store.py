import os
import json
import hashlib
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()


class MemoryStore:
    def __init__(self, base_path: str = "data/memory.json"):
        self.base_path = base_path
        os.makedirs(os.path.dirname(self.base_path), exist_ok=True)
        if not os.path.exists(self.base_path):
            with open(self.base_path, "w") as f:
                json.dump({"items": []}, f)

    def _load(self):
        with open(self.base_path, "r") as f:
            return json.load(f)

    def _save(self, data):
        with open(self.base_path, "w") as f:
            json.dump(data, f, indent=2)

    def upsert(self, item: Dict[str, Any]):
        data = self._load()
        data["items"].append(item)
        self._save(data)

    def query(self, project_id: str, kind: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        data = self._load()
        results = []
        for it in data.get("items", []):
            if it.get("project_id") != project_id:
                continue
            if it.get("kind") != kind:
                continue
            ok = True
            for k, v in filters.items():
                if it.get(k) != v:
                    ok = False
                    break
            if ok:
                results.append(it)
        return results


def cheap_embed(text: str) -> List[float]:
    h = hashlib.sha256(text.encode("utf-8")).digest()
    return [b / 255.0 for b in h[:32]]


class QdrantWrapper:
    def __init__(self):
        self.url = os.environ.get("QDRANT_URL")
        self.api_key = os.environ.get("QDRANT_API_KEY")
        self.client = None
        if self.url and self.api_key:
            try:
                from qdrant_client import QdrantClient
                self.client = QdrantClient(url=self.url, api_key=self.api_key)
            except Exception:
                self.client = None
        self.fallback = MemoryStore()

    def _ensure_collection(self, name: str = "assets", vector_size: int = 32):
        if not self.client:
            return
        try:
            from qdrant_client.models import Distance, VectorParams
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )
        except Exception:
            # Collection may already exist or server unavailable
            pass

    def upsert_asset(self, metadata: Dict[str, Any]):
        # Always write to local fallback memory
        self.fallback.upsert(metadata)
        if self.client:
            try:
                self._ensure_collection()
                from qdrant_client.models import PointStruct
                # Use provided embedding or derive from text fields
                vec = metadata.get("embedding")
                if vec is None:
                    text = json.dumps(metadata, sort_keys=True)
                    vec = cheap_embed(text)
                pid = int.from_bytes(hashlib.sha256(json.dumps(metadata, sort_keys=True).encode("utf-8")).digest()[:8], "big")
                self.client.upsert(
                    collection_name="assets",
                    points=[PointStruct(id=pid, vector=vec, payload=metadata)],
                )
            except Exception:
                # Fall back silently
                pass

    def search(self, project_id: str, kind: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        # For simplicity, use fallback memory for deterministic filtering.
        return self.fallback.query(project_id, kind, filters)
