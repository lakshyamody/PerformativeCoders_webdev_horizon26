import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Settings, Check, Monitor, Volume2, CloudOff, CloudLightning, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useDashboardStore from '../../store/dashboardStore';

export default function HeaderControls() {
    const { 
        theme, toggleTheme, 
        settings, updateSettings, 
        voiceAssistantEnabled, setVoiceAssistantEnabled, 
        connected
    } = useDashboardStore();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const popoverRef = useRef(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const vs = window.speechSynthesis.getVoices();
                if (vs.length > 0) {
                    setVoices(vs);
                    if (!selectedVoice) setSelectedVoice(vs[0].name);
                }
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, [selectedVoice]);

    const handleReconnect = () => {
        // Simple manual reconnect simulation (assuming socket.io is managing it anyway)
        window.location.reload();
    };

    return (
        <div className="flex items-center gap-2 relative">
            <button 
                onClick={toggleTheme}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`p-2 rounded-lg transition-colors ${settingsOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                title="Dashboard Settings"
            >
                <Settings size={18} className={settingsOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>

            <AnimatePresence>
                {settingsOpen && (
                    <motion.div 
                        ref={popoverRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-[#1a2236] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-semibold text-white">Dashboard Settings</h3>
                        </div>

                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            
                            {/* Display Preferences */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Monitor size={14} /> Display Preferences
                                </h4>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show Strategy Panel</span>
                                    <div className={`w-8 h-4 rounded-full transition-colors relative ${settings.showStrategy ? 'bg-[#6366f1]' : 'bg-white/10'}`} onClick={() => updateSettings({ showStrategy: !settings.showStrategy })}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.showStrategy ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">War Room Animations</span>
                                    <div className={`w-8 h-4 rounded-full transition-colors relative ${settings.showAnimations ? 'bg-[#6366f1]' : 'bg-white/10'}`} onClick={() => updateSettings({ showAnimations: !settings.showAnimations })}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.showAnimations ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>

                            {/* Update Frequency */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <RefreshCw size={14} /> Update Frequency
                                </h4>
                                <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">
                                    {[3, 5, 10].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => updateSettings({ updateFreq: val })}
                                            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${settings.updateFreq === val ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {val}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Voice Assistant */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Volume2 size={14} /> Voice Assistant
                                </h4>
                                <label className="flex items-center justify-between cursor-pointer group mb-2">
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Enable Assistant</span>
                                    <div className={`w-8 h-4 rounded-full transition-colors relative ${voiceAssistantEnabled ? 'bg-[#6366f1]' : 'bg-white/10'}`} onClick={() => setVoiceAssistantEnabled(!voiceAssistantEnabled)}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${voiceAssistantEnabled ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                                {voiceAssistantEnabled && (
                                    <select 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={selectedVoice}
                                        onChange={e => setSelectedVoice(e.target.value)}
                                    >
                                        {voices.map(v => (
                                            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Session Info */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <CloudLightning size={14} /> Session Info
                                </h4>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Status</span>
                                    <span className={`font-medium flex items-center gap-1.5 ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {connected ? 'Connected' : 'Offline'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">WebSocket URL</span>
                                    <span className="text-xs font-mono text-gray-300">{import.meta.env.VITE_API_URL || 'ws://localhost'}</span>
                                </div>
                                <button 
                                    onClick={handleReconnect}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 text-xs font-medium border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <CloudOff size={14} />
                                    Force Reconnect
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
