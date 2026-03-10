import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import useDashboardStore from '../../store/dashboardStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function VoiceAssistant() {
    const {
        voicePanelOpen,
        setVoicePanelOpen,
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
    }, [voiceMessages, isTyping]);

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

    if (!voicePanelOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="voice-panel"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.25 }}
            >
                <div className="voice-panel-header">
                    <div className="voice-panel-title">
                        <span>🤖</span>
                        OpsPulse AI Assistant
                        {listening && (
                            <motion.span
                                style={{ color: '#ef4444', fontSize: 12 }}
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                ● Listening...
                            </motion.span>
                        )}
                    </div>
                    <button className="voice-panel-close" onClick={() => setVoicePanelOpen(false)}>
                        ✕
                    </button>
                </div>

                <div className="voice-messages">
                    {voiceMessages.map((msg, idx) => (
                        <div key={idx} className={`voice-message ${msg.role}`}>
                            {msg.text}
                            {msg.actions && msg.actions.length > 0 && (
                                <div className="voice-actions">
                                    {msg.actions.map((action, ai) => (
                                        <button
                                            key={ai}
                                            className="voice-action-btn"
                                            onClick={() => handleAction(action)}
                                        >
                                            ▶ {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="voice-message assistant">
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="voice-input-area" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className={`voice-btn ${listening ? 'listening' : ''}`}
                        onClick={listening ? stopListening : startListening}
                        style={{ width: 34, height: 34, fontSize: 16, flexShrink: 0 }}
                    >
                        🎙️
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        className="voice-text-input"
                        placeholder={listening ? 'Listening...' : 'Ask OpsPulse AI...'}
                        value={listening ? transcript : textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={listening}
                    />
                    <button type="submit" className="voice-send-btn">
                        ➤
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}
