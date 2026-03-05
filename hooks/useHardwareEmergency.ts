import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:3000'; // Using localhost for browser visualization

export function useHardwareEmergency() {
    const { token } = useAuth();
    const [emergency, setEmergency] = useState<{ alertId: string; mac: string } | null>(null);

    useEffect(() => {
        if (!token) return;

        const socket: Socket = io(BACKEND_URL, {
            query: { token }
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to backend on', BACKEND_URL);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });

        socket.on('hardware_emergency', (data) => {
            console.log('[Socket] Hardware emergency event received!', data);
            setEmergency(data);
        });

        socket.on('sensor_update', (data) => {
            console.log('[Socket] Sensor update received:', data);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return { emergency, clearEmergency: () => setEmergency(null) };
}
