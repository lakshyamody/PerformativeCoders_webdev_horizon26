import React from 'react';
import { Download, Plus, Mic, RefreshCw } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import HeaderControls from './HeaderControls';

import { apiClient } from '../../api/apiClient';

const TopBar = () => {
  const { 
    voicePanelOpen, toggleVoicePanel, connected, 
    simulationMode, warRoomActive, setSimulationMode, setWarRoomActive,
    updateDashboard,
    voiceAssistantEnabled
  } = useDashboardStore();

  const [simLoading, setSimLoading] = React.useState(false);
  const [refreshLoading, setRefreshLoading] = React.useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      const data = await apiClient.getDashboard();
      updateDashboard(data);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportData = () => {
    const currentState = useDashboardStore.getState();
    const dataStr = JSON.stringify(currentState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opspulse_export_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulate = async () => {
    try {
      setSimLoading(true);
      const res = await apiClient.toggleSimulation();
      setSimulationMode(res.active);
      if (res.active) setWarRoomActive(true);
      else setWarRoomActive(false);
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <header className="h-16 px-6 sm:px-8 border-b border-white/5 flex items-center justify-between bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-20">
      
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-white">OpsPulse Command Center</h1>
        <p className="text-xs text-gray-400 flex items-center gap-2">
          Real-time operations intelligence
          <span className="flex items-center gap-1.5 ml-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} ${connected ? 'animate-pulse' : ''}`}></span>
            {connected ? 'Live' : 'Offline'}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Simulation / War Room indicator */}
        {(simulationMode || warRoomActive) && (
          <div className="mr-4 flex items-center gap-2">
            <button 
              onClick={handleSimulate}
              disabled={simLoading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 transition-colors disabled:opacity-50 ${
                simulationMode 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${simulationMode ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}></span>
              {simulationMode ? 'Stop Crisis Sim' : 'War Room Active'}
            </button>
          </div>
        )}
        
        {(!simulationMode && !warRoomActive) && (
          <button 
            onClick={handleSimulate}
            disabled={simLoading}
            className="mr-4 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          >
            {simLoading ? 'Simulating...' : 'Simulate Crisis'}
          </button>
        )}

        <button 
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh Dashboard"
        >
          <RefreshCw size={16} className={refreshLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        <button 
          onClick={handleExportData}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Download size={16} />
          <span>Export data</span>
        </button>
        
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#6366f1] hover:bg-indigo-600 rounded-lg transition-colors shadow-sm shadow-indigo-500/20">
          <Plus size={16} />
          <span>Create report</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <HeaderControls />
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        
        {voiceAssistantEnabled && (
          <button 
            onClick={toggleVoicePanel}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              voicePanelOpen 
                ? 'bg-indigo-500/20 text-[#6366f1] ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-[#0d1117] animate-pulse' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            title="OpsPulse AI Assistant"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
      
    </header>
  );
};

export default TopBar;
