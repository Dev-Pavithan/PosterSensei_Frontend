import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, User, Heart, LogOut, Package, 
  Settings, ChevronDown, Menu, X, Sun, Moon, Maximize2, Minimize2, ChevronRight, UserCircle, Home, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { showConfirm } from '../utils/alerts';
import logo from '../images/non_background_logo.png';

const Header = () => {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const { wishlistCount } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: false,
        account: false
    });
    const userMenuRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    const [categories, setCategories] = useState<string[]>(['All']);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Listen for fullscreen change events (e.g., ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        axios.get('/api/products/animes')
            .then(r => setCategories(['All', ...r.data]))
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm('Sign Out?', 'Are you sure you want to terminate your current session?');
        if (!confirmed) return;
        
        await logout();
        navigate('/login');
        setShowUserMenu(false);
        setMobileMenuOpen(false);
    };

    const toggleSection = (section: 'categories' | 'account') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryClick = (cat: string) => {
        navigate('/shop', { state: { anime: cat } });
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        if (!document.getElementById('header-media-styles')) {
            const style = document.createElement('style');
            style.id = 'header-media-styles';
            style.innerHTML = `
                .mobile-menu-toggle { display: none !important; }
                .desktop-search { display: none !important; }
                .mobile-search { display: block !important; }
                .desktop-categories { display: none !important; }
                .desktop-nav { display: none !important; }
                .desktop-header-actions { display: none !important; }
                .mobile-bottom-nav { display: flex !important; }
                
                @media (max-width: 400px) {
                    .brand-text-full { display: none !important; }
                }

                @media (min-width: 640px) {
                    .desktop-search { display: block !important; }
                    .mobile-search { display: none !important; }
                }
                
                @media (min-width: 768px) {
                    .desktop-categories { display: block !important; }
                    .desktop-nav { display: flex !important; }
                    .desktop-header-actions { display: flex !important; }
                    .mobile-bottom-nav { display: none !important; }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <header ref={headerRef} style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition)' }}>
            {/* Promo Strip */}
            <div style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', color: 'white', textAlign: 'center', padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700 }}>
                🎌 Free Shipping above LKR 2999 · 🖨️ Premium Printing
            </div>

            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 0.5rem', position: 'relative' }}>
                
                {/* Left: Desktop Menu Toggle (Optional, usually hidden) */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-toggle" style={{ position: 'absolute', left: '0.5rem', background: 'none', border: 'none', color: 'var(--text-primary)', padding: '0.4rem' }}>
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Center / Logo branding */}
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <img src={logo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex' }}>
                            <span className="brand-text-full">Poster</span><span style={{ color: 'var(--primary)' }}>Sensei</span>
                        </span>
                    </div>
                </Link>

                {/* Center: Search */}
                <form onSubmit={handleSearch} className="desktop-search" style={{ flex: '1', maxWidth: '400px', marginInline: '0.5rem' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <input
                            type="text"
                            placeholder="Find anime art..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 1rem', border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white' }}>
                            <Search size={16} />
                        </button>
                    </div>
                </form>

                {/* Right: Navigation & Dropdown */}
                <div className="desktop-header-actions" style={{ alignItems: 'center', gap: '1.5rem' }}>
                    <nav className="desktop-nav" style={{ gap: '1.25rem' }}>
                        <Link to="/" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Home</Link>
                        <Link to="/shop" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Shop</Link>
                        <Link to="/about" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>About</Link>
                    </nav>

                    {/* Consolidated User Menu */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.4rem', 
                                padding: '0.35rem 0.6rem',
                                background: showUserMenu ? 'var(--surface-2)' : 'var(--bg)', 
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-full)',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            {user?.profilePic ? (
                                <img src={user.profilePic} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <UserCircle size={20} color={user ? 'var(--primary)' : 'var(--text-muted)'} />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user ? user.name.split(' ')[0] : 'Account'}</span>
                                <ChevronDown size={12} style={{ transform: showUserMenu ? 'rotate(180deg)' : '0', transition: '0.2s' }} />
                            </div>
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', width: '260px', overflow: 'hidden', zIndex: 100 }}
                                >
                                    {/* User Info */}
                                    <div style={{ padding: '1.25rem', background: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{user ? user.name : 'Welcome, Guest'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user ? user.email : 'Log in to sync your posters'}</div>
                                    </div>

                                    <div style={{ padding: '0.75rem' }}>
                                        {/* Main Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.75rem' }}>
                                            {[
                                                { icon: <ShoppingCart size={18} />, label: 'My Cart', to: '/cart', count: totalItems },
                                                ...(user ? [
                                                    { icon: <User size={18} />, label: 'Profile Settings', to: '/profile' },
                                                ] : [])
                                            ].map(item => (
                                                <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--text-secondary)', transition: '0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                                        {item.icon} {item.label}
                                                    </div>
                                                    {(item.count ?? 0) > 0 && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>{item.count}</span>}
                                                </Link>
                                            ))}
                                            {user?.isAdmin && (
                                                <Link to="/admin" onClick={() => setShowUserMenu(false)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <Settings size={18} /> Admin Dashboard
                                                </Link>
                                            )}
                                        </div>

                                        <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0.5rem' }} />

                                        {/* Utilities */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', margin: '0.75rem 0' }}>
                                            <button onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Appearance: {theme === 'light' ? 'Dark' : 'Light'}</span>
                                            </button>
                                            <button onClick={() => { toggleFullscreen(); setShowUserMenu(false); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}</span>
                                            </button>
                                        </div>

                                        {/* Auth Bottom */}
                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                            {user ? (
                                                <button onClick={handleLogout}
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <LogOut size={18} /> Sign Out Profile
                                                </button>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.5rem' }}>
                                                    <Link to="/login" onClick={() => setShowUserMenu(false)} className="btn btn-outline btn-sm" style={{ padding: '0.6rem' }}>Login</Link>
                                                    <Link to="/register" onClick={() => setShowUserMenu(false)} className="btn btn-primary btn-sm" style={{ padding: '0.6rem' }}>Join</Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="mobile-search" style={{ padding: '0 1rem 1rem 1rem' }}>
                <form onSubmit={handleSearch}>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <input
                            type="text"
                            placeholder="Search Posters..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.6rem 1rem', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white' }}>
                            <Search size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Anime Categories nav */}
            {isHome && (
                <nav className="desktop-categories" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.6rem 1rem', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleCategoryClick(cat)} 
                                className="chip" 
                                style={{ flexShrink: 0, padding: '0.4rem 1.25rem', fontSize: '0.85rem', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            {/* Mobile Drawer (Simplified as many things are now in dropdown) */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: '320px', background: 'var(--surface)', zIndex: 1000, boxShadow: 'var(--shadow-lg)', overflowY: 'auto' }}
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <img src={logo} alt="Logo" style={{ width: 44, height: 44 }} />
                                        <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)' }}>PosterSensei</span>
                                    </Link>
                                    <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={28} /></button>
                                </div>

                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Navigation</div>
                                        <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                                            <Home size={22} style={{ color: 'var(--primary)' }} /> Home
                                        </Link>
                                        <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginTop: '1.25rem' }}>
                                            <Package size={22} style={{ color: 'var(--primary)' }} /> Shop
                                        </Link>
                                        <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginTop: '1.25rem' }}>
                                            <Info size={22} style={{ color: 'var(--primary)' }} /> About Us
                                        </Link>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Popular Anime</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {categories.slice(1, 10).map(cat => (
                                                <button 
                                                    key={cat} 
                                                    onClick={() => handleCategoryClick(cat)} 
                                                    className="chip" 
                                                    style={{ fontSize: '0.8rem', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer' }}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Access your cart, wishlist, and settings from the <b>Account</b> menu in the top right.</p>
                                    </div>
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

{/* Mobile Bottom Navigation */}
<div className="mobile-bottom-nav" style={{ 
    position: 'fixed', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    background: 'var(--surface)', 
    borderTop: '1px solid var(--border)', 
    padding: '0.75rem 1.5rem', 
    display: 'none', // Shown via CSS injected above
    justifyContent: 'space-between', 
    alignItems: 'center', 
    zIndex: 1001,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
}}>
    <button 
        onClick={() => setMobileMenuOpen(true)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: mobileMenuOpen ? 'var(--primary)' : 'var(--text-secondary)' }}
    >
        <Menu size={24} />
        <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>MENU</span>
    </button>

    <Link 
        to="/" 
        onClick={() => setMobileMenuOpen(false)}
        style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)',
            background: location.pathname === '/' ? 'var(--primary-light)' : 'transparent',
            padding: '8px 24px',
            borderRadius: '20px',
            marginTop: '-15px',
            border: location.pathname === '/' ? '2px solid var(--primary)' : 'none',
            boxShadow: location.pathname === '/' ? 'var(--shadow-md)' : 'none'
        }}
    >
        <div style={{ 
            color: location.pathname === '/' ? 'white' : 'inherit', 
            padding: '8px', 
            borderRadius: '50%' 
        }}>
            <motion.div whileTap={{ scale: 0.9 }}>
                <Home size={28} />
            </motion.div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>HOME</span>
        </div>
    </Link>

    <div style={{ position: 'relative' }}>
        <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: showUserMenu ? 'var(--primary)' : 'var(--text-secondary)' }}
        >
            {user?.profilePic ? (
                <img src={user.profilePic} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
                <UserCircle size={24} />
            )}
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{user ? 'PROFILE' : 'ACCOUNT'}</span>
            {(totalItems > 0 || wishlistCount > 0) && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface)' }} />
            )}
        </button>
        
        {/* Re-using the same Dropdown for Mobile Bottom Nav */}
        <AnimatePresence>
            {showUserMenu && (
                <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    style={{ position: 'absolute', right: '-1rem', bottom: 'calc(100% + 20px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', width: '280px', overflow: 'hidden', zIndex: 1002 }}
                >
                    <div style={{ padding: '1.25rem', background: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{user ? user.name : 'Guest User'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user ? user.email : 'Anime enthusiast'}</div>
                    </div>
                    <div style={{ padding: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
                        {[
                            { icon: <ShoppingCart size={20} />, label: 'My Cart', to: '/cart', count: totalItems },
                            ...(user ? [
                                { icon: <User size={20} />, label: 'Profile', to: '/profile' },
                            ] : [])
                        ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {item.icon} {item.label}
                                </div>
                                {(item.count ?? 0) > 0 && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '12px' }}>{item.count}</span>}
                            </Link>
                        ))}
                        {user?.isAdmin && (
                            <Link to="/admin" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', color: 'var(--accent)', fontWeight: 800 }}>
                                <Settings size={20} /> Admin Panel
                            </Link>
                        )}
                        <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                        
                        {/* Theme toggle */}
                        <button onClick={() => { toggleTheme(); setShowUserMenu(false); }} 
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '14px' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} Appearance: {theme === 'light' ? 'Dark' : 'Light'}
                        </button>
                        
                        {/* Fullscreen toggle - NEW */}
                        <button onClick={() => { toggleFullscreen(); setShowUserMenu(false); }} 
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '14px', marginTop: '4px' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />} 
                            <span>{isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}</span>
                        </button>
                        
                        {user ? (
                            <button onClick={handleLogout} 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', color: 'var(--error)', fontWeight: 800, marginTop: '0.5rem', borderTop: '1px solid var(--border)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '14px' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                                <Link to="/login" onClick={() => setShowUserMenu(false)} className="btn btn-outline btn-sm" style={{ padding: '0.6rem', textAlign: 'center' }}>Sign In</Link>
                                <Link to="/register" onClick={() => setShowUserMenu(false)} className="btn btn-primary btn-sm" style={{ padding: '0.6rem', textAlign: 'center' }}>Join</Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
</div>
        </header>
    );
};

export default Header;