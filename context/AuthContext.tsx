import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        // In a real app, you would load the token from SecureStore or AsyncStorage here
        // For now, we initialize as null (logged out)
    }, []);

    const login = (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
        // Save to SecureStore here
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        // Remove from SecureStore here
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
