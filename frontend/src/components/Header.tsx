import React from 'react';
import { Settings, User, Bell, Search, ChevronDown, MessageSquare } from 'lucide-react';
import { useAppState } from '../state/AppState';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { userName } = useAppState();
  const { setSearchOpen, setAssistantOpen } = useAppState();
  const tabs = ['Dashboard', 'Video Data', 'Settings', 'Sandbox'];

  return (
    <header className="cyber-header px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <h1 className="cyber-font text-2xl font-bold text-cyber-cyan cyber-glow">
          Imagico
        </h1>
        
        <nav className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'cyber-tab-active cyber-font font-semibold'
                  : 'text-cyber-light hover:text-cyber-cyan hover:bg-cyber-navy/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <button className="cyber-button-icon" onClick={() => setSearchOpen(true)}>
          <Search size={18} />
        </button>
        <button className="cyber-button-icon" onClick={() => setAssistantOpen(true)}>
          <MessageSquare size={18} />
        </button>
        
        <button className="cyber-button-icon">
          <Bell size={18} />
        </button>
        
        <button className="cyber-button-icon" onClick={() => setActiveTab('Settings')}>
          <Settings size={18} />
        </button>
        
        <div className="flex items-center space-x-2 bg-cyber-navy/50 border border-cyber-cyan/30 rounded-full px-3 py-2">
          <User size={16} className="text-cyber-cyan" />
          <span className="text-sm text-cyber-light">{userName}</span>
          <ChevronDown size={14} className="text-cyber-light" />
        </div>
      </div>
    </header>
  );
};
