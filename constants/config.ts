import { Platform } from 'react-native';

const IP_ADDRESS = '10.12.75.211';

function getBackendUrl(): string {
    if (Platform.OS === 'web') {
        // Safe check: window may not exist during SSR
        if (typeof window !== 'undefined') {
            return `http://${window.location.hostname}:3000`;
        }
        return `http://localhost:3000`;
    }
    return `http://${IP_ADDRESS}:3000`;
}

export const BACKEND_URL = getBackendUrl();

console.log('[Config] BACKEND_URL:', BACKEND_URL);
