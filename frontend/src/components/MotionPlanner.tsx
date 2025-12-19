import React, { useEffect, useState } from 'react';
import { useAppState } from '../state/AppState';

type Plan = {
  shot_id?: string;
  duration_s: number;
  camera_motion: string[];
  subject_motion: string[];
  background_motion: string[];
  hard_constraints: string[];
};

const camOptions = [
  { key: 'none', label: 'None' },
  { key: 'pan', label: 'Pan' },
  { key: 'tilt', label: 'Tilt' },
  { key: 'dolly', label: 'Dolly' },
  { key: 'orbit', label: 'Orbit' },
];

const subjectOptions = [
  { key: 'micro', label: 'Micro (blink/breath)', value: 'blink' },
  { key: 'small', label: 'Small (head turn)', value: 'head_turn' },
  { key: 'medium', label: 'Medium (walk)', value: 'walk' },
];

const bgOptions = ['parallax', 'particles', 'wind', 'water'];

export const MotionPlanner: React.FC<{ value?: Plan; onSave?: (p: Plan) => void }> = ({ value, onSave }) => {
  const { pipeline } = useAppState();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
  const [duration, setDuration] = useState<number>(value?.duration_s || 5);
  const [camera, setCamera] = useState<string>(value?.camera_motion?.[0] || 'slow_pan');
  const [subject, setSubject] = useState<string>(value?.subject_motion?.[0] || 'blink');
  const [background, setBackground] = useState<string[]>(value?.background_motion || ['parallax']);
  const [noDrift, setNoDrift] = useState<boolean>(true);
  const [noProps, setNoProps] = useState<boolean>(true);
  const [noWardrobe, setNoWardrobe] = useState<boolean>(true);
  const [noRelight, setNoRelight] = useState<boolean>(true);

  useEffect(() => {
    if (value) {
      setDuration(value.duration_s);
      setCamera(value.camera_motion?.[0] || 'slow_pan');
      setSubject(value.subject_motion?.[0] || 'blink');
      setBackground(value.background_motion || []);
    }
  }, [value]);

  const toPlan = (): Plan => ({
    shot_id: pipeline.shotId || undefined,
    duration_s: duration,
    camera_motion: [camera.startsWith('slow_') ? camera : `slow_${camera}`],
    subject_motion: [subject],
    background_motion: background,
    hard_constraints: [
      ...(noDrift ? ['No character identity drift'] : []),
      ...(noProps ? ['No new objects'] : []),
      ...(noWardrobe ? ['No wardrobe changes'] : []),
      ...(noRelight ? ['No scene relighting'] : []),
    ],
  });

  const save = async () => {
    const plan = toPlan();
    if (!pipeline.shotId) return;
    await fetch(`${API_BASE}/api/motion_plan/${pipeline.shotId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan)
    });
    onSave && onSave(plan);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cyber-light mb-2">Duration</label>
          <input type="range" min={3} max={8} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full" />
          <div className="text-xs text-cyber-gray mt-1">{duration}s</div>
        </div>
        <div>
          <label className="block text-sm text-cyber-light mb-2">Camera Motion</label>
          <select className="cyber-input w-full" value={camera.replace('slow_','')} onChange={(e) => setCamera(`slow_${e.target.value}`)}>
            {camOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-cyber-light mb-2">Subject Motion</label>
          <select className="cyber-input w-full" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjectOptions.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-cyber-light mb-2">Background Motion</label>
          <div className="flex flex-wrap gap-2">
            {bgOptions.map(b => (
              <label key={b} className="flex items-center">
                <input type="checkbox" className="mr-2" checked={background.includes(b)} onChange={(e) => {
                  const checked = e.target.checked;
                  setBackground(prev => checked ? [...prev, b] : prev.filter(x => x !== b));
                }} />
                <span className="text-cyber-light text-sm capitalize">{b}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center"><input type="checkbox" className="mr-2" checked={noDrift} onChange={(e) => setNoDrift(e.target.checked)} /><span className="text-cyber-light text-sm">No identity drift</span></label>
        <label className="flex items-center"><input type="checkbox" className="mr-2" checked={noProps} onChange={(e) => setNoProps(e.target.checked)} /><span className="text-cyber-light text-sm">No new props</span></label>
        <label className="flex items-center"><input type="checkbox" className="mr-2" checked={noWardrobe} onChange={(e) => setNoWardrobe(e.target.checked)} /><span className="text-cyber-light text-sm">No wardrobe change</span></label>
        <label className="flex items-center"><input type="checkbox" className="mr-2" checked={noRelight} onChange={(e) => setNoRelight(e.target.checked)} /><span className="text-cyber-light text-sm">No lighting change</span></label>
      </div>

      <div className="flex justify-end">
        <button className="cyber-button" onClick={save}>Save Motion Plan</button>
      </div>
    </div>
  );
};
