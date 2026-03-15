import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Save, Lock, Eye, EyeOff, MapPin,
    Trash2, Plus, ShoppingBag, Heart, Shield, ChevronRight,
    Camera, Settings, LogOut, Bell, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const [tab, setTab] = useState<'profile' | 'security' | 'addresses'>('profile');

    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // Security state
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Address state
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [newAddr, setNewAddr] = useState({ address: '', city: '', postalCode: '', country: 'Srilanka' });

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    if (!user) return (
        <div className="container" style={{ padding: '10vh 0', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔒</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Access Restricted</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Please authenticate to access your studio profile.</p>
                <Link to="/login" className="btn btn-primary btn-lg rounded-pill px-5">Go to Login</Link>
            </motion.div>
        </div>
    );

    const handleSwitchTab = (id: any) => { setTab(id); setError(''); setSuccess(''); };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            const { data } = await axios.put('/api/users/profile', { name, email, phone, ...(password ? { password } : {}) });
            updateUser(data);
            setSuccess('Studio profile updated!');
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
            setSuccess('Address added to vault.');
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
            setSuccess('Address removed.');
        } catch { setError('Failed to remove address'); }
    };

    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const TABS = [
        { id: 'profile', label: 'Identity', icon: <User size={18} /> },
        { id: 'addresses', label: 'Vault', icon: <MapPin size={18} /> },
        { id: 'security', label: 'Defense', icon: <Shield size={18} /> },
    ];

    return (
        <div style={{ background: 'var(--surface)', paddingBottom: '10vh' }}>
            {/* PROFILE HEADER: Mesh Gradient */}
            <section style={{ position: 'relative', height: '350px', overflow: 'hidden', marginBottom: '-100px' }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
                    zIndex: 0
                }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '40px',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: 900,
                                color: 'white',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                border: '4px solid var(--surface)'
                            }}>
                                {user.profilePic ? <img src={user.profilePic} style={{ width: '100%', height: '100%', borderRadius: '36px', objectFit: 'cover' }} /> : initials}
                            </div>
                            <button style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', border: '3px solid var(--surface)', borderRadius: '15px', padding: '0.5rem' }}>
                                <Camera size={16} />
                            </button>
                        </div>
                        <div style={{ color: 'white' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{user.name}</h1>
                            <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.7, fontSize: '0.9rem', fontWeight: 700 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {user.email}</span>
                                {user.isAdmin && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)' }}><Sparkles size={16} /> STUDIO ADMIN</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="studio-dashboard-grid">

                    {/* SIDEBAR: Studio Navigation */}
                    <aside>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '32px',
                                padding: '1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'sticky',
                                top: '100px'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {TABS.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSwitchTab(t.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem 1.25rem',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: tab === t.id ? 'var(--primary)' : 'transparent',
                                            color: tab === t.id ? 'white' : 'var(--text-secondary)',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{t.icon} {t.label}</div>
                                        {tab === t.id && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </div>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBlock: '1.5rem' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '20px', fontWeight: 700, opacity: 0.7 }}>
                                        <ShoppingBag size={18} /> My Projects
                                    </div>
                                </Link>
                                <Link to="/wishlist" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '20px', fontWeight: 700, opacity: 0.7 }}>
                                        <Heart size={18} /> Curated List
                                    </div>
                                </Link>
                            </div>

                            <button onClick={logout} style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                <LogOut size={18} /> Terminate Session
                            </button>
                        </motion.div>
                    </aside>

                    {/* CONTENT BENTO */}
                    <main>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                            {/* Quick Stats Bento */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bento-stats-span-4"
                                style={{
                                    gridColumn: 'span 4',
                                    background: 'var(--primary)',
                                    padding: '2rem',
                                    borderRadius: '32px',
                                    color: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '220px'
                                }}
                            >
                                <ShoppingBag size={32} />
                                <div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900 }}>{addresses.length}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Active Addresses</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bento-stats-span-8"
                                style={{
                                    gridColumn: 'span 8',
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    padding: '2rem',
                                    borderRadius: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2rem',
                                    height: '220px'
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <Bell size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <div style={{ fontWeight: 800 }}>Account Health</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full access enabled</div>
                                </div>
                                <div style={{ width: '1px', height: '60px', background: 'var(--border)' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <Settings size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <div style={{ fontWeight: 800 }}>Studio Tier</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium Creative</div>
                                </div>
                            </motion.div>

                            {/* Main Form Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    gridColumn: 'span 12',
                                    background: 'rgba(255,255,255,0.02)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '32px',
                                    padding: '3.5rem'
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {tab === 'profile' && (
                                        <motion.form
                                            key="profile"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleProfileUpdate}
                                        >
                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem' }}>Personal Identity</h2>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                                <div className="input-group">
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.75rem', display: 'block' }}>FULL NAME</label>
                                                    <input className="input studio-input" value={name} onChange={e => setName(e.target.value)} style={studioInputStyle} />
                                                </div>
                                                <div className="input-group">
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.75rem', display: 'block' }}>EMAIL ADDRESS</label>
                                                    <input className="input studio-input" value={email} onChange={e => setEmail(e.target.value)} style={studioInputStyle} />
                                                </div>
                                            </div>
                                            <div style={{ maxWidth: '400px', marginBottom: '3rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.75rem', display: 'block' }}>CONTACT PHONE</label>
                                                <input className="input studio-input" value={phone} onChange={e => setPhone(e.target.value)} style={studioInputStyle} />
                                            </div>
                                            <button type="submit" disabled={saving} className="btn btn-primary btn-lg rounded-pill" style={{ paddingInline: '3rem' }}>
                                                {saving ? 'Syncing...' : 'Update Identity'}
                                            </button>
                                        </motion.form>
                                    )}

                                    {tab === 'addresses' && (
                                        <motion.div
                                            key="addresses"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem' }}>Shipping Vault</h2>
                                            <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                                                {addresses.map((a: any) => (
                                                    <div key={a._id} style={{
                                                        background: 'var(--surface-2)',
                                                        padding: '1.5rem 2rem',
                                                        borderRadius: '24px',
                                                        border: '1px solid var(--border)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800 }}>{a.address}</div>
                                                            <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{a.city}, {a.postalCode}</div>
                                                        </div>
                                                        <button onClick={() => deleteAddress(a._id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2.5rem', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Add New Location</h3>
                                                <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                    <input className="input studio-input" style={{ ...studioInputStyle, gridColumn: 'span 2' }} placeholder="Street Address" value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} required />
                                                    <input className="input studio-input" style={studioInputStyle} placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} required />
                                                    <input className="input studio-input" style={studioInputStyle} placeholder="Postal Code" value={newAddr.postalCode} onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })} required />
                                                    <button type="submit" disabled={saving} className="btn btn-primary rounded-pill" style={{ gridColumn: 'span 2' }}>Initialize Location</button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}

                                    {tab === 'security' && (
                                        <motion.form
                                            key="security"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleProfileUpdate}
                                        >
                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem' }}>Cyber Defense</h2>
                                            <div style={{ maxWidth: '450px' }}>
                                                <div className="input-group" style={{ marginBottom: '2rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.75rem', display: 'block' }}>NEW PASSWORD</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type={showPass ? 'text' : 'password'}
                                                            className="input studio-input"
                                                            style={studioInputStyle}
                                                            value={password}
                                                            onChange={e => setPassword(e.target.value)}
                                                        />
                                                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                                                            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={saving || !password} className="btn btn-primary btn-lg rounded-pill" style={{ paddingInline: '3rem' }}>
                                                    {saving ? 'Securing...' : 'Establish Security'}
                                                </button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>

                                {(success || error) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            marginTop: '2rem',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '16px',
                                            background: success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: success ? '#4ade80' : '#f87171',
                                            fontWeight: 700,
                                            border: `1px solid ${success ? '#4ade80' : '#f87171'}`
                                        }}
                                    >
                                        {success || error}
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>

            <style>{`
                .studio-dashboard-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2rem;
                }
                .studio-input {
                    background: var(--surface-2) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 16px !important;
                    padding: 1.2rem 1.5rem !important;
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                }
                .studio-input:focus {
                    border-color: var(--primary) !important;
                }
                @media (max-width: 991px) {
                    .studio-dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    aside {
                        position: relative !important;
                        top: 0 !important;
                    }
                    .bento-stats-span-4 {
                        grid-column: span 12 !important;
                    }
                    .bento-stats-span-8 {
                        grid-column: span 12 !important;
                    }
                }
            `}</style>
        </div>
    );
};

const studioInputStyle = {
    transition: 'all 0.3s ease'
};

export default UserProfile;
