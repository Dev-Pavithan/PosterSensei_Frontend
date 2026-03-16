import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Save, Lock, Eye, EyeOff,
    Trash2, Plus, ShoppingBag, Heart, Shield, ChevronRight,
    Camera, Settings, LogOut, Bell, Sparkles, ChevronLeft,
    Truck, CreditCard, CheckCircle2, Tag, MapPin, Loader2
} from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../utils/alerts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const { addItem } = useCart();
    const { wishlist, toggleWishlist, loading: loadingWishlist } = useWishlist();
    const [tab, setTab] = useState<'profile' | 'security' | 'addresses' | 'orders' | 'wishlist'>('profile');
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

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
    const [uploading, setUploading] = useState(false);

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

    const handleSwitchTab = (id: any) => { 
        setTab(id); 
        setError(''); 
        setSuccess(''); 
        setSelectedOrder(null); 
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            const { data } = await axios.put('/api/users/profile', { name, email, phone, ...(password ? { password } : {}) });
            updateUser(data);
            showSuccess('Profile Synchronized', 'Your identity details have been successfully updated in the studio vault.');
            setPassword('');
        } catch (err: any) { 
            showError('Update Failed', err.response?.data?.message || 'An error occurred while attempting to sync your profile.'); 
        }
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
            showSuccess('Location Established', 'The new shipping destination has been added to your secure vault.');
        } catch (err: any) { 
            showError('Vault Error', 'Failed to synchronize the new address with your profile.'); 
        }
        finally { setSaving(false); }
    };

    const deleteAddress = async (id: string) => {
        const confirmed = await showConfirm('Remove Location?', 'Are you sure you want to delete this shipping destination?');
        if (!confirmed) return;

        const updated = addresses.filter((a: any) => a._id !== id);
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated });
            updateUser(data);
            setAddresses(data.addresses);
            showSuccess('Location Removed', 'The shipping destination has been purged from your vault.');
        } catch { 
            showError('Purge Failed', 'An error occurred while attempting to remove the address.'); 
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            // Upload to Cloudinary via our backend
            const { data: uploadData } = await axios.post('/api/upload/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update user profile with new image URL
            const { data: userData } = await axios.put('/api/users/profile', { profilePic: uploadData.imageUrl });
            updateUser(userData);
            showSuccess('Portrait Updated', 'Your new studio portrait has been successfully uploaded.');
        } catch (err: any) {
            showError('Upload Failed', err.response?.data?.message || 'Failed to transmit the image to the studio vault.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (tab === 'orders' && user && !selectedOrder) {
            setLoadingOrders(true);
            axios.get('/api/orders/myorders')
                .then(r => setOrders(r.data))
                .catch(() => setOrders([]))
                .finally(() => setLoadingOrders(false));
        }
    }, [tab, user, selectedOrder]);

    const fetchOrderDetail = (id: string) => {
        setLoadingOrderDetail(true);
        axios.get(`/api/orders/${id}`)
            .then(r => setSelectedOrder(r.data))
            .catch(() => setSelectedOrder(null))
            .finally(() => setLoadingOrderDetail(false));
    };

    const statusClass = (s: string) => `badge status-${s}`;

    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const TABS = [
        { id: 'profile', label: 'Identity', icon: <User size={18} /> },
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
        { id: 'wishlist', label: 'Curated List', icon: <Heart size={18} /> },
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
                            <input
                                type="file"
                                id="profile-upload"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <button 
                                onClick={() => document.getElementById('profile-upload')?.click()}
                                disabled={uploading}
                                style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', border: '3px solid var(--surface)', borderRadius: '15px', padding: '0.5rem', cursor: 'pointer' }}
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
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

                            <button onClick={logout} style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                <LogOut size={18} /> Terminate Session
                            </button>
                        </motion.div>
                    </aside>

                    {/* CONTENT BENTO */}
                    <main>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

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

                                    {tab === 'orders' && (
                                        <motion.div
                                            key="orders"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            {selectedOrder ? (
                                                <>
                                                    <button 
                                                        onClick={() => setSelectedOrder(null)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                                                    >
                                                        <ChevronLeft size={18} /> BACK TO ORDERS
                                                    </button>
                                                    
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                                        <div>
                                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Order Details</h2>
                                                            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                                REF: #{selectedOrder._id?.slice(-8).toUpperCase()} · {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <span className={`badge ${statusClass(selectedOrder.status)}`} style={{ textTransform: 'capitalize', borderRadius: '12px', padding: '0.5rem 1.25rem' }}>{selectedOrder.status}</span>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                                                        {[
                                                            { icon: <MapPin size={18} />, label: 'DESTINATION', content: `${selectedOrder.shippingAddress?.address}, ${selectedOrder.shippingAddress?.city}` },
                                                            { icon: <Truck size={18} />, label: 'LOGISTICS', content: selectedOrder.deliveryMethod === 'post' ? 'Standard Post' : 'Direct Service' },
                                                            { icon: <CreditCard size={18} />, label: 'FINANCE', content: `${selectedOrder.paymentMethod} (${selectedOrder.isPaid ? 'Cleared' : 'Pending'})` },
                                                        ].map(({ icon, label, content }) => (
                                                            <div key={label} style={{ background: 'var(--surface-2)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', marginBottom: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>{icon} {label}</div>
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.4 }}>{content}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div style={{ background: 'var(--surface-2)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem', marginBottom: '1.5rem' }}>
                                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Creative Assets</h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            {selectedOrder.orderItems?.map((item: any, i: number) => (
                                                                <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: i < selectedOrder.orderItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                                    <img src={item.image} alt="" style={{ width: '80px', height: '90px', objectFit: 'cover', borderRadius: '16px' }} />
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>{item.title}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Qty: {item.qty} {item.size && `· Size: ${item.size}`}</div>
                                                                    </div>
                                                                    <div style={{ fontWeight: 900, color: 'var(--primary)' }}>LKR {(item.price * item.qty).toFixed(0)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '2rem', gap: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)' }}>
                                                            <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>TOTAL INVESTMENT</span>
                                                            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>LKR {selectedOrder.totalPrice}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem' }}>Order Archive</h2>
                                                    {loadingOrders ? (
                                                        Array(3).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: '100px', marginBottom: '1rem', borderRadius: '24px' }} />)
                                                    ) : orders.length === 0 ? (
                                                        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                                                            <ShoppingBag size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>Zero creative acquisitions detected.</p>
                                                            <Link to="/shop" className="btn btn-primary rounded-pill px-4">Begin Journey</Link>
                                                        </div>
                                                    ) : (
                                                        orders.map(order => (
                                                            <div 
                                                                key={order._id} 
                                                                onClick={() => fetchOrderDetail(order._id)} 
                                                                className="card" 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem', marginBottom: '1rem', cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '24px', transition: 'all 0.3s' }}
                                                            >
                                                                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                                                    {order.orderItems.slice(0, 3).map((item: any, i: number) => (
                                                                        <img key={i} src={item.image} alt="" style={{ width: '60px', height: '65px', objectFit: 'cover', borderRadius: '12px' }} />
                                                                    ))}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                                        {order.orderItems.length === 1 ? order.orderItems[0].title : `${order.orderItems.length} Creative Assets`}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>LKR {order.totalPrice}</div>
                                                                    <span className={`badge ${statusClass(order.status)}`} style={{ textTransform: 'capitalize', borderRadius: '10px', fontSize: '0.7rem' }}>{order.status}</span>
                                                                </div>
                                                                <ChevronRight size={18} color="var(--text-secondary)" />
                                                            </div>
                                                        ))
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {tab === 'wishlist' && (
                                        <motion.div
                                            key="wishlist"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem' }}>Curated Selections</h2>
                                            {loadingWishlist ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                                    {Array(4).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: '280px', borderRadius: '24px' }} />)}
                                                </div>
                                            ) : wishlist.length === 0 ? (
                                                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                                                    <Heart size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>Collection presently empty. Save what inspires you.</p>
                                                    <Link to="/shop" className="btn btn-primary rounded-pill px-4">Browse Gallery</Link>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                                    {wishlist.map(p => (
                                                        <div key={p._id} className="card product-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
                                                            <div className="product-card-img" style={{ position: 'relative', paddingTop: '130%', overflow: 'hidden' }}>
                                                                <Link to={`/product/${p._id}`}>
                                                                    <img src={p.imageUrl} alt={p.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </Link>
                                                                <button
                                                                    className="wishlist-btn active"
                                                                    onClick={() => toggleWishlist(p._id)}
                                                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', border: 'none', borderRadius: '12px', padding: '0.5rem', cursor: 'pointer', color: 'var(--primary)' }}
                                                                >
                                                                    <Heart size={16} fill="currentColor" />
                                                                </button>
                                                            </div>
                                                            <div style={{ padding: '1.25rem' }}>
                                                                <Link to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }} className="text-truncate">{p.title}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '1rem' }}>{p.anime}</div>
                                                                </Link>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <span style={{ fontWeight: 900, color: 'var(--primary)' }}>LKR {p.price}</span>
                                                                    <button onClick={() => addItem(p)} className="btn btn-primary btn-sm rounded-pill" style={{ padding: '0.4rem 1rem' }}>
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                    {/* Alert system replaced by SweetAlert2 */}
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
