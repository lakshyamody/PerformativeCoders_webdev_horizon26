import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import useDashboardStore from './store/dashboardStore';
import Dashboard from './components/Dashboard/Dashboard';
import StrategyPanel from './components/StrategyPanel/StrategyPanel';
import VoiceDrawer from './components/assistant/VoiceDrawer';
import WarRoom from './components/WarRoom/WarRoom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Users from './pages/Users';
import Pricing from './pages/Pricing';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  useWebSocket();

  const {
    scores,
    connected,
    warRoomActive,
    simulationMode,
    voicePanelOpen,
    toggleVoicePanel,
    strategy,
    metricsHistory,
    metrics,
    settings,
    voiceAssistantEnabled
  } = useDashboardStore();



  const toggleSimulation = async () => {
    try {
      await fetch(`${API_URL}/api/simulation/toggle`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-primary">
      {/* War Room Overlay */}
      <WarRoom active={warRoomActive && settings.showAnimations} />

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6 h-full min-h-[calc(100vh-8rem)]">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/strategy" element={
                <StrategyPanel
                  strategy={strategy}
                  history={metricsHistory}
                />
              } />
              <Route path="/users" element={<Users />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Voice Assistant Overlay */}
      {voiceAssistantEnabled && <VoiceDrawer />}

    </div>
  );
}

export default App;
