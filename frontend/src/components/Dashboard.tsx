import React, { useState, useCallback } from 'react';
import { Upload, Sparkles, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { SceneGraph } from './SceneGraph';
import { Timeline } from './Timeline';
import { VideoPreview } from './VideoPreview';
import { useAppState } from '../state/AppState';
import { MotionPlanner } from './MotionPlanner';

export const Dashboard: React.FC = () => {
  const { setPipeline, pipeline } = useAppState();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sceneGraph, setSceneGraph] = useState<any>(null);
  const [motionPlan, setMotionPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [keyframes, setKeyframes] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setUploadedImage(e.target?.result as string);
        await uploadToBackend(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    noClick: true,
  });

  const uploadToBackend = async (file: File) => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('http://localhost:8001/api/upload', {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) throw new Error('Upload failed');
      const data = await resp.json();
      const vids = (data.video_urls || []).map((u: string) => `http://localhost:8001${u}`);
      setVideoUrls(vids);
      setVideoUrl(vids[0] || null);
      setPipeline({
        shotId: data.shot_id,
        sceneGraphUrl: data.scene_graph_url ? `http://localhost:8001${data.scene_graph_url}` : null,
        motionPlanUrl: data.motion_plan_url ? `http://localhost:8001${data.motion_plan_url}` : null,
        keyframesUrl: data.keyframes_url ? `http://localhost:8001${data.keyframes_url}` : null,
        videoUrl: vids[0] || null,
      });
      // Load scene graph if available
      if (data.scene_graph_url) {
        const sgResp = await fetch(`http://localhost:8001${data.scene_graph_url}`);
        const sg = await sgResp.json();
        setSceneGraph(sg);
      }
      if (data.motion_plan_url) {
        const mpResp = await fetch(`http://localhost:8001${data.motion_plan_url}`);
        const mp = await mpResp.json();
        setMotionPlan(mp);
      }
      if (data.shot_id) {
        const kfResp = await fetch(`http://localhost:8001/api/keyframes/${data.shot_id}`);
        const kf = await kfResp.json();
        const arr = (kf.items || []).map((x: string) => `http://localhost:8001${x}`);
        setKeyframes(arr);
        setSelectedFrame(arr[0] || null);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Upload error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Drag & Drop */}
        <div className="cyber-card p-6">
          <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-4">Image Input</h2>
          
          <div
            {...getRootProps()}
            className={`cyber-drag-drop p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'drag-over' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-full max-h-48 mx-auto rounded-lg shadow-lg"
                />
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="text-cyber-cyan animate-pulse" size={20} />
                  <span className="text-cyber-cyan">
                    {isGenerating ? 'Generating Scene Graph...' : 'Scene Graph Generated'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto text-cyber-cyan" size={48} />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-cyber-light">
                    Drag & Drop Images or
                  </p>
                  <p className="text-cyber-cyan cyber-font">
                    AI Generation Request Here
                  </p>
                </div>
                <button className="cyber-button" onClick={() => open()}>
                  <Sparkles className="inline mr-2" size={16} />
                  Generative Art
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Scene Graph */}
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="cyber-font text-xl font-bold text-cyber-cyan">Scene Graph</h2>
            <span className="text-cyber-light">•••</span>
          </div>
          {errorMsg && (
            <div className="text-red-400 mb-2">{errorMsg}</div>
          )}
          <SceneGraph data={sceneGraph} isLoading={isGenerating} />
          {sceneGraph && (
            <div className="mt-4">
              <textarea className="cyber-input w-full h-40" defaultValue={JSON.stringify(sceneGraph, null, 2)} id="sg-edit" />
              <button className="cyber-button mt-2" onClick={async () => {
                const val = (document.getElementById('sg-edit') as HTMLTextAreaElement).value;
                const payload = JSON.parse(val);
                if (!pipeline?.shotId) return;
                await fetch(`http://localhost:8001/api/scene_graph/${pipeline.shotId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              }}>Save Scene Graph</button>
            </div>
          )}
        </div>
      </div>

      {/* Video Preview */}
      <div className="cyber-card p-6">
        <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-4">Video Preview</h2>
        <div className="flex space-x-2 mb-4">
          {videoUrls.map((u, i) => (
            <button key={u} className={`cyber-button ${videoUrl === u ? 'ring-2 ring-cyber-cyan' : ''}`} onClick={() => setVideoUrl(u)}>Candidate {i+1}</button>
          ))}
        </div>
        <VideoPreview videoUrl={videoUrl} />
      </div>

      {/* Timeline */}
      <div className="cyber-card p-6">
        <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-4">Timeline</h2>
        <Timeline videoUrl={videoUrl} />
        {keyframes.length > 0 && (
          <div className="mt-4">
            <h3 className="cyber-font text-cyber-light mb-2">Keyframes</h3>
            <div className="grid grid-cols-6 gap-2">
              {keyframes.map((k) => (
                <button key={k} className={`relative ${selectedFrame === k ? 'ring-2 ring-cyber-cyan' : ''}`} onClick={() => setSelectedFrame(k)}>
                  <img src={k} className="rounded" />
                </button>
              ))}
            </div>
            <button className="cyber-button mt-3" onClick={async () => {
              if (!selectedFrame || !pipeline?.shotId) return;
              await fetch('http://localhost:8001/api/qa/canonical_frame', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: 'demo', shot_id: pipeline.shotId, frame_url: selectedFrame }) });
            }}>Approve Canonical</button>
          </div>
        )}
      </div>

      <div className="cyber-card p-6">
        <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-4">Motion Plan</h2>
        <MotionPlanner value={motionPlan || { duration_s: 5, camera_motion: ['slow_pan'], subject_motion: ['blink'], background_motion: ['parallax'], hard_constraints: ['No character identity drift','No new objects','No wardrobe changes','No scene relighting'] }} onSave={(p) => setMotionPlan(p)} />
      </div>
    </div>
  );
};
