import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// NOTE: When testing on a physical device, replace localhost with your computer's local IP address (e.g., 192.168.1.x)
const BACKEND_URL = 'http://localhost:3000';

export interface SensorData {
    temperature?: string;
    humidity?: string;
    timestamp?: string;
    raw?: string;
}

export function useIoTData() {
    const { token } = useAuth();
    const [data, setData] = useState<SensorData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        // 1. Initialize the Socket.io connection with auth token
        const socket: Socket = io(BACKEND_URL, {
            query: { token }
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to backend on', BACKEND_URL);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected from backend');
            setIsConnected(false);
        });

        // 2. Listen for the specific 'sensor_update' event emitted from our Node.js backend
        socket.on('sensor_update', (incomingData: SensorData) => {
            console.log('[Socket] Received new sensor data:', incomingData);
            setData(incomingData);
        });

        // Cleanup when component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    return { data, isConnected };
}
