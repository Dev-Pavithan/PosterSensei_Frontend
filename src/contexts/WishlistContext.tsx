import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlist: any[];
    loading: boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.get('/api/users/wishlist');
            setWishlist(data || []);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (productId: string) => {
        if (!user) return;
        try {
            await axios.put(`/api/users/wishlist/${productId}`);
            // Optimistic update or just refetch? 
            // Refetching is safer for population.
            fetchWishlist();
        } catch (error) {
            console.error('Failed to toggle wishlist', error);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item._id === productId);
    };

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, wishlistCount }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
};
