import os
import requests


BASE = 'http://localhost:8001'
ROOT = os.path.dirname(os.path.dirname(__file__))


def main():
    # Ensure we have a shot context
    img = os.path.join(ROOT, 'data/reference_image.png')
    with open(img, 'rb') as f:
        up = requests.post(f'{BASE}/api/upload', files={'file': ('reference_image.png', f, 'image/png')}, timeout=60)
    assert up.status_code == 200, up.text
    shot_id = up.json()['shot_id']

    # Send assistant message with shot context
    payload = {
        'messages': [
            {'role': 'user', 'content': 'Help me lock identity and wardrobe and set duration to 5s.'}
        ],
        'shot_id': shot_id,
    }
    r = requests.post(f'{BASE}/api/assistant', json=payload, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert 'reply' in data and isinstance(data['reply'], str) and len(data['reply']) > 0
    print('assistant reply:', data['reply'][:120])
    print('AI assistant test PASSED for', shot_id)


if __name__ == '__main__':
    main()
