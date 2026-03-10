import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useDashboardStore from '../store/dashboardStore';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

export function useWebSocket() {
    const socketRef = useRef(null);
    const updateDashboard = useDashboardStore((s) => s.updateDashboard);
    const setConnected = useDashboardStore((s) => s.setConnected);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Connected to OpsPulse backend');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from backend');
            setConnected(false);
        });

        socket.on('dashboard:update', (data) => {
            updateDashboard(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [updateDashboard, setConnected]);

    return socketRef;
}
