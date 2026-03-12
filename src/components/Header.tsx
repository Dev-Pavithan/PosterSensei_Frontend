import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, User, Heart, LogOut, Package, 
  Settings, ChevronDown, Menu, X, Sun, Moon, Maximize2, Minimize2, ChevronRight 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
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
            .catch(() => setCategories(['All', 'Naruto', 'Dragon Ball Z', 'Attack on Titan', 'One Piece', 'Demon Slayer', 'My Hero Academia']));
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

    // Close mobile menu on window resize (if screen becomes large)
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

    // Add this style tag to your component or global CSS file
    useEffect(() => {
        // Create a style element for media queries if not exists
        if (!document.getElementById('header-media-styles')) {
            const style = document.createElement('style');
            style.id = 'header-media-styles';
            style.innerHTML = `
                .mobile-menu-toggle {
                    display: flex !important;
                }
                .desktop-search {
                    display: none !important;
                }
                .mobile-search {
                    display: block !important;
                }
                .desktop-categories {
                    display: none !important;
                }
                .fullscreen-toggle-desktop {
                    display: none !important;
                }
                .action-label {
                    display: none !important;
                }
                /* Hide action icons on mobile */
                .mobile-hide-actions {
                    display: none !important;
                }
                /* Hide theme toggle on mobile */
                .mobile-hide-theme {
                    display: none !important;
                }
                
                @media (min-width: 480px) {
                    .action-label {
                        display: inline !important;
                    }
                }
                
                @media (min-width: 640px) {
                    .desktop-search {
                        display: block !important;
                    }
                    .mobile-search {
                        display: none !important;
                    }
                }
                
                @media (min-width: 768px) {
                    .mobile-menu-toggle {
                        display: none !important;
                    }
                    .desktop-categories {
                        display: block !important;
                    }
                    .mobile-hide-actions {
                        display: flex !important;
                    }
                    .mobile-hide-theme {
                        display: flex !important;
                    }
                }
                
                @media (min-width: 1024px) {
                    .fullscreen-toggle-desktop {
                        display: flex !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <header ref={headerRef} style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition)' }}>
            {/* Top promo strip */}
            <div style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', color: 'white', textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                🎌 Free Shipping on orders above LKR 2999 · 🖨️ Premium quality printing guaranteed
            </div>

            {/* Main header */}
            <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                {/* Logo & Mobile Menu Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Mobile menu toggle button - hidden on desktop via CSS class */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="mobile-menu-toggle"
                        style={{ 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-primary)', 
                            padding: '0.5rem',
                            marginLeft: '-0.5rem',
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    
                    <Link to="/" style={{ flexShrink: 0 }} onClick={() => setMobileMenuOpen(false)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img src={logo} alt="PosterSensei Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex' }}>Poster<span style={{ color: 'var(--primary)' }}>Sensei</span></span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Search bar - hidden on mobile via CSS class */}
                <form onSubmit={handleSearch} className="desktop-search" style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <input
                            type="text"
                            placeholder="Search Posters..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 1rem', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} />
                        </button>
                    </div>
                </form>

                {/* Right actions - Hidden on mobile, shown on desktop */}
                <div className="mobile-hide-actions desktop-show-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {/* Fullscreen Toggle - desktop only */}
                    <button 
                        onClick={toggleFullscreen} 
                        className="fullscreen-toggle-desktop" 
                        title={isFullscreen ? 'Exit full screen' : 'Full screen'} 
                        style={{ 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-secondary)' 
                        }}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, position: 'relative' }} onClick={() => setMobileMenuOpen(false)}>
                        <div style={{ position: 'relative' }}>
                            <Heart size={22} />
                            {wishlistCount > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                </span>
                            )}
                        </div>
                        <span className="action-label">Wishlist</span>
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, position: 'relative' }} onClick={() => setMobileMenuOpen(false)}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={22} />
                            {totalItems > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </div>
                        <span className="action-label">Cart</span>
                    </Link>

                    {/* User */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none' }}
                        >
                            {user?.profilePic ? (
                                <img src={user.profilePic} alt={user.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            ) : (
                                <User size={22} />
                            )}
                            <span style={{ 
                                display: 'flex',
                                alignItems: 'center', 
                                gap: '2px'
                            }} className="action-label">
                                {user ? user.name.split(' ')[0] : 'Login'} {user && <ChevronDown size={12} />}
                            </span>
                        </button>
                        {showUserMenu && user && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '220px', overflow: 'hidden', zIndex: 100 }}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                </div>
                                <div style={{ padding: '0.5rem 0' }}>
                                    {[
                                        { icon: <User size={16} />, label: 'My Profile', to: '/profile' },
                                        { icon: <Package size={16} />, label: 'My Orders', to: '/orders' },
                                        { icon: <Heart size={16} />, label: 'Wishlist', to: '/wishlist' },
                                        ...(user.isAdmin ? [{ icon: <Settings size={16} />, label: 'Admin Panel', to: '/admin' }] : []),
                                    ].map(item => (
                                        <Link key={item.to} to={item.to} onClick={() => { setShowUserMenu(false); setMobileMenuOpen(false); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, transition: 'all var(--transition)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            {item.icon} {item.label}
                                        </Link>
                                    ))}
                                </div>
                                <button onClick={handleLogout}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid var(--border)', transition: 'all var(--transition)', background: 'none', border: 'none', textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Theme Toggle - Separate for better control */}
                <div className="mobile-hide-theme desktop-show-theme">
                    <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Search bar - visible only on small screens via CSS class */}
            <div className="mobile-search" style={{ padding: '0 1rem 0.75rem 1rem' }}>
                <form onSubmit={handleSearch}>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <input
                            type="text"
                            placeholder="Search Posters..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.6rem 1rem', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Off-canvas Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: '300px', background: 'var(--surface)', zIndex: 1000, boxShadow: 'var(--shadow-lg)', overflowY: 'auto', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <img src={logo} alt="PosterSensei Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Poster<span style={{ color: 'var(--primary)' }}>Sensei</span></span>
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                                Home
                            </Link>
                            
                            {/* Categories Dropdown */}
                            <div style={{ borderBottom: '1px solid var(--border)' }}>
                                <button 
                                    onClick={() => toggleSection('categories')}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <span>Categories</span>
                                    <ChevronDown size={18} style={{ transform: expandedSections.categories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                {expandedSections.categories && (
                                    <div style={{ padding: '0 0 0.5rem 0.5rem' }}>
                                        {categories.map(cat => (
                                            <Link
                                                key={cat}
                                                to={cat === 'All' ? '/shop' : `/shop?anime=${encodeURIComponent(cat)}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{ display: 'block', padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Theme Toggle in mobile menu */}
                            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                            </button>

                            {/* Wishlist in mobile menu */}
                            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <Heart size={18} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                            </Link>

                            {/* Cart in mobile menu */}
                            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <ShoppingCart size={18} /> Cart {totalItems > 0 && `(${totalItems})`}
                            </Link>

                            {/* Account Dropdown */}
                            <div style={{ borderBottom: '1px solid var(--border)' }}>
                                <button 
                                    onClick={() => toggleSection('account')}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <span>Account</span>
                                    <ChevronDown size={18} style={{ transform: expandedSections.account ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                {expandedSections.account && (
                                    <div style={{ padding: '0 0 0.5rem 0.5rem' }}>
                                        {user ? (
                                            <>
                                                <div style={{ padding: '0.6rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                    {user.name}
                                                </div>
                                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}><User size={18} /> Profile</Link>
                                                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}><Package size={18} /> Orders</Link>
                                                {user.isAdmin && (
                                                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}><Settings size={18} /> Admin</Link>
                                                )}
                                                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--error)', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}><LogOut size={18} /> Sign Out</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--primary)' }}><User size={18} /> Login</Link>
                                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>Register</Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen toggle in mobile menu */}
                            <button onClick={() => { toggleFullscreen(); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderTop: '1px solid var(--border)' }}>
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />} {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                            </button>
                        </nav>
                    </div>
                </>
            )}

            {/* Anime nav - Horizontal scroll on desktop */}
            {isHome && (
                <nav className="desktop-categories" style={{ 
                    borderTop: '1px solid var(--border)', 
                    background: 'var(--surface)'
                }}>
                    <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.6rem 1rem', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <Link
                                key={cat}
                                to={cat === 'All' ? '/shop' : `/shop?anime=${encodeURIComponent(cat)}`}
                                className="chip"
                                style={{ flexShrink: 0, padding: '0.35rem 1rem', fontSize: '0.85rem' }}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;