import React, { createContext, useContext, useEffect, useState } from 'react';

type PipelineResult = {
  shotId?: string | null;
  sceneGraphUrl?: string | null;
  motionPlanUrl?: string | null;
  keyframesUrl?: string | null;
  videoUrl?: string | null;
};

type AppStateValue = {
  userName: string;
  setUserName: (name: string) => void;
  pipeline: PipelineResult;
  setPipeline: (p: PipelineResult) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  neon: boolean;
  setNeon: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
  assistantDocked: boolean;
  setAssistantDocked: (v: boolean) => void;
};

const AppState = createContext<AppStateValue | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppState);
  if (!ctx) throw new Error('AppState not provided');
  return ctx;
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'User Ali');
  const [pipeline, setPipeline] = useState<PipelineResult>({});
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [neon, setNeon] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [assistantDocked, setAssistantDocked] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('neon-off', !neon);
  }, [neon]);

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  return (
    <AppState.Provider value={{ userName, setUserName, pipeline, setPipeline, activeTab, setActiveTab, darkMode, setDarkMode, neon, setNeon, reducedMotion, setReducedMotion, searchOpen, setSearchOpen, assistantOpen, setAssistantOpen, assistantDocked, setAssistantDocked }}>
      {children}
    </AppState.Provider>
  );
};
