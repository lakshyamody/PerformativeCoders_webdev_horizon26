import { useState, useCallback, useRef } from 'react';

export function useVoiceInput() {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setListening(true);

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            setTranscript(result[0].transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setListening(false);
    }, []);

    const supported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

    return { listening, transcript, startListening, stopListening, setTranscript, supported };
}
