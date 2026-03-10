import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, X, Bot, User, Play } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import useDashboardStore from '../../store/dashboardStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function VoiceDrawer() {
    const {
        voicePanelOpen,
        toggleVoicePanel,
        voiceMessages,
        addVoiceMessage,
        isTyping,
        setIsTyping
    } = useDashboardStore();

    const [textInput, setTextInput] = useState('');
    const { listening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [voiceMessages, isTyping, voicePanelOpen]);

    useEffect(() => {
        if (!listening && transcript) {
            handleQuery(transcript);
            setTranscript('');
        }
    }, [listening, transcript]);

    const handleQuery = async (query) => {
        if (!query.trim()) return;

        addVoiceMessage({ role: 'user', text: query });
        setIsTyping(true);

        try {
            const res = await fetch(`${API_URL}/api/assistant/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();

            addVoiceMessage({
                role: 'assistant',
                text: data.text,
                actions: data.actions || []
            });

            // Text-to-Speech
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(data.text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 0.8;
                window.speechSynthesis.speak(utterance);
            }
        } catch (err) {
            addVoiceMessage({
                role: 'assistant',
                text: 'Sorry, I encountered an error connecting to the AI engine. Please try again.',
                actions: []
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleAction = async (action) => {
        try {
            const res = await fetch(`${API_URL}/api/assistant/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            addVoiceMessage({
                role: 'assistant',
                text: `✅ ${data.message}`,
                actions: []
            });
        } catch (err) {
            addVoiceMessage({
                role: 'assistant',
                text: '❌ Action failed. Please try again.',
                actions: []
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleQuery(textInput.trim());
            setTextInput('');
        }
    };

    return (
        <AnimatePresence>
            {voicePanelOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleVoicePanel}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-[#111827] border-l border-white/5 shadow-2xl z-50 flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-[#6366f1] flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h2 className="text-white font-medium text-sm">OpsPulse AI</h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                        <span className="text-xs text-gray-400">{listening ? 'Listening...' : 'Online'}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={toggleVoicePanel}
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {voiceMessages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-indigo-500/20 text-[#6366f1]'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#6366f1] text-white rounded-tr-sm' : 'bg-[#1a2236] border border-white/5 text-gray-200 rounded-tl-sm'}`}>
                                            {msg.text}
                                        </div>
                                        
                                        {/* Actions */}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="flex flex-col gap-2 w-full mt-1">
                                                {msg.actions.map((action, ai) => (
                                                    <button
                                                        key={ai}
                                                        onClick={() => handleAction(action)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors"
                                                    >
                                                        <Play size={12} className="text-[#6366f1]" />
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 max-w-[90%]"
                                >
                                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-indigo-500/20 text-[#6366f1]">
                                        <Bot size={14} />
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1a2236] border border-white/5 flex items-center gap-1.5 h-10 w-16">
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-[#111827]">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1.5 bg-[#1a2236] border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                                <button
                                    type="button"
                                    onClick={listening ? stopListening : startListening}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                                        listening 
                                            ? 'bg-red-500/20 text-red-500 animate-pulse' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Mic size={18} />
                                </button>
                                
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={listening ? "Listening..." : "Message OpsPulse AI..."}
                                    className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 px-2 min-w-0"
                                    value={listening ? transcript : textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    disabled={listening}
                                />
                                
                                <button
                                    type="submit"
                                    disabled={!textInput.trim() && !listening}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                                        textInput.trim() || listening
                                            ? 'bg-[#6366f1] text-white'
                                            : 'bg-white/5 text-gray-500'
                                    }`}
                                >
                                    <Send size={16} className={textInput.trim() || listening ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-gray-500 mt-3">
                                AI can make mistakes. Verify critical actions.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
