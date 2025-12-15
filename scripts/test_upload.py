import os
import json
import requests


def main():
    url = "http://localhost:8001/api/upload"
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data/reference_image.png")
    with open(path, "rb") as f:
        files = {"file": ("reference_image.png", f, "image/png")}
        r = requests.post(url, files=files, timeout=60)
    print(r.status_code)
    print(r.text)


if __name__ == "__main__":
    main()
