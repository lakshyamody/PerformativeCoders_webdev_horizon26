import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import useDashboardStore from './store/dashboardStore';
import Dashboard from './components/Dashboard/Dashboard';
import StrategyPanel from './components/StrategyPanel/StrategyPanel';
import VoiceDrawer from './components/assistant/VoiceDrawer';
import WarRoom from './components/WarRoom/WarRoom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  useWebSocket();

  const {
    scores,
    connected,
    warRoomActive,
    simulationMode,
    activeTab,
    setActiveTab,
    voicePanelOpen,
    toggleVoicePanel,
    strategy,
    metricsHistory,
    metrics
  } = useDashboardStore();



  const toggleSimulation = async () => {
    try {
      await fetch(`${API_URL}/api/simulation/toggle`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    }
  };

  const bssPillClass = bss > 70 ? 'critical' : bss > 40 ? 'warning' : 'healthy';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-primary">
      {/* War Room Overlay */}
      <WarRoom active={warRoomActive} />

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'strategy' && (
              <StrategyPanel
                strategy={strategy}
                history={metricsHistory}
              />
            )}
          </div>
        </main>
      </div>

      {/* Voice Assistant Overlay */}
      <VoiceDrawer />

    </div>
  );
}

export default App;
