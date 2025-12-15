import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { useAppState } from '../state/AppState';

export const Settings: React.FC = () => {
  const { userName, setUserName, darkMode, setDarkMode, neon, setNeon, reducedMotion, setReducedMotion } = useAppState();

  const { pipeline } = useAppState();
  const onExportData = async () => {
    if (!pipeline.shotId) {
      alert('No shot to export yet. Upload an image first.');
      return;
    }
    const a = document.createElement('a');
    a.href = `http://localhost:8001/api/export/${pipeline.shotId}`;
    a.download = `${pipeline.shotId}_export.zip`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="cyber-panel p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <User className="text-cyber-cyan mr-3" size={20} />
              <h3 className="cyber-font text-lg text-cyber-light">Profile</h3>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                className="cyber-input w-full"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="cyber-input w-full"
                defaultValue="user@imagico.ai"
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="cyber-panel p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Palette className="text-cyber-cyan mr-3" size={20} />
              <h3 className="cyber-font text-lg text-cyber-light">Appearance</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                <span className="text-cyber-light">Dark Mode</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={neon} onChange={(e) => setNeon(e.target.checked)} />
                <span className="text-cyber-light">Neon Effects</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
                <span className="text-cyber-light">Reduced Motion</span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="cyber-panel p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Bell className="text-cyber-cyan mr-3" size={20} />
              <h3 className="cyber-font text-lg text-cyber-light">Notifications</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-cyber-light">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-cyber-light">Push Notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-cyber-light">SMS Notifications</span>
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="cyber-panel p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Shield className="text-cyber-cyan mr-3" size={20} />
              <h3 className="cyber-font text-lg text-cyber-light">Privacy</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-cyber-light">Make Profile Private</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-cyber-light">Allow Data Collection</span>
              </label>
            </div>
          </div>

          {/* Data */}
          <div className="cyber-panel p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Database className="text-cyber-cyan mr-3" size={20} />
              <h3 className="cyber-font text-lg text-cyber-light">Data</h3>
            </div>
            <div className="space-y-3">
              <button className="cyber-button w-full" onClick={onExportData}>Export Data</button>
              <button className="cyber-button bg-red-500 hover:bg-red-600 w-full">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
