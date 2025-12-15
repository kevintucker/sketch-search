import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Scissors, Copy, Trash2, Play, Pause } from 'lucide-react';
import { useAppState } from '../state/AppState';

type Clip = { start: number; duration: number };
type Track = { id: number; name: string; color: string; clips: Clip[] };

export const Timeline: React.FC<{ videoUrl?: string | null }> = ({ videoUrl }) => {
  const { pipeline } = useAppState();
  const [selectedTrack, setSelectedTrack] = useState<number | null>(1);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number | null>(null);
  const [playhead, setPlayhead] = useState<number>(0);
  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, name: 'AI', color: 'from-cyber-cyan to-cyber-blue', clips: [{ start: 10, duration: 30 }, { start: 60, duration: 20 }] },
    { id: 2, name: 'CC', color: 'from-cyber-pink to-cyber-magenta', clips: [{ start: 20, duration: 25 }, { start: 70, duration: 15 }] },
    { id: 3, name: 'Audio', color: 'from-cyber-purple to-cyber-cyan', clips: [{ start: 0, duration: 90 }] },
  ]);

  const duration = 120;
  const timeMarkers = useMemo(() => Array.from({ length: 13 }, (_, i) => i * 10), []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const addClip = () => {
    if (!selectedTrack) return;
    setTracks((prev) => prev.map((t) => t.id === selectedTrack ? { ...t, clips: [...t.clips, { start: Math.min(playhead, duration - 5), duration: 5 }] } : t));
  };

  const splitClip = () => {
    if (selectedTrack == null || selectedClipIndex == null) return;
    setTracks((prev) => prev.map((t) => {
      if (t.id !== selectedTrack) return t;
      const c = t.clips[selectedClipIndex];
      if (!c) return t;
      const rel = Math.max(0, Math.min(c.duration, playhead - c.start));
      if (rel <= 0 || rel >= c.duration) return t;
      const a: Clip = { start: c.start, duration: rel };
      const b: Clip = { start: c.start + rel, duration: c.duration - rel };
      const clips = [...t.clips];
      clips.splice(selectedClipIndex, 1, a, b);
      return { ...t, clips };
    }));
  };

  const copyClip = () => {
    if (selectedTrack == null || selectedClipIndex == null) return;
    setTracks((prev) => prev.map((t) => {
      if (t.id !== selectedTrack) return t;
      const c = t.clips[selectedClipIndex];
      if (!c) return t;
      const clone: Clip = { start: Math.min(c.start + c.duration + 1, duration - c.duration), duration: c.duration };
      return { ...t, clips: [...t.clips, clone] };
    }));
  };

  const deleteClip = () => {
    if (selectedTrack == null || selectedClipIndex == null) return;
    setTracks((prev) => prev.map((t) => {
      if (t.id !== selectedTrack) return t;
      const clips = [...t.clips];
      clips.splice(selectedClipIndex, 1);
      return { ...t, clips };
    }));
    setSelectedClipIndex(null);
  };

  useEffect(() => {
    const onTU = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { seconds: number } | undefined;
      if (!detail) return;
      setPlayhead(Math.max(0, Math.min(duration, detail.seconds)));
    };
    window.addEventListener('timeline:timeUpdate', onTU as EventListener);
    return () => window.removeEventListener('timeline:timeUpdate', onTU as EventListener);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button className="cyber-button-icon" onClick={addClip}>
            <Plus size={16} />
          </button>
          <button className="cyber-button-icon" onClick={splitClip}>
            <Scissors size={16} />
          </button>
          <button className="cyber-button-icon" onClick={copyClip}>
            <Copy size={16} />
          </button>
          <button className="cyber-button-icon" onClick={deleteClip}>
            <Trash2 size={16} />
          </button>
          <button className="cyber-button-icon" onClick={() => window.dispatchEvent(new CustomEvent('timeline:control', { detail: { action: 'play' } }))}>
            <Play size={16} />
          </button>
          <button className="cyber-button-icon" onClick={() => window.dispatchEvent(new CustomEvent('timeline:control', { detail: { action: 'pause' } }))}>
            <Pause size={16} />
          </button>
        </div>
        <button className="cyber-export-button" onClick={async () => {
          if (!videoUrl) return;
          let start_s = playhead;
          let duration_s = 5;
          if (selectedTrack != null && selectedClipIndex != null) {
            const t = tracks.find((x) => x.id === selectedTrack);
            const c = t?.clips[selectedClipIndex];
            if (c) { start_s = c.start; duration_s = c.duration; }
          }
          const resp = await fetch('http://localhost:8001/api/export/clip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl.replace('http://localhost:8001','/data'), start_s, duration_s, shot_id: pipeline.shotId || 'clip' }),
          });
          if (!resp.ok) return;
          const data = await resp.json();
          const a = document.createElement('a');
          a.href = `http://localhost:8001${data.url}`;
          a.download = 'export.mp4';
          a.click();
        }}>Export</button>
      </div>

      <div className="cyber-timeline" onClick={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (e as React.MouseEvent).clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, x / rect.width));
        const seconds = Math.floor(ratio * duration);
        setPlayhead(seconds);
        window.dispatchEvent(new CustomEvent('timeline:setTime', { detail: { seconds } }));
      }}>
        <div className="flex h-6 items-end px-2">
          {timeMarkers.map((time) => (
            <div key={time} className="flex-1 text-xs text-cyber-gray text-center">
              {fmt(time)}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`cyber-track flex items-center ${selectedTrack === track.id ? 'ring-2 ring-cyber-cyan' : ''}`}
            onClick={() => { setSelectedTrack(track.id); setSelectedClipIndex(null); }}
          >
            <div className="w-16 px-2 text-xs text-cyber-light font-semibold">{track.name}</div>
            <div className="flex-1 relative h-full">
              {track.clips.map((clip, index) => (
                <button
                  key={index}
                  className={`absolute h-full bg-gradient-to-r ${track.color} rounded-sm cyber-clip ${selectedTrack === track.id && selectedClipIndex === index ? 'ring-2 ring-cyber-cyan' : ''}`}
                  style={{ left: `${(clip.start / duration) * 100}%`, width: `${(clip.duration / duration) * 100}%` }}
                  onClick={(e) => { e.stopPropagation(); setSelectedTrack(track.id); setSelectedClipIndex(index); }}
                >
                  <div className="h-full flex items-center px-2">
                    <span className="text-xs text-white font-semibold">{clip.duration}s</span>
                  </div>
                </button>
              ))}
              <div className="absolute top-0 bottom-0 w-0.5 bg-cyber-cyan cyber-glow" style={{ left: `${(playhead / duration) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-cyber-gray mt-2">
        <span>{fmt(0)}</span>
        <span>{fmt(30)}</span>
        <span>{fmt(60)}</span>
        <span>{fmt(90)}</span>
        <span>{fmt(120)}</span>
      </div>
    </div>
  );
};
