import React, { useMemo, useState } from 'react';
import { useAppState } from '../state/AppState';
import { X, Search, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, setActiveTab, setAssistantOpen, pipeline } = useAppState();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
  const [q, setQ] = useState('');
  const items = useMemo(() => ([
    { label: 'Dashboard', action: () => setActiveTab('Dashboard') },
    { label: 'Video Data', action: () => setActiveTab('Video Data') },
    { label: 'Settings', action: () => setActiveTab('Settings') },
    { label: 'Sandbox', action: () => setActiveTab('Sandbox') },
    { label: 'Open Assistant', action: () => setAssistantOpen(true) },
    { label: 'Export ZIP', action: () => { if (pipeline?.shotId) window.open(`${API_BASE}/api/export/${pipeline.shotId}`, '_blank'); } },
    { label: 'Render Clip', action: () => {} },
    { label: 'Approve Canonical', action: () => {} },
    { label: 'Edit Motion Plan', action: () => setActiveTab('Dashboard') },
    { label: 'Edit Scene Graph', action: () => setActiveTab('Dashboard') },
  ]), [setActiveTab, setAssistantOpen]);
  const filtered = items.filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
  if (!searchOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="cyber-card p-6 w-full max-w-lg relative">
        <button className="absolute top-3 right-3 cyber-button-icon" onClick={() => setSearchOpen(false)}>
          <X size={16} />
        </button>
        <div className="flex items-center space-x-3 mb-3">
          <Search className="text-cyber-cyan" size={18} />
          <input className="cyber-input flex-1" placeholder="Search actions and pages" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filtered.map((i) => (
            <button key={i.label} className="w-full flex items-center justify-between px-3 py-2 rounded bg-cyber-navy/50 border border-cyber-cyan/20 hover:border-cyber-cyan/50" onClick={() => { i.action(); setSearchOpen(false); }}>
              <span className="text-sm text-cyber-light">{i.label}</span>
              <ArrowRight size={14} className="text-cyber-cyan" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-cyber-gray">No results</div>
          )}
        </div>
      </div>
    </div>
  );
};
