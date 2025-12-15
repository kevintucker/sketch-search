import React, { useMemo, useRef, useState } from 'react';
import { Loader2, Info } from 'lucide-react';

interface SceneGraphProps {
  data: any;
  isLoading: boolean;
}

export const SceneGraph: React.FC<SceneGraphProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-cyber-cyan" size={32} />
        <span className="ml-3 text-cyber-cyan">Generating scene graph...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-cyber-gray">
        <p>Upload an image to generate scene graph</p>
      </div>
    );
  }

  const initial = useMemo(() => {
    const char = (data.characters && data.characters[0]?.identity) || 'Character';
    const env = (data.environment && data.environment.location) || 'Environment';
    const prop = (data.props && data.props[0]?.name) || 'Prop';
    const cam = (data.camera && data.camera.shot_type) || 'Camera';
    const light = (data.lighting && (data.lighting.key || data.lighting.direction)) || 'Lighting';
    return [
      { id: 'character', name: char, color: 'from-cyber-cyan to-cyber-blue', position: { x: 50, y: 20 } },
      { id: 'environment', name: env, color: 'from-cyber-purple to-cyber-pink', position: { x: 20, y: 60 } },
      { id: 'camera', name: cam, color: 'from-cyber-blue to-cyber-cyan', position: { x: 80, y: 20 } },
      { id: 'lighting', name: light, color: 'from-cyber-pink to-cyber-magenta', position: { x: 80, y: 60 } },
      { id: 'prop', name: prop, color: 'from-cyber-cyan to-cyber-pink', position: { x: 35, y: 100 } },
      { id: 'video', name: 'Video', color: 'from-cyber-cyan to-cyber-purple', position: { x: 50, y: 85 } },
    ];
  }, [data]);
  const [nodes, setNodes] = useState(initial);
  const [active, setActive] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const onMouseDown = (id: string, e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    const nx = (node.position.x / 100) * rect.width;
    const ny = (node.position.y / 100) * rect.height;
    const offsetX = e.clientX - (rect.left + nx);
    const offsetY = e.clientY - (rect.top + ny);
    dragRef.current = { id, offsetX, offsetY };
    setActive(id);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragRef.current.offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragRef.current.offsetY) / rect.height) * 100;
    setNodes(prev => prev.map(n => n.id === dragRef.current!.id ? { ...n, position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : n));
  };

  const onMouseUp = () => {
    dragRef.current = null;
  };

  return (
    <div ref={wrapRef} className="cyber-scene-graph relative h-72" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <svg className="w-full h-full">
        {/* Connection lines */}
        <line x1="50%" y1="20%" x2="20%" y2="60%" className="cyber-node-connection" />
        <line x1="50%" y1="20%" x2="80%" y2="20%" className="cyber-node-connection" />
        <line x1="20%" y1="60%" x2="35%" y2="100%" className="cyber-node-connection" />
        <line x1="80%" y1="60%" x2="65%" y2="100%" className="cyber-node-connection" />
        <line x1="50%" y1="85%" x2="65%" y2="100%" className="cyber-node-connection" />
        
        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id} onMouseDown={(e) => onMouseDown(node.id, e)} onClick={() => setActive(node.id)}>
            <circle
              cx={`${node.position.x}%`}
              cy={`${node.position.y}%`}
              r="24"
              className={`fill-current text-white bg-gradient-to-r ${node.color}`}
              filter="url(#glow)"
            />
            <text
              x={`${node.position.x}%`}
              y={`${node.position.y}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-xs font-bold cyber-font"
            >
              {node.name}
            </text>
          </g>
        ))}
        
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      {active && (
        <div className="absolute bottom-2 left-2 right-2 bg-cyber-navy/60 border border-cyber-cyan/30 rounded p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info size={14} className="text-cyber-cyan" />
            <span className="text-xs text-cyber-light">{active}</span>
          </div>
          <div className="text-xs text-cyber-gray">
            {active === 'character' && (data.characters && data.characters[0]?.identity)}
            {active === 'environment' && (data.environment && data.environment.location)}
            {active === 'camera' && (data.camera && data.camera.shot_type)}
            {active === 'lighting' && (data.lighting && (data.lighting.key || data.lighting.direction))}
            {active === 'prop' && (data.props && data.props[0]?.name)}
          </div>
        </div>
      )}
    </div>
  );
};
