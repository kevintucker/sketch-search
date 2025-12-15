import React from 'react';
import { Home, Video, Settings, Upload, Folder, User, FlaskConical } from 'lucide-react';
import { useAppState } from '../state/AppState';

export const Sidebar: React.FC = () => {
  const { setActiveTab } = useAppState();
  const menuItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: Video, label: 'Video Data' },
    { icon: Folder, label: 'Projects' },
    { icon: Upload, label: 'Upload' },
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' },
    { icon: FlaskConical, label: 'Sandbox' },
  ];

  return (
    <aside className="cyber-sidebar w-20 min-h-screen flex flex-col items-center py-6 space-y-6">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            className="cyber-button-icon group relative"
            title={item.label}
            onClick={() => setActiveTab(item.label)}
          >
            <Icon size={20} />
            <span className="absolute left-14 bg-cyber-navy text-cyber-cyan px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};