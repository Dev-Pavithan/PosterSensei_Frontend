import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Truck, Home, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const STEPS = ['Address', 'Delivery', 'Review & Pay'];

const Checkout = () => {
    const { items, subtotal, clearCart, discount, coupon } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'post' | 'local_setup'>('post');
    const [address, setAddress] = useState({ address: '', city: '', postalCode: '', country: 'Srilanka' });
    const [paymentMethod] = useState('Cash on Delivery');
    const shipping = (subtotal - discount) >= 999 ? 0 : 79;
    const total = subtotal - discount + shipping;

    if (!user) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Please login to continue checkout.</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
    );

    if (items.length === 0) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
        </div>
    );

    const handlePlaceOrder = async () => {
        setLoading(true); setError('');
        try {
            const orderItems = items.map(i => ({ title: i.title, qty: i.qty, image: i.imageUrl, price: i.price, size: i.size, product: i._id }));
            const { data } = await axios.post('/api/orders', {
                orderItems, shippingAddress: address, deliveryMethod, paymentMethod, totalPrice: total,
                discount, couponCode: coupon?.code || '',
            }, { withCredentials: true });
            clearCart();
            navigate(`/orders/${data._id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '860px' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', padding: '1.25rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', background: i <= step ? 'var(--primary)' : 'var(--border)', color: i <= step ? 'white' : 'var(--text-muted)', transition: 'all 0.3s' }}>
                                {i < step ? <CheckCircle2 size={16} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: i === step ? 700 : 500, color: i <= step ? 'var(--primary)' : 'var(--text-muted)' }}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />}
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
                <div>
                    {/* Step 0: Address */}
                    {step === 0 && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={18} color="var(--primary)" /> Delivery Address
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="input-label">Street Address</label>
                                    <input className="input" placeholder="Door No., Street, Area" value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">City</label>
                                    <input className="input" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">PIN Code</label>
                                    <input className="input" placeholder="6-digit PIN" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="input-label">Country</label>
                                    <input className="input" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} disabled={!address.address || !address.city || !address.postalCode} className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
                                Continue to Delivery <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Step 1: Delivery Method */}
                    {step === 1 && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck size={18} color="var(--primary)" /> Choose Delivery Method
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { val: 'post', icon: <Truck size={28} />, title: 'Standard Post', desc: 'We print and ship it to your address. Arrives in 5-7 business days.', price: shipping === 0 ? 'FREE' : `₹${shipping}` },
                                    { val: 'local_setup', icon: <Home size={28} />, title: 'Room Makeover Service', desc: 'Our team visits your home, brings the posters, and installs everything professionally on your wall.', price: 'From ₹299', badge: '✨ Premium' },
                                ].map(({ val, icon, title, desc, price, badge }) => (
                                    <div key={val} onClick={() => setDeliveryMethod(val as any)} style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `2px solid ${deliveryMethod === val ? 'var(--primary)' : 'var(--border)'}`, background: deliveryMethod === val ? 'var(--primary-light)' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ color: deliveryMethod === val ? 'var(--primary)' : 'var(--text-muted)' }}>{icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                    <div style={{ fontWeight: 700 }}>{title}</div>
                                                    {badge && <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{badge}</span>}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setStep(0)} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Back</button>
                                <button onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>Review Order <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Review Your Order</h3>
                            {items.map(item => (
                                <div key={`${item._id}-${item.size}`} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                                    <img src={item.imageUrl} alt={item.title} style={{ width: '60px', height: '66px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.qty} {item.size && `· Size: ${item.size}`}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toFixed(0)}</div>
                                </div>
                            ))}
                            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <div>📍 {address.address}, {address.city} - {address.postalCode}</div>
                                <div style={{ marginTop: '0.3rem' }}>🚚 {deliveryMethod === 'post' ? 'Standard Post' : 'Room Makeover Service'} · 💳 {paymentMethod}</div>
                            </div>
                            {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Back</button>
                                <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}>
                                    {loading ? 'Placing Order...' : `Place Order · ₹${total.toFixed(0)}`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary sidebar */}
                <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '130px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Order Summary</div>
                    {items.slice(0, 2).map(item => (
                        <div key={item._id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <img src={item.imageUrl} alt="" style={{ width: '44px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                            <div style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{item.title}<br /><span style={{ color: 'var(--text-muted)' }}>x{item.qty}</span></div>
                        </div>
                    ))}
                    {items.length > 2 && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>+{items.length - 2} more items</div>}
                    <hr className="divider" />
                    {[
                        { label: 'Subtotal', val: `₹${subtotal.toFixed(0)}` },
                        ...(discount > 0 ? [{ label: 'Discount', val: `-₹${discount.toFixed(0)}`, color: 'var(--success)' }] : []),
                        { label: 'Shipping', val: shipping === 0 ? 'FREE' : `₹${shipping}` }
                    ].map(({ label, val, color }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem', color: color || 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{label}</span><span>{val}</span>
                        </div>
                    ))}
                    <hr className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)' }}>
                        <span>Total</span><span>₹{total.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
