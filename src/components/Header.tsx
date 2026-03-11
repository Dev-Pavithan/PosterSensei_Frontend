import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Heart, LogOut, Package, Settings, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';
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
    const userMenuRef = useRef<HTMLDivElement>(null);

    const [categories, setCategories] = useState<string[]>(['All']);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        setShowUserMenu(false);
    };

    return (
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition)' }}>
            {/* Top promo strip */}
            <div style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', color: 'white', textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                🎌 Free Shipping on orders above LKR 999 · 🖨️ Premium quality printing guaranteed
            </div>

            {/* Main header */}
            <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 2rem)', padding: 'clamp(0.5rem, 1.5vw, 1.25rem) 1rem' }}>
                {/* Logo & Mobile Menu Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to="/" style={{ flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={logo} alt="PosterSensei Logo" style={{ width: 42, height: 42, objectFit: 'contain' }} />
                            <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'clamp(0px, 15vw, auto)' }}>Poster<span style={{ color: 'var(--primary)' }}>Sensei</span></span>
                        </div>
                    </Link>
                </div>

                {/* Search bar - Grows and shrinks, wraps on small screens */}
                <form onSubmit={handleSearch} style={{ flex: '1 1 min(100%, 400px)', order: 'clamp(0, 0, 0)' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', transition: 'all var(--transition)' }}>
                        <input
                            type="text"
                            placeholder="Search Posters..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.6rem 1.25rem', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ padding: '0 1.25rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} />
                        </button>
                    </div>
                </form>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.5vw, 1.25rem)', flexShrink: 0, order: 1 }}>
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)', fontSize: '0.75rem', position: 'relative', fontWeight: 600 }}>
                        <div style={{ position: 'relative' }}>
                            <Heart size={22} className="icon-shrink" />
                            {wishlistCount > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                </span>
                            )}
                        </div>
                        <span style={{ display: 'clamp(0px, 10vw, block)' }}>Wishlist</span>
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)', fontSize: '0.75rem', position: 'relative', fontWeight: 600 }}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={22} />
                            {totalItems > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </div>
                        <span style={{ display: 'clamp(0px, 10vw, block)' }}>Cart</span>
                    </Link>

                    {/* User */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                            {user?.profilePic ? (
                                <img src={user.profilePic} alt={user.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            ) : (
                                <User size={22} />
                            )}
                            <span style={{ display: 'clamp(0px, 15vw, flex)', alignItems: 'center', gap: '2px' }}>
                                {user ? user.name.split(' ')[0] : 'Login'} {user && <ChevronDown size={12} />}
                            </span>
                        </button>
                        {showUserMenu && user && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '220px', overflow: 'hidden', zIndex: 100 }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
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
                                        <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, transition: 'all var(--transition)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            {item.icon} {item.label}
                                        </Link>
                                    ))}
                                </div>
                                <button onClick={handleLogout}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid var(--border)', transition: 'all var(--transition)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Anime nav - Horizontal scroll on mobile */}
            {isHome && (
                <nav style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
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
