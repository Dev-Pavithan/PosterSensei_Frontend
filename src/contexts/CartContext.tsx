import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    _id: string;
    title: string;
    anime: string;
    price: number;
    imageUrl: string;
    qty: number;
    size: string;
    stock: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: any, qty?: number, size?: string) => void;
    removeItem: (id: string, size?: string) => void;
    updateQty: (id: string, qty: number, size?: string) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    coupon: any | null;
    applyCoupon: (coupon: any) => void;
    removeCoupon: () => void;
    discount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    });
    const [coupon, setCoupon] = useState<any | null>(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: any, qty = 1, size = '') => {
        setItems(prev => {
            const existing = prev.find(i => i._id === product._id && i.size === size);
            if (existing) {
                return prev.map(i =>
                    i._id === product._id && i.size === size
                        ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
                        : i
                );
            }
            return [...prev, {
                _id: product._id,
                title: product.title,
                anime: product.anime,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                qty,
                size,
            }];
        });
    };

    const removeItem = (id: string, size = '') => {
        setItems(prev => prev.filter(i => !(i._id === id && i.size === size)));
    };

    const updateQty = (id: string, qty: number, size = '') => {
        if (qty < 1) { removeItem(id, size); return; }
        setItems(prev => prev.map(i =>
            i._id === id && i.size === size ? { ...i, qty: Math.min(qty, i.stock) } : i
        ));
    };

    const clearCart = () => { setItems([]); setCoupon(null); };

    const applyCoupon = (c: any) => setCoupon(c);
    const removeCoupon = () => setCoupon(null);

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    
    let discount = 0;
    if (coupon) {
        if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountAmount) / 100;
        } else {
            discount = coupon.discountAmount;
        }
    }

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal, coupon, applyCoupon, removeCoupon, discount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
