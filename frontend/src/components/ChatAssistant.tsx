import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/AppState';
import { X, MessageSquare, Send, Maximize2, Minimize2 } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

export const ChatAssistant: React.FC = () => {
  const { assistantOpen, setAssistantOpen, pipeline, assistantDocked, setAssistantDocked } = useAppState();
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content: 'How can I help customize your scene or motion plan?'
  }]);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  if (!assistantOpen) return null;
  const send = async () => {
    if (!input.trim()) return;
    const m = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, m]);
    setInput('');
    const resp = await fetch('http://localhost:8001/api/assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, m], shot_id: pipeline.shotId })
    });
    const data = await resp.json();
    const a = { role: 'assistant' as const, content: data.reply || 'No response' };
    setMessages((prev) => [...prev, a]);
  };

  return (
    <div className={`${assistantDocked ? 'fixed top-0 right-0 h-screen w-[380px] z-40' : 'fixed bottom-4 right-4 z-50 w-full max-w-sm'} `}>
      <div className={`cyber-card p-4 ${assistantDocked ? 'h-full flex flex-col' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-cyber-cyan" size={18} />
            <span className="cyber-font text-cyber-light">Assistant</span>
          </div>
          <button className="cyber-button-icon" onClick={() => setAssistantOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center justify-end mb-2">
          <button className="cyber-button-icon" onClick={() => setAssistantDocked(!assistantDocked)}>
            {assistantDocked ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
        <div ref={ref} className={`${assistantDocked ? 'flex-1' : 'h-64'} overflow-y-auto space-y-2`}>
          {messages.map((m, i) => (
            <div key={i} className={`p-2 rounded ${m.role === 'assistant' ? 'bg-cyber-navy/40' : 'bg-cyber-purple/30'}`}>
              <div className="text-sm text-cyber-light whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <input className="cyber-input flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about scene or motion plan" />
          <button className="cyber-button" onClick={send}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
};
