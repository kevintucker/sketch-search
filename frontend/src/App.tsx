import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VideoData } from './components/VideoData';
import { Settings } from './components/Settings';
import { Sandbox } from './components/Sandbox';
import './index.css';
import { AppStateProvider, useAppState } from './state/AppState';
import { SearchModal } from './components/SearchModal';
import { ChatAssistant } from './components/ChatAssistant';

function Content() {
  const { activeTab, setActiveTab } = useAppState();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Video Data':
        return <VideoData />;
      case 'Settings':
        return <Settings />;
      case 'Sandbox':
        return <Sandbox />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-navy to-cyber-purple text-cyber-light">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      <SearchModal />
      <ChatAssistant />
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <Content />
    </AppStateProvider>
  );
}

export default App;
