import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft, 
    Maximize, Minimize, Moon, Sun, ChevronLeft, ChevronRight, 
    Users2, Menu, X, Settings, Bell, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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
        { path: '/admin/users', icon: <Users2 size={20} />, label: 'Users' },
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
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>POSTER<span style={{ color: 'var(--primary)' }}>SENSEI</span></div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{user.name[0]}</div>
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
                    <Outlet />
                </div>
            </main>

            <style>{`
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
