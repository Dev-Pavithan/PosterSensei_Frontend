import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    User, Mail, Phone, MapPin, Package, Heart, Star, 
    Settings, LogOut, ChevronRight, Edit2, Camera,
    CheckCircle, XCircle, Clock, Search, Menu, X, Trash2,
    Shield, Share2, Plus, ArrowLeft, Eye, EyeOff, Loader, Home, LogIn,
    ShoppingBag, MessageSquare, CheckCircle2, Truck, CreditCard, Sparkles, Loader2, ChevronLeft, Save
} from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import { showSuccess, showError, showConfirm } from '../utils/alerts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';
import logo from '../images/non_background_logo.png';
import './UserProfile.css';

const UserProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const { addItem } = useCart();
    const { wishlist, toggleWishlist, loading: loadingWishlist } = useWishlist();
    
    // State management
    const [tab, setTab] = useState('profile');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewProduct, setReviewProduct] = useState<any>(null);

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Security state
    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPass, setShowPass] = useState(false);

    // Address state
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [addressForm, setAddressForm] = useState({ 
        address: '', 
        city: '', 
        postalCode: '', 
        country: 'Srilanka' 
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState({
        ordersCount: 0,
        wishlistCount: 0,
        reviewsCount: 0
    });

    const handleSwitchTab = (tabId: string) => {
        setTab(tabId);
        setMobileMenuOpen(false);
        setSelectedOrder(null);
        window.scrollTo(0, 0);
    };

    const fetchMyReviews = async () => {
        setLoadingReviews(true);
        try {
            const { data } = await axios.get('/api/products/myreviews');
            setMyReviews(data);
            setStats(prev => ({ ...prev, reviewsCount: data.length }));
        } catch (err) {
            setMyReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleDeleteReview = async (productId: string, reviewId: string) => {
        const confirmed = await showConfirm('Remove Review?', 'Are you sure you want to delete this feedback?');
        if (!confirmed) return;

        try {
            await axios.delete(`/api/products/${productId}/reviews/${reviewId}`);
            showSuccess('Review Purged', 'Your feedback has been removed.');
            setMyReviews(prev => prev.filter(r => r.reviewId !== reviewId));
            setStats(prev => ({ ...prev, reviewsCount: prev.reviewsCount - 1 }));
        } catch (err) {
            showError('Deletion Failed', 'Failed to remove the review.');
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.put('/api/users/profile', { 
                name: profileForm.name, 
                phone: profileForm.phone 
            });
            updateUser(data);
            showSuccess('Profile Updated', 'Your identity details have been successfully synced.');
        } catch (err: any) { 
            showError('Update Failed', err.response?.data?.message || 'Failed to sync your profile.'); 
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            return showError('Mismatch', 'New passwords do not match.');
        }
        setSaving(true);
        try {
            await axios.put('/api/users/profile', { password: securityForm.newPassword });
            showSuccess('Security Tightened', 'Your password has been changed.');
            setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            showError('Security Error', err.response?.data?.message || 'Failed to update password.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const updated = [...addresses, addressForm];
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated });
            updateUser(data);
            setAddresses(data.addresses);
            setAddressForm({ address: '', city: '', postalCode: '', country: 'Srilanka' });
            showSuccess('Location Added', 'Shipment endpoint added to your vault.');
        } catch (err: any) { 
            showError('Vault Error', 'Failed to synchronize address.'); 
        } finally {
            setSaving(false);
        }
    };

    const deleteAddress = async (id: string) => {
        const confirmed = await showConfirm('Remove Location?', 'Purge this shipping destination?');
        if (!confirmed) return;

        const updated = addresses.filter((a: any) => a._id !== id);
        try {
            const { data } = await axios.put('/api/users/profile', { addresses: updated });
            updateUser(data);
            setAddresses(data.addresses);
            showSuccess('Location Removed', 'Destination purged from your vault.');
        } catch { 
            showError('Purge Failed', 'Failed to remove the address.'); 
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data: uploadData } = await axios.post('/api/upload/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { data: userData } = await axios.put('/api/users/profile', { profilePic: uploadData.imageUrl });
            updateUser(userData);
            showSuccess('Portrait Updated', 'Studio profile picture transmitted successfully.');
        } catch (err: any) {
            showError('Upload Failed', 'Failed to transmit the image.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setStats(prev => ({ ...prev, wishlistCount: wishlist.length }));
        }
    }, [wishlist, user]);

    useEffect(() => {
        if (!user) return;
        
        if (tab === 'orders' && !selectedOrder) {
            setLoadingOrders(true);
            axios.get('/api/orders/myorders')
                .then(r => {
                    setOrders(r.data);
                    setStats(prev => ({ ...prev, ordersCount: r.data.length }));
                })
                .catch(() => setOrders([]))
                .finally(() => setLoadingOrders(false));
            fetchMyReviews();
        }
        
        if (tab === 'reviews') {
            fetchMyReviews();
        }
    }, [tab, user]);

    const fetchOrderDetail = (id: string) => {
        setLoadingOrderDetail(true);
        axios.get(`/api/orders/${id}`)
            .then(r => setSelectedOrder(r.data))
            .catch(() => setSelectedOrder(null))
            .finally(() => setLoadingOrderDetail(false));
    };

    const statusBadge = (s: string) => {
        const config: any = {
            pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            processing: { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
            shipped: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            delivered: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            cancelled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        };
        const c = config[s] || config.pending;
        return (
            <span style={{ 
                padding: '4px 12px', 
                borderRadius: '100px', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                textTransform: 'uppercase',
                background: c.bg,
                color: c.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {s === 'pending' && <Clock size={12} />}
                {s === 'delivered' && <CheckCircle size={12} />}
                {s}
            </span>
        );
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const navigationTabs = [
        { id: 'profile', label: 'Identity', icon: <User size={18} /> },
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
        { id: 'wishlist', label: 'Curated List', icon: <Heart size={18} /> },
        { id: 'reviews', label: 'Review Log', icon: <MessageSquare size={18} /> },
        { id: 'addresses', label: 'Shipping Vault', icon: <MapPin size={18} /> },
        { id: 'security', label: 'Cyber Defense', icon: <Shield size={18} /> },
    ];

    if (!user) return (
        <div className="auth-required">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
                <div className="auth-lock-icon">🔒</div>
                <h2>Access Restricted</h2>
                <p>Please authenticate to access your studio profile.</p>
                <Link to="/login" className="btn btn-primary btn-lg rounded-pill">Initialize Login</Link>
            </motion.div>
        </div>
    );

    return (
        <div className="profile-container">
            {/* MOBILE OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-overlay"
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="container profile-layout">
                {/* SIDEBAR */}
                <aside className={`profile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-mobile-header">
                        <div className="sidebar-brand">
                            <img src={logo} alt="Logo" />
                            <span>PosterSensei</span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="close-sidebar">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        {navigationTabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleSwitchTab(t.id)}
                                className={`nav-item ${tab === t.id ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{t.icon}</span>
                                <span className="nav-label">{t.label}</span>
                                {tab === t.id && <ChevronRight size={16} className="active-arrow" />}
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="stats-card">
                            <div className="stat">
                                <span className="stat-value">{stats.ordersCount}</span>
                                <span className="stat-label">Orders</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{stats.wishlistCount}</span>
                                <span className="stat-label">Wishlist</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{stats.reviewsCount}</span>
                                <span className="stat-label">Reviews</span>
                            </div>
                        </div>
                        <button onClick={logout} className="logout-btn">
                            <LogOut size={18} /> Terminate Session
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="profile-main">
                    {/* Persistent Mobile Bar */}
                    <div className="profile-mobile-bar">
                        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={22} />}
                        </button>
                        <span>Profile Settings</span>
                        <div style={{ width: 24 }} /> {/* Spacer */}
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === 'profile' && (
                            <motion.section key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                <header className="profile-header">
                                    <div className="header-mesh" />
                                    <div className="header-content">
                                        <div className="user-visuals">
                                            <div className="avatar-wrapper">
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} alt="" className="user-avatar" />
                                                ) : (
                                                    <div className="avatar-initials">{getUserInitials(user.name)}</div>
                                                )}
                                                <input type="file" id="pfp-upload" hidden accept="image/*" onChange={handleImageUpload} />
                                                <button className="upload-btn" onClick={() => document.getElementById('pfp-upload')?.click()}>
                                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                                </button>
                                            </div>
                                            <div className="user-text">
                                                <h1>{user.name}</h1>
                                                <div className="user-meta">
                                                    <span><Mail size={14} /> {user.email}</span>
                                                    {user.phone && <span><Phone size={14} /> {user.phone}</span>}
                                                    {user.isAdmin && <span className="admin-badge"><Sparkles size={14} /> ADMIN</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                <div className="panel-header">
                                    <h2>Personal Identity</h2>
                                    <p>Manage your core profile details and identity.</p>
                                </div>
                                <form onSubmit={handleProfileUpdate} className="profile-form">
                                    <div className="form-grid">
                                        <div className="input-field">
                                            <label>FULL NAME</label>
                                            <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="Ex: John Wick" />
                                        </div>
                                        <div className="input-field disabled">
                                            <label>EMAIL ADDRESS</label>
                                            <input value={profileForm.email} readOnly />
                                        </div>
                                        <div className="input-field">
                                            <label>CONTACT PHONE</label>
                                            <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+94 77 XXX XXXX" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={saving} className="save-btn btn-primary">
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Identity
                                    </button>
                                </form>
                            </motion.section>
                        )}

                        {tab === 'addresses' && (
                            <motion.section key="addresses" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                <div className="panel-header">
                                    <h2>Shipping Vault</h2>
                                    <p>Configure your primary and secondary logistics endpoints.</p>
                                </div>
                                
                                <div className="address-grid">
                                    {addresses.map((a: any) => (
                                        <div key={a._id} className="address-card">
                                            <div className="address-info">
                                                <div className="address-main">{a.address}</div>
                                                <div className="address-sub">{a.city}, {a.postalCode}</div>
                                            </div>
                                            <button onClick={() => deleteAddress(a._id)} className="delete-btn"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>

                                <div className="new-address-section">
                                    <h3>Initialize New Location</h3>
                                    <form onSubmit={handleAddAddress} className="address-form">
                                        <input className="full-width" placeholder="Street Address" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} required />
                                        <input placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                                        <input placeholder="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} required />
                                        <button type="submit" disabled={saving} className="add-btn btn-primary">Commit Location</button>
                                    </form>
                                </div>
                            </motion.section>
                        )}

                        {tab === 'security' && (
                            <motion.section key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                <div className="panel-header">
                                    <h2>Cyber Defense</h2>
                                    <p>Ensure your account remains encrypted and secure.</p>
                                </div>
                                <form onSubmit={handlePasswordUpdate} className="security-form">
                                    <div className="password-group">
                                        <div className="input-field">
                                            <label>NEW PASSWORD</label>
                                            <div className="password-wrap">
                                                <input type={showPass ? 'text' : 'password'} value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} />
                                                <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                        </div>
                                        <div className="input-field">
                                            <label>CONFIRM PASSWORD</label>
                                            <input type={showPass ? 'text' : 'password'} value={securityForm.confirmPassword} onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={saving || !securityForm.newPassword} className="save-btn btn-primary">Establish Security</button>
                                </form>
                            </motion.section>
                        )}

                        {tab === 'orders' && (
                            <motion.section key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                {selectedOrder ? (
                                    <div className="order-details-view">
                                        <button onClick={() => setSelectedOrder(null)} className="back-link"><ChevronLeft size={18} /> BACK TO ARCHIVE</button>
                                        <div className="order-view-header">
                                            <div>
                                                <h2>Order Details</h2>
                                                <span className="order-ref">REF: #{selectedOrder._id?.slice(-8).toUpperCase()} · {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {statusBadge(selectedOrder.status)}
                                        </div>
                                        
                                        <div className="order-info-cards">
                                            <div className="info-card">
                                                <MapPin size={18} className="icon" />
                                                <div>
                                                    <label>DESTINATION</label>
                                                    <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                                                </div>
                                            </div>
                                            <div className="info-card">
                                                <Truck size={18} className="icon" />
                                                <div>
                                                    <label>LOGISTICS</label>
                                                    <p>{selectedOrder.deliveryMethod === 'post' ? 'Standard Post' : 'Direct Service'}</p>
                                                </div>
                                            </div>
                                            <div className="info-card">
                                                <CreditCard size={18} className="icon" />
                                                <div>
                                                    <label>FINANCE</label>
                                                    <p>{selectedOrder.paymentMethod} · {selectedOrder.isPaid ? 'Cleared' : 'Pending'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="order-items-list">
                                            <h3>Creative Assets</h3>
                                            {selectedOrder.orderItems?.map((item: any, i: number) => (
                                                <div key={i} className="order-item">
                                                    <img src={item.image} alt="" />
                                                    <div className="item-details">
                                                        <span className="item-name">{item.title}</span>
                                                        <span className="item-meta">Qty: {item.qty} · LKR {item.price}</span>
                                                    </div>
                                                    <div className="item-total">LKR {item.price * item.qty}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-summary">
                                            <div className="summary-row total">
                                                <span>TOTAL INVESTMENT</span>
                                                <span>LKR {selectedOrder.totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="panel-header">
                                            <h2>Order Archive</h2>
                                            <p>Review and track your creative acquisitions.</p>
                                        </div>
                                        {loadingOrders ? (
                                            <div className="loader-box"><Loader2 className="animate-spin" size={40} /></div>
                                        ) : orders.length === 0 ? (
                                            <div className="empty-state">
                                                <ShoppingBag size={48} />
                                                <p>Zero creative acquisitions detected.</p>
                                                <Link to="/shop" className="btn btn-primary">Begin Journey</Link>
                                            </div>
                                        ) : (
                                            <div className="orders-list">
                                                {orders.map(order => (
                                                    <div key={order._id} className="order-card" onClick={() => fetchOrderDetail(order._id)}>
                                                        <div className="order-previews">
                                                            {order.orderItems.slice(0, 3).map((it: any, i: number) => (
                                                                <img key={i} src={it.image} alt="" />
                                                            ))}
                                                        </div>
                                                        <div className="order-main">
                                                            <span className="order-title">{order.orderItems.length} Assets · #{order._id.slice(-6)}</span>
                                                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="order-right">
                                                            <span className="order-price">LKR {order.totalPrice}</span>
                                                            {statusBadge(order.status)}
                                                        </div>
                                                        <ChevronRight size={18} className="arrow" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.section>
                        )}

                        {tab === 'wishlist' && (
                            <motion.section key="wishlist" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                <div className="panel-header">
                                    <h2>Curated List</h2>
                                    <p>Your library of prospective studio acquisitions.</p>
                                </div>
                                {wishlist.length === 0 ? (
                                    <div className="empty-state">
                                        <Heart size={48} />
                                        <p>Your curated collection is currently empty.</p>
                                        <Link to="/shop" className="btn btn-primary">Explore Posters</Link>
                                    </div>
                                ) : (
                                    <div className="wishlist-grid">
                                        {wishlist.map((item: any) => (
                                            <div key={item._id} className="wishlist-card">
                                                <Link to={`/product/${item._id}`} className="card-img">
                                                    <img src={item.imageUrl} alt={item.title} />
                                                </Link>
                                                <div className="card-body">
                                                    <h3>{item.title}</h3>
                                                    <div className="card-footer">
                                                        <span className="price">LKR {item.price}</span>
                                                         <button onClick={() => toggleWishlist(item._id)} className="remove-btn" title="Remove from wishlist">
                                                            <Heart size={18} fill="#ef4444" color="#ef4444" />
                                                         </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {tab === 'reviews' && (
                            <motion.section key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="content-panel">
                                <div className="panel-header">
                                    <h2>Review Log</h2>
                                    <p>Feedback logs for your studio acquisitions.</p>
                                </div>
                                {loadingReviews ? (
                                    <div className="loader-box"><Loader2 className="animate-spin" size={40} /></div>
                                ) : myReviews.length === 0 ? (
                                    <div className="empty-state">
                                        <MessageSquare size={48} />
                                        <p>No feedback has been recorded yet.</p>
                                        <Link to="/shop" className="btn btn-primary">See Collection</Link>
                                    </div>
                                ) : (
                                    <div className="reviews-list">
                                        {myReviews.map(r => (
                                            <div key={r.reviewId} className="review-card">
                                                <img src={r.productImage} className="prod-img" alt="" />
                                                <div className="review-main">
                                                    <div className="review-head">
                                                        <h4>{r.productTitle}</h4>
                                                        <div className="review-stars">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#f59e0b' : 'none'} color="#f59e0b" />)}
                                                        </div>
                                                    </div>
                                                    <p>{r.comment}</p>
                                                    {r.image && <img src={r.image} className="review-img" alt="" />}
                                                </div>
                                                <button onClick={() => handleDeleteReview(r.productId, r.reviewId)} className="delete-btn"><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                productId={reviewProduct?._id}
                productTitle={reviewProduct?.title}
                productImage={reviewProduct?.imageUrl}
                onSuccess={() => {
                    fetchMyReviews();
                    if (selectedOrder) fetchOrderDetail(selectedOrder._id);
                }}
            />
        </div>
    );
};

export default UserProfile;
