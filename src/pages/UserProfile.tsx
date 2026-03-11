import React, { useState } from 'react';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, MapPin, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState<'profile' | 'security' | 'addresses'>('profile');
    
    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    
    // Security State
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    // Address State
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [newAddr, setNewAddr] = useState({ address: '', city: '', postalCode: '', country: 'Srilanka' });
    
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    if (!user) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><Link to="/login" className="btn btn-primary">Login</Link></div>;

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            const { data } = await axios.put('/api/users/profile', { name, email, phone, ...(password ? { password } : {}) }, { headers: { Authorization: `Bearer ${user._id}` } });
            updateUser(data);
            setSuccess('Profile updated!');
            setPassword('');
        } catch (err: any) { setError(err.response?.data?.message || 'Update failed.'); }
        finally { setSaving(false); }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        const updated = [...addresses, { ...newAddr, _id: Date.now().toString() }];
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated }, { headers: { Authorization: `Bearer ${user._id}` } });
            updateUser(data);
            setAddresses(data.addresses);
            setNewAddr({ address: '', city: '', postalCode: '', country: 'Srilanka' });
            setSuccess('Address added!');
        } catch (err: any) { setError('Failed to add address'); }
        finally { setSaving(false); }
    };

    const deleteAddress = async (id: string) => {
        const updated = addresses.filter((a: any) => a._id !== id);
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated }, { headers: { Authorization: `Bearer ${user._id}` } });
            updateUser(data);
            setAddresses(data.addresses);
            setSuccess('Address removed!');
        } catch (err: any) { setError('Failed to remove address'); }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem' }}>My Account</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                            { id: 'profile', label: 'Profile Info', icon: <User size={16} /> },
                            { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={16} /> },
                            { id: 'security', label: 'Security', icon: <Lock size={16} /> },
                        ].map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id as any); setError(''); setSuccess(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: tab === t.id ? 'var(--primary-light)' : 'transparent', color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 500, border: 'none', textAlign: 'left', transition: 'all 0.2s' }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    {tab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personal Information</h2>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <div className="input-icon-wrap"><User size={15} className="input-icon" /><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-icon-wrap"><Mail size={15} className="input-icon" /><input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Phone Number</label>
                                <div className="input-icon-wrap"><Phone size={15} className="input-icon" /><input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                            </div>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
                        </form>
                    )}

                    {tab === 'addresses' && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Saved Addresses</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {addresses.map((a: any) => (
                                    <div key={a._id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.address}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.city}, {a.postalCode}, {a.country}</div>
                                        </div>
                                        <button onClick={() => deleteAddress(a._id)} style={{ color: 'var(--error)', background: 'none', border: 'none', padding: '0.5rem' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                {addresses.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.875rem' }}>No addresses saved yet.</p>}
                            </div>
                            <hr className="divider" />
                            <form onSubmit={handleAddAddress} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add New Address</h3>
                                <input className="input" placeholder="Street Address" value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="input" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} required />
                                    <input className="input" placeholder="Postal Code" value={newAddr.postalCode} onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })} required />
                                </div>
                                <button type="submit" disabled={saving} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}><Plus size={16} /> Add Address</button>
                            </form>
                        </div>
                    )}

                    {tab === 'security' && (
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Settings</h2>
                            <div className="input-group">
                                <label className="input-label">Update Password</label>
                                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                                    <Lock size={15} className="input-icon" />
                                    <input type={showPass ? 'text' : 'password'} className="input" placeholder="Enter new password" value={password} onChange={e => setPassword(e.target.value)} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={saving || !password} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> Update Password</button>
                        </form>
                    )}

                    {(error || success) && (
                        <div style={{ marginTop: '1.5rem' }} className={`alert alert-${error ? 'error' : 'success'}`}>{error || success}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
