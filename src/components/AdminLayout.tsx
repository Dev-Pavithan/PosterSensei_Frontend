import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft, 
    Maximize, Minimize, Moon, Sun, ChevronLeft, ChevronRight, 
    Users2, Menu, X, Mail, Bell, Star, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { usePushNotifications } from '../hooks/usePushNotifications';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    usePushNotifications(user?.isAdmin || false);

    // Notification State
    const [lastOrderTime, setLastOrderTime] = useState<number>(Date.now());
    const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
    const [activeNotification, setActiveNotification] = useState<{title: string, message: string} | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        
        // Deep-link navigation
        if (notification.type === 'order') {
            navigate(`/admin/orders?view=${notification.referenceId}`);
        } else if (notification.type === 'contact') {
            navigate(`/admin/contact?highlight=${notification.referenceId}`);
        }
        
        setShowNotifDropdown(false);
    };
    
    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const clearAll = async () => {
        try {
            await axios.delete('/api/notifications/clear');
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    // Using a proper and working whistle sound for notifications
    const NOTIFICATION_SOUND = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Initial fetch
        fetchNotifications();

        // 1. Establish SSE Connection for "Instant" Updates
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            try {
                const newNotif = JSON.parse(event.data);
                
                // Update local notification list instantly
                setNotifications(prev => [newNotif, ...prev]);

                // Play sound
                const audio = new Audio(NOTIFICATION_SOUND);
                audio.play().catch(e => console.log('Audio playback prevented:', e));

                // Show toast-like active notification
                setActiveNotification({ 
                    title: newNotif.type === 'order' ? 'New Order! 🛍️' : 'New Message! ✉️', 
                    message: newNotif.message 
                });
                setTimeout(() => setActiveNotification(null), 8000);

                // 2. Dispatch global event to tell other pages (Orders/Contacts) to refresh
                window.dispatchEvent(new CustomEvent('admin-data-refresh', { detail: { type: newNotif.type } }));

            } catch (err) {
                console.error("SSE Parse Error:", err);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection Error:", err);
            eventSource.close();
            // Reconnect logic after 5s
            setTimeout(() => {
                // This would trigger a re-run of this effect if state was tied to it, 
                // but simpler is to just let the interval polling catch up if SSE fails.
            }, 5000);
        };

        // 3. Fallback Polling (Keep as backup for reliability)
        const checkNotifications = async () => {
            try {
                fetchNotifications();
            } catch (err) {
                console.error("Failed to fetch notification data:", err);
            }
        };

        const intervalId = setInterval(checkNotifications, 45000); // Slower polling since we have SSE

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            clearInterval(intervalId);
            eventSource.close();
        };
    }, []); // Only run once on mount

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user || !user.isAdmin) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--bg)',
                color: 'var(--text-primary)'
            }}>
                <div style={{ 
                    padding: '3rem', 
                    background: 'var(--surface)', 
                    borderRadius: '32px', 
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <X size={32} />
                    </div>
                    <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>You must be an administrator to view this terminal.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem', width: '100%', borderRadius: '16px' }}>Return Home</button>
                </div>
            </div>
        );
    }

    const NAV_ITEMS = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
        { path: '/admin/delivery', icon: <Truck size={20} />, label: 'Delivery Methods' },
        { path: '/admin/reviews', icon: <Star size={20} />, label: 'Reviews' },
        { path: '/admin/users', icon: <Users2 size={20} />, label: 'Users' },
        { path: '/admin/contact', icon: <Mail size={20} />, label: 'Messages' },
    ];

    const sidebarWidth = isExpanded ? '280px' : '90px';

    const SidebarContent = () => (
        <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: (isExpanded || isMobileOpen) ? 'space-between' : 'center' }}>
                <div style={{ display: (isExpanded || isMobileOpen) ? 'flex' : 'none', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1rem', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)' }}>P</div>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>POSTER<span style={{ color: 'var(--primary)' }}>SENSEI</span></span>
                </div>
                {!isMobileOpen && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '12px', color: 'var(--text-muted)', display: 'flex' }}>
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
                {isMobileOpen && (
                    <button onClick={() => setIsMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {NAV_ITEMS.map(item => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/admin'} onClick={() => setIsMobileOpen(false)} title={item.label} style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                        justifyContent: (isExpanded || isMobileOpen) ? 'flex-start' : 'center',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        background: isActive ? 'var(--primary)' : 'transparent',
                        borderRadius: '16px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 8px 16px -4px rgba(var(--primary-rgb), 0.3)' : 'none'
                    })}>
                        {item.icon} {(isExpanded || isMobileOpen) && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button title="Toggle Theme" onClick={toggleTheme} className="btn-ghost-admin" style={{ justifyContent: (isExpanded || isMobileOpen) ? 'flex-start' : 'center' }}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {(isExpanded || isMobileOpen) && (theme === 'dark' ? 'Nebula View' : 'Nova View')}
                </button>
                <button title="Toggle Fullscreen" onClick={toggleFullscreen} className="btn-ghost-admin" style={{ justifyContent: (isExpanded || isMobileOpen) ? 'flex-start' : 'center' }}>
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />} {(isExpanded || isMobileOpen) && (isFullscreen ? 'Windowed' : 'Immersive')}
                </button>
                <button title="Back to Store" onClick={() => navigate('/')} className="btn-ghost-admin" style={{ justifyContent: (isExpanded || isMobileOpen) ? 'flex-start' : 'center' }}>
                    <ArrowLeft size={18} /> {(isExpanded || isMobileOpen) && 'Public Store'}
                </button>
                <div style={{ marginBlock: '0.5rem', height: '1px', background: 'var(--border)', opacity: 0.5 }} />
                <button title="Logout" onClick={handleLogout} className="btn-ghost-admin" style={{ justifyContent: (isExpanded || isMobileOpen) ? 'flex-start' : 'center', color: '#ef4444' }}>
                    <LogOut size={18} /> {(isExpanded || isMobileOpen) && 'Terminate'}
                </button>
            </div>
        </>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* DESKTOP SIDEBAR */}
            <aside className="admin-sidebar" style={{ 
                width: sidebarWidth, 
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                background: 'rgba(var(--surface-rgb), 0.8)', 
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'fixed', 
                top: 0, 
                bottom: 0, 
                left: 0, 
                zIndex: 100 
            }}>
                <SidebarContent />
            </aside>

            {/* MOBILE OVERLAY DRAWER */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
                    >
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '280px', height: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER FOR MOBILE */}
            <header className="admin-mobile-header" style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '70px', 
                background: 'rgba(var(--surface-rgb), 0.8)', 
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                zIndex: 90
            }}>
                <button onClick={() => setIsMobileOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
                    <Menu size={24} />
                </button>
                
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}>
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px', border: '2px solid var(--surface)' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifDropdown && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setShowNotifDropdown(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute', top: '100%', right: -20, width: '320px', 
                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                        borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                        zIndex: 999, overflow: 'hidden', marginTop: '10px'
                                    }}
                                >
                                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Alerts</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Mark all</button>
                                            <button onClick={clearAll} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No new alerts.</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div 
                                                    key={n._id} 
                                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                                    style={{ 
                                                        padding: '1rem', borderRadius: '12px', marginBottom: '4px',
                                                        background: n.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                                        cursor: n.isRead ? 'default' : 'pointer',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <div style={{ 
                                                            width: 32, height: 32, borderRadius: '10px', 
                                                            background: n.type === 'order' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                                            color: n.type === 'order' ? 'var(--primary)' : '#38bdf8',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                        }}>
                                                            {n.type === 'order' ? <ShoppingCart size={16} /> : <Mail size={16} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.message}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main style={{ 
                flex: 1, 
                marginLeft: (isExpanded && window.innerWidth > 1024) ? sidebarWidth : (window.innerWidth > 1024 ? '90px' : '0'), 
                transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                padding: 'clamp(1rem, 4vw, 2.5rem)',
                minWidth: 0,
                width: '100%'
            }}>
                <div className="admin-content-container" style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem', alignItems: 'center' }} className="desktop-header-actions">
                         <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px', border: '2px solid var(--bg)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showNotifDropdown && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowNotifDropdown(false)}
                                            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            style={{
                                                position: 'absolute', top: '100%', right: 0, width: '320px', 
                                                background: 'var(--surface)', border: '1px solid var(--border)',
                                                borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                zIndex: 999, overflow: 'hidden', marginTop: '10px'
                                            }}
                                        >
                                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Alerts</h3>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Mark all</button>
                                                    <button onClick={clearAll} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                                                </div>
                                            </div>
                                            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No new alerts.</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div 
                                                            key={n._id} 
                                                            onClick={() => !n.isRead && markAsRead(n._id)}
                                                            style={{ 
                                                                padding: '1rem', borderRadius: '12px', marginBottom: '4px',
                                                                background: n.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                                                cursor: n.isRead ? 'default' : 'pointer',
                                                                transition: 'background 0.2s',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                                <div style={{ 
                                                                    width: 32, height: 32, borderRadius: '10px', 
                                                                    background: n.type === 'order' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                                                    color: n.type === 'order' ? 'var(--primary)' : '#38bdf8',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                                }}>
                                                                    {n.type === 'order' ? <ShoppingCart size={16} /> : <Mail size={16} />}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.message}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{user.name[0]}</div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</span>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </main>

            {/* Notification Toast */}
            <AnimatePresence>
                {activeNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            background: 'var(--surface)',
                            border: '1px solid var(--primary)',
                            boxShadow: '0 10px 40px -10px rgba(var(--primary-rgb), 0.4)',
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            maxWidth: '400px'
                        }}
                    >
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={20} style={{ animation: 'ring 2s ease infinite' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{activeNotification.title}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeNotification.message}</div>
                        </div>
                        <button onClick={() => setActiveNotification(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', marginLeft: 'auto' }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes ring {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-10deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-10deg); }
                    50% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }

                @media (max-width: 1024px) {
                    .admin-sidebar { display: none !important; }
                    main { 
                        margin-left: 0 !important; 
                        padding-top: calc(70px + 1.5rem) !important; 
                    }
                    .admin-mobile-header { display: flex !important; }
                }
                
                @media (max-width: 640px) {
                    main {
                        padding-inline: 1rem !important;
                    }
                }

                main {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-ghost-admin {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.85rem 1rem;
                    border-radius: 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }
                .btn-ghost-admin:hover {
                    background: var(--surface-2);
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
