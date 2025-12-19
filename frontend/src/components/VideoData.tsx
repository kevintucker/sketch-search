import React from 'react';
import { Video } from 'lucide-react';

export const VideoData: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h2 className="cyber-font text-xl font-bold text-cyber-cyan mb-4">Video Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="cyber-panel p-4 rounded-lg">
              <div className="bg-gradient-to-br from-cyber-navy to-cyber-purple rounded-lg h-32 flex items-center justify-center mb-3">
                <Video className="text-cyber-cyan" size={32} />
              </div>
              <h3 className="cyber-font text-cyber-light font-semibold mb-2">Project {item}</h3>
              <p className="text-cyber-gray text-sm mb-3">Generated video with AI enhancement</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-cyber-cyan">2.5 min</span>
                <button className="text-cyber-pink hover:text-cyber-magenta text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
