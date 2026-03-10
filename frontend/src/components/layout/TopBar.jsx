import React from 'react';
import { Download, Plus, Mic, MicPulse } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const TopBar = () => {
  const { voicePanelOpen, toggleVoicePanel, connected, simulationMode, warRoomActive } = useDashboardStore();

  const handleSimulate = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      await fetch(`${API_URL}/api/simulation/toggle`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
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
              className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 transition-colors ${
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
            className="mr-4 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            Simulate Crisis
          </button>
        )}

        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
          <Download size={16} />
          <span>Export data</span>
        </button>
        
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#6366f1] hover:bg-indigo-600 rounded-lg transition-colors shadow-sm shadow-indigo-500/20">
          <Plus size={16} />
          <span>Create report</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

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
      </div>
      
    </header>
  );
};

export default TopBar;
