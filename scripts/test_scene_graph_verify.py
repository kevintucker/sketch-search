import os
import requests
import json


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    sample = os.path.join(root, 'data/reference_image.png')
    with open(sample, 'rb') as f:
        r = requests.post('http://localhost:8001/api/upload', files={'file': ('reference_image.png', f, 'image/png')})
    assert r.status_code == 200, r.text
    data = r.json()
    shot = data['shot_id']
    sg_url = f"http://localhost:8001{data['scene_graph_url']}"
    sg = requests.get(sg_url).json()
    # Basic checks
    assert 'characters' in sg and isinstance(sg['characters'], list)
    assert 'environment' in sg and 'location' in sg['environment']
    assert 'camera' in sg and 'shot_type' in sg['camera']

    # Save an edit (mood_style and constraints only)
    sg_edit = dict(sg)
    sg_edit['mood_style'] = ['cinematic', 'stable']
    if 'constraints' in sg_edit:
        must = set(sg_edit['constraints'].get('must_not_change', []))
        must.update(['face', 'wardrobe', 'lighting'])
        sg_edit['constraints']['must_not_change'] = list(must)
    else:
        sg_edit['constraints'] = {'must_not_change': ['face', 'wardrobe', 'lighting']}

    r2 = requests.post(f'http://localhost:8001/api/scene_graph/{shot}', json=sg_edit)
    assert r2.status_code == 200, r2.text
    # Re-fetch to verify persistence
    sg2 = requests.get(sg_url).json()
    assert sg2.get('mood_style') == ['cinematic', 'stable']
    print('Scene graph verified for', shot)


if __name__ == '__main__':
    main()
