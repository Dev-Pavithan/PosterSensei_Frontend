import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, MapPin, Trash2, Plus, ShoppingBag, Heart, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

/* ─── Injected responsive styles ─── */
const injectStyles = () => {
    if (document.getElementById('profile-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'profile-page-styles';
    s.innerHTML = `
        .profile-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 1.5rem;
            align-items: start;
        }
        .profile-sidebar { display: block; }
        .profile-tabs-mobile { display: none; }
        .profile-avatar-ring {
            width: 80px; height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; font-weight: 800; color: white;
            flex-shrink: 0;
            box-shadow: 0 4px 20px rgba(var(--primary-rgb, 99,102,241), 0.4);
        }
        .profile-nav-btn {
            display: flex; align-items: center; gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            background: transparent;
            color: var(--text-secondary);
            font-weight: 500;
            border: none;
            text-align: left;
            transition: all 0.2s;
            width: 100%;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .profile-nav-btn:hover {
            background: var(--surface-2);
            color: var(--text-primary);
        }
        .profile-nav-btn.active {
            background: var(--primary-light);
            color: var(--primary);
            font-weight: 700;
        }
        .profile-nav-btn .nav-icon {
            width: 34px; height: 34px;
            border-radius: var(--radius-sm);
            background: var(--surface-2);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;
        }
        .profile-nav-btn.active .nav-icon {
            background: var(--primary);
            color: white;
        }
        .profile-field-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .profile-addr-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .profile-stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
        }
        @media (max-width: 768px) {
            .profile-layout {
                grid-template-columns: 1fr;
            }
            .profile-sidebar { display: none; }
            .profile-tabs-mobile { display: flex; }
            .profile-field-grid { grid-template-columns: 1fr; }
            .profile-addr-grid { grid-template-columns: 1fr; }
            .profile-stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
            .profile-stat-grid { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(s);
};

const TABS = [
    { id: 'profile',   label: 'Profile',    icon: <User size={16} /> },
    { id: 'addresses', label: 'Addresses',  icon: <MapPin size={16} /> },
    { id: 'security',  label: 'Security',   icon: <Shield size={16} /> },
];

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState<'profile' | 'security' | 'addresses'>('profile');

    // Profile state
    const [name, setName]   = useState(user?.name  || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // Security state
    const [password, setPassword]   = useState('');
    const [showPass, setShowPass]   = useState(false);

    // Address state
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [newAddr, setNewAddr]     = useState({ address: '', city: '', postalCode: '', country: 'Srilanka' });

    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState('');
    const [error,   setError]   = useState('');

    useEffect(() => { injectStyles(); }, []);

    if (!user) return (
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Please log in</h2>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
    );

    const handleSwitchTab = (id: any) => { setTab(id); setError(''); setSuccess(''); };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            const { data } = await axios.put('/api/users/profile', { name, email, phone, ...(password ? { password } : {}) });
            updateUser(data);
            setSuccess('Profile updated successfully!');
            setPassword('');
        } catch (err: any) { setError(err.response?.data?.message || 'Update failed.'); }
        finally { setSaving(false); }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        const updated = [...addresses, newAddr];
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated });
            updateUser(data);
            setAddresses(data.addresses);
            setNewAddr({ address: '', city: '', postalCode: '', country: 'Srilanka' });
            setSuccess('Address added!');
        } catch (err: any) { setError('Failed to add address'); }
        finally { setSaving(false); }
    };

    const deleteAddress = async (id: string) => {
        setError(''); setSuccess('');
        const updated = addresses.filter((a: any) => a._id !== id);
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated });
            updateUser(data);
            setAddresses(data.addresses);
            setSuccess('Address removed!');
        } catch { setError('Failed to remove address'); }
    };

    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    /* ─── Alert banner ─── */
    const Alert = () => (error || success) ? (
        <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: error ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            color: error ? 'var(--error)' : '#16a34a',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {error ? '⚠️' : '✅'} {error || success}
        </div>
    ) : null;

    return (
        <div className="container" >

            {/* ── Hero profile card ── */}
            <div className="card" style={{
                marginBottom: '1rem',
                overflow: 'hidden',
                border: '1px solid var(--border)',
            }}>
                {/* Gradient banner */}
                <div style={{
                    height: '90px',
                    position: 'relative',
                }} />
                {/* Avatar + info row */}
                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginTop: '-40px' }}>
                    <div className="profile-avatar-ring" style={{ width: 80, height: 80, fontSize: '1.75rem', border: '3px solid var(--surface)' }}>
                        {user.profilePic
                            ? <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : initials || <User size={32} />
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        {user.isAdmin && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                                ✦ Admin
                            </span>
                        )}
                    </div>
                    
                </div>
            </div>

            {/* ── Mobile tab pills ── */}
            <div className="profile-tabs-mobile" style={{
                gap: '0.5rem',
                marginBottom: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem',
                scrollbarWidth: 'none',
            }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => handleSwitchTab(t.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '999px',
                        border: tab === t.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                        background: tab === t.id ? 'var(--primary-light)' : 'var(--surface)',
                        color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: tab === t.id ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Main layout ── */}
            <div className="profile-layout">

                {/* ── Desktop Sidebar ── */}
                <div className="profile-sidebar">
                    <div className="card" style={{ padding: '0.75rem', border: '1px solid var(--border)' }}>
                        <div style={{ padding: '0.5rem 1rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Settings
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => handleSwitchTab(t.id)} className={`profile-nav-btn${tab === t.id ? ' active' : ''}`}>
                                    <span className="nav-icon">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border)' }} />

                        <div style={{ padding: '0.5rem 1rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Quick Links
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {[
                                { to: '/orders',  icon: <ShoppingBag size={16} />, label: 'My Orders' },
                                { to: '/wishlist',icon: <Heart size={16} />,       label: 'Wishlist' },
                            ].map(ln => (
                                <Link key={ln.to} to={ln.to} className="profile-nav-btn" style={{ textDecoration: 'none' }}>
                                    <span className="nav-icon">{ln.icon}</span>
                                    {ln.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Content Panel ── */}
                <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--border)', minWidth: 0 }}>

                    {/* ─ Profile Info ─ */}
                    {tab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Personal Information</h2>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Update your name, email and phone number.</p>
                            </div>
                            <div className="profile-field-grid">
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <div className="input-icon-wrap">
                                        <User size={15} className="input-icon" />
                                        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <div className="input-icon-wrap">
                                        <Mail size={15} className="input-icon" />
                                        <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                                    </div>
                                </div>
                            </div>
                            <div className="input-group" style={{ maxWidth: '340px' }}>
                                <label className="input-label">Phone Number</label>
                                <div className="input-icon-wrap">
                                    <Phone size={15} className="input-icon" />
                                    <input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 123 4567" />
                                </div>
                            </div>
                            <div>
                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            <Alert />
                        </form>
                    )}

                    {/* ─ Addresses ─ */}
                    {tab === 'addresses' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Saved Addresses</h2>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your delivery addresses.</p>
                            </div>

                            {addresses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                                    <MapPin size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No addresses saved yet</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {addresses.map((a: any) => (
                                        <div key={a._id} style={{
                                            padding: '1rem 1.25rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface-2)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '1rem',
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', minWidth: 0 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                                                    <MapPin size={16} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.address}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{a.city}, {a.postalCode}, {a.country}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteAddress(a._id)} title="Delete address" style={{
                                                flexShrink: 0, padding: '0.45rem', borderRadius: 'var(--radius-sm)',
                                                color: 'var(--error)', background: 'rgba(239,68,68,0.08)',
                                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                transition: 'background 0.2s',
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new address form */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Plus size={16} /> Add New Address
                                </h3>
                                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <input className="input" placeholder="Street Address" value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} required />
                                    <div className="profile-addr-grid">
                                        <input className="input" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} required />
                                        <input className="input" placeholder="Postal Code" value={newAddr.postalCode} onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })} required />
                                    </div>
                                    <div>
                                        <button type="submit" disabled={saving} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Plus size={16} /> {saving ? 'Adding...' : 'Add Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <Alert />
                        </div>
                    )}

                    {/* ─ Security ─ */}
                    {tab === 'security' && (
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Security Settings</h2>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Change your account password.</p>
                            </div>

                            {/* Info banner */}
                            <div style={{ padding: '0.85rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <Shield size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.1rem' }} />
                                Use a strong password with at least 8 characters, including numbers and symbols.
                            </div>

                            <div className="input-group" style={{ maxWidth: '400px' }}>
                                <label className="input-label">New Password</label>
                                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                                    <Lock size={15} className="input-icon" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="input"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem',
                                    }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Strength indicator */}
                            {password.length > 0 && (
                                <div style={{ maxWidth: '400px' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                                        {[1,2,3,4].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: '4px', borderRadius: '999px',
                                                background: password.length >= i * 3
                                                    ? (['var(--error)', 'orange', '#eab308', 'var(--success)'][i - 1])
                                                    : 'var(--border)',
                                                transition: 'background 0.3s',
                                            }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {password.length < 3 ? 'Too short' : password.length < 6 ? 'Weak' : password.length < 9 ? 'Fair' : 'Strong'}
                                    </div>
                                </div>
                            )}

                            <div>
                                <button type="submit" disabled={saving || !password} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={16} /> {saving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                            <Alert />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
