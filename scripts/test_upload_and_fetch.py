import os
import json
import requests


def main():
    url = "http://localhost:8001/api/upload"
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data/reference_image.png")
    with open(path, "rb") as f:
        files = {"file": ("reference_image.png", f, "image/png")}
        r = requests.post(url, files=files, timeout=120)
    print("upload status", r.status_code)
    data = r.json()
    print("payload", data)
    video_url = f"http://localhost:8001{data['video_url']}"
    rv = requests.get(video_url, stream=True, timeout=60)
    print("video status", rv.status_code)
    print("content-type", rv.headers.get("content-type"))
    size = 0
    for chunk in rv.iter_content(chunk_size=8192):
        size += len(chunk)
        if size > 100000:
            break
    print("read bytes", size)


if __name__ == "__main__":
    main()
