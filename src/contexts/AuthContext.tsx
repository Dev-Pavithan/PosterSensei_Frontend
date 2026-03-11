import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    profilePic: string;
    phone: string;
    addresses: any[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('userInfo');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/users', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await axios.post('/api/users/logout');
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const updateUser = (data: Partial<User>) => {
        const updated = { ...user, ...data } as User;
        setUser(updated);
        localStorage.setItem('userInfo', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
