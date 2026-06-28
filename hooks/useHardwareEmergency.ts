import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

export function useHardwareEmergency() {
    const { token } = useAuth();
    const [emergency, setEmergency] = useState<{ alertId: string; mac: string } | null>(null);

    useEffect(() => {
        if (!token) return;

        console.log('[Socket] Connecting to', BACKEND_URL, 'with token...');

        const socket = io(BACKEND_URL, {
            query: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected! ID:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socket.on('hardware_emergency', (data) => {
            console.log('[Socket] Emergency received!', data);
            setEmergency(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return { emergency, clearEmergency: () => setEmergency(null) };
}
