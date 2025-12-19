#!/usr/bin/env python3
"""
Quick sandbox test: POST a sample image to the backend and verify response.
"""
import sys, os, json, requests, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_PATH = os.path.join(ROOT, 'data', 'reference_image.png')
URL = 'http://localhost:8001/api/upload'

def main():
    if not os.path.exists(IMAGE_PATH):
        print(f'[SKIP] {IMAGE_PATH} not found – place any test PNG there.')
        return

    print(f'[POST] {URL}  <<  {IMAGE_PATH}')
    with open(IMAGE_PATH, 'rb') as f:
        resp = requests.post(URL, files={'file': f}, timeout=30)

    print(f'[HTTP] {resp.status_code}  {len(resp.content)} bytes')
    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
        # basic sanity
        assert 'shot_id' in data
        assert 'video_url' in data
        print('[PASS] backend upload → pipeline → JSON response')
    except Exception as e:
        print('[FAIL]', e)
        sys.exit(1)

if __name__ == '__main__':
    main()