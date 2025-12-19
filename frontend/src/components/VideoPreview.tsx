import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export const VideoPreview: React.FC<{ videoUrl?: string | null }> = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setCurrentTime(newTime);
    if (videoUrl && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const onSetTime = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { seconds: number } | undefined;
      if (!detail || !videoRef.current) return;
      videoRef.current.currentTime = detail.seconds;
    };
    const onControl = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { action: 'play' | 'pause' } | undefined;
      if (!detail || !videoRef.current) return;
      if (detail.action === 'play') videoRef.current.play(); else videoRef.current.pause();
    };
    window.addEventListener('timeline:setTime', onSetTime as EventListener);
    window.addEventListener('timeline:control', onControl as EventListener);
    return () => {
      window.removeEventListener('timeline:setTime', onSetTime as EventListener);
      window.removeEventListener('timeline:control', onControl as EventListener);
    };
  }, []);

  return (
    <div className="cyber-video-preview p-4">
      {/* Video or Placeholder */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          className="rounded-lg w-full h-64 mb-4"
          onLoadedMetadata={(e) => setDuration(Math.floor((e.target as HTMLVideoElement).duration || 120))}
          onTimeUpdate={(e) => {
            const t = Math.floor((e.target as HTMLVideoElement).currentTime || 0);
            setCurrentTime(t);
            window.dispatchEvent(new CustomEvent('timeline:timeUpdate', { detail: { seconds: t } }));
          }}
        />
      ) : (
        <div className="bg-gradient-to-br from-cyber-navy to-cyber-purple rounded-lg h-64 flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/20 to-cyber-pink/20 animate-pulse"></div>
          <div className="text-center z-10">
            <div className="cyber-node w-20 h-20 mx-auto mb-4">
              <Play size={24} />
            </div>
            <p className="text-cyber-cyan cyber-font">Video Preview</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button className="cyber-button-icon">
          <SkipBack size={16} />
        </button>
        
        <button 
          onClick={togglePlay}
          className="cyber-button-icon w-12 h-12 bg-cyber-cyan hover:bg-cyber-blue"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button className="cyber-button-icon">
          <SkipForward size={16} />
        </button>

        <div className="flex-1 mx-4">
          <div className="cyber-progress-bar">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-transparent appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-cyber-gray mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button className="cyber-button-icon">
          <Volume2 size={16} />
        </button>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="cyber-export-button" onClick={() => {
          if (!videoUrl) return;
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = 'shot.mp4';
          a.click();
        }}>
          Export Video
        </button>
      </div>
    </div>
  );
};
