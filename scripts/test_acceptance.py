import os
import json
import requests


ROOT = os.path.dirname(os.path.dirname(__file__))
DATA = os.path.join(ROOT, 'data')
BASE = 'http://localhost:8001'


def upload_reference():
    path = os.path.join(DATA, 'reference_image.png')
    with open(path, 'rb') as f:
        r = requests.post(f'{BASE}/api/upload', files={'file': ('reference_image.png', f, 'image/png')}, timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


def verify_scene_graph(shot, scene_graph_url):
    sg = requests.get(f'{BASE}{scene_graph_url}', timeout=30).json()
    assert 'characters' in sg and isinstance(sg['characters'], list)
    assert 'environment' in sg and 'location' in sg['environment']
    # Save edit (mood_style + constraint)
    sg['mood_style'] = ['cinematic', 'stable']
    if 'constraints' in sg:
        must = set(sg['constraints'].get('must_not_change', []))
        must.update(['face', 'wardrobe', 'lighting'])
        sg['constraints']['must_not_change'] = list(must)
    else:
        sg['constraints'] = {'must_not_change': ['face', 'wardrobe', 'lighting']}
    r = requests.post(f'{BASE}/api/scene_graph/{shot}', json=sg, timeout=30)
    assert r.status_code == 200, r.text
    sg2 = requests.get(f'{BASE}{scene_graph_url}', timeout=30).json()
    assert sg2.get('mood_style') == ['cinematic', 'stable']
    return sg2


def verify_motion_plan(shot, motion_plan_url):
    mp = requests.get(f'{BASE}{motion_plan_url}', timeout=30).json()
    mp['duration_s'] = 5
    r = requests.post(f'{BASE}/api/motion_plan/{shot}', json=mp, timeout=30)
    assert r.status_code == 200, r.text
    return mp


def verify_keyframes_and_candidates(shot, video_urls):
    kf = requests.get(f'{BASE}/api/keyframes/{shot}', timeout=30).json()
    items = kf.get('items', [])
    assert len(items) >= 6, f'expected >=6 keyframes, got {len(items)}'
    assert isinstance(video_urls, list) and len(video_urls) >= 2, f'expected >=2 candidates, got {video_urls}'
    return [f'{BASE}{u}' for u in items]


def approve_canonical(shot, frame_url):
    r = requests.post(f'{BASE}/api/qa/canonical_frame', json={'project_id':'demo','shot_id':shot,'frame_url':frame_url}, timeout=30)
    assert r.status_code == 200
    can = requests.get(f'{BASE}/api/canonical/demo', timeout=30).json()['items']
    assert any(c.get('frame_url') == frame_url for c in can)
    return can


def export_clip(shot, video_url):
    payload = {'video_url': video_url.replace(BASE, ''), 'start_s': 0, 'duration_s': 3, 'shot_id': shot}
    r = requests.post(f'{BASE}/api/export/clip', json=payload, timeout=60)
    assert r.status_code == 200, r.text
    url = f"{BASE}{r.json()['url']}"
    rv = requests.get(url, stream=True, timeout=30)
    assert rv.status_code == 200 and rv.headers.get('content-type','').startswith('video/')
    return url


def export_zip(shot):
    r = requests.get(f'{BASE}/api/export/{shot}', stream=True, timeout=60)
    assert r.status_code == 200 and r.headers.get('content-type') == 'application/zip'


def main():
    print('--- Shot 01 ---')
    data1 = upload_reference()
    shot1 = data1['shot_id']
    sg1 = verify_scene_graph(shot1, data1['scene_graph_url'])
    mp1 = verify_motion_plan(shot1, data1['motion_plan_url'])
    kfs1 = verify_keyframes_and_candidates(shot1, data1['video_urls'])
    clip_url = export_clip(shot1, f"{BASE}{data1['video_urls'][0]}")
    export_zip(shot1)
    approve_canonical(shot1, kfs1[0])

    print('--- Shot 02 ---')
    data2 = upload_reference()
    shot2 = data2['shot_id']
    can = requests.get(f'{BASE}/api/canonical/demo', timeout=30).json()['items']
    assert len(can) >= 1, 'canonical should exist from Shot 01'

    print('ALL ACCEPTANCE CHECKS PASSED')


if __name__ == '__main__':
    main()
