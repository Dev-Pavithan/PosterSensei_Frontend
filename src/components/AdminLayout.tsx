import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft, Maximize, Minimize, Moon, Sun, ChevronLeft, ChevronRight, Users2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You must be an administrator to view this page.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Return Home</button>
            </div>
        );
    }

    const NAV_ITEMS = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
        { path: '/admin/users', icon: <Users2 size={20} />, label: 'Users' },
    ];

    const sidebarWidth = isExpanded ? '260px' : '80px';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Sidebar */}
            <aside style={{ width: sidebarWidth, transition: 'width 0.3s ease', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, overflowX: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center' }}>
                    <div style={{ display: isExpanded ? 'flex' : 'none', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>P</div>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Poster<span style={{ color: 'var(--primary)' }}>Sensei</span></span>
                    </div>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem', margin: isExpanded ? 0 : 'auto' }}>
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    {NAV_ITEMS.map(item => (
                        <NavLink key={item.path} to={item.path} end={item.path === '/admin'} title={item.label} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: `0.9rem ${isExpanded ? '1.5rem' : '0'}`, justifyContent: isExpanded ? 'flex-start' : 'center',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            background: isActive ? 'var(--primary-light)' : 'transparent',
                            borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            fontWeight: isActive ? 700 : 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}>
                            {item.icon} {isExpanded && item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: isExpanded ? '1.5rem' : '1rem 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: isExpanded ? 'stretch' : 'center' }}>
                    <button title="Toggle Theme" onClick={toggleTheme} className="btn btn-ghost" style={{ justifyContent: isExpanded ? 'flex-start' : 'center', color: 'var(--text-secondary)', padding: isExpanded ? '0.75rem 1rem' : '0.75rem' }}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {isExpanded && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                    </button>
                    <button title="Toggle Fullscreen" onClick={toggleFullscreen} className="btn btn-ghost" style={{ justifyContent: isExpanded ? 'flex-start' : 'center', color: 'var(--text-secondary)', padding: isExpanded ? '0.75rem 1rem' : '0.75rem' }}>
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />} {isExpanded && (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
                    </button>
                    <button title="Back to Store" onClick={() => navigate('/')} className="btn btn-ghost" style={{ justifyContent: isExpanded ? 'flex-start' : 'center', color: 'var(--text-secondary)', padding: isExpanded ? '0.75rem 1rem' : '0.75rem' }}>
                        <ArrowLeft size={18} /> {isExpanded && 'Back to Store'}
                    </button>
                    <button title="Logout" onClick={handleLogout} className="btn btn-outline" style={{ justifyContent: isExpanded ? 'flex-start' : 'center', color: 'var(--error)', borderColor: 'var(--error)', padding: isExpanded ? '0.75rem 1rem' : '0.75rem', marginTop: '0.5rem' }}>
                        <LogOut size={18} /> {isExpanded && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease', padding: '2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
