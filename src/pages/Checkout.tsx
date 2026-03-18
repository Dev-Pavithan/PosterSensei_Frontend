import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MapPin, Truck, Home, CheckCircle2, ChevronRight, Package, Zap } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { showSuccess, showError } from '../utils/alerts';

const STEPS = ['Address', 'Delivery', 'Review & Pay'];

const Checkout = () => {
    const { items: cartItems, subtotal: cartSubtotal, clearCart, discount: cartDiscount, coupon: cartCoupon } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const buyNowItem = location.state?.buyNowItem;
    const items = buyNowItem ? [buyNowItem] : cartItems;
    const subtotal = buyNowItem ? (buyNowItem.price * buyNowItem.qty) : cartSubtotal;
    const discount = buyNowItem ? 0 : cartDiscount;
    const coupon = buyNowItem ? null : cartCoupon;
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

    React.useEffect(() => {
        const fetchDeliveryOptions = async () => {
            try {
                const { data } = await axios.get('/api/delivery');
                setDeliveryMethods(data);
                if (data.length > 0) setSelectedDelivery(data[0]);
            } catch (err) { }
        };
        fetchDeliveryOptions();
    }, []);

    const [address, setAddress] = useState({ address: '', city: '', postalCode: '', country: 'Srilanka' });
    const [paymentMethod] = useState('Cash on Delivery');
    const shipping = selectedDelivery?.price || 0;
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
        setLoading(true);
        try {
            const orderItems = items.map(i => ({ title: i.title, qty: i.qty, image: i.imageUrl, price: i.price, size: i.size, product: i._id }));
            const { data } = await axios.post('/api/orders', {
                orderItems, shippingAddress: address, deliveryMethod: selectedDelivery?.title || 'Standard Post', paymentMethod, totalPrice: total,
                discount, couponCode: coupon?.code || '',
            }, { withCredentials: true });
            showSuccess('Order Transmitted', 'Your creative acquisition has been registered. Redirecting to status...');
            if (!buyNowItem) {
                clearCart();
            }
            navigate(`/orders/${data._id}`);
        } catch (err: any) {
            showError('Transmission Failed', err.response?.data?.message || 'Failed to place order. Please verify your connection.');
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(320px, 100%, 1fr), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                <div style={{ order: 1 }}>
                    {/* Step 0: Address */}
                    {step === 0 && (
                        <div className="card" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={18} color="var(--primary)" /> Delivery Address
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                            <button onClick={() => setStep(1)} disabled={!address.address || !address.city || !address.postalCode} className="btn btn-primary btn-lg btn-full" style={{ marginTop: '1.5rem' }}>
                                Continue to Delivery <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Step 1: Delivery Method */}
                    {step === 1 && (
                        <div className="card" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck size={18} color="var(--primary)" /> Choose Delivery Method
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {deliveryMethods.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading delivery options...</div>
                                ) : deliveryMethods.map((m) => (
                                    <div key={m._id} onClick={() => setSelectedDelivery(m)} style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedDelivery?._id === m._id ? 'var(--primary)' : 'var(--border)'}`, background: selectedDelivery?._id === m._id ? 'var(--primary-light)' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ color: selectedDelivery?._id === m._id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                {m.iconType === 'Home' ? <Home size={28} /> : m.iconType === 'Package' ? <Package size={28} /> : m.iconType === 'Zap' ? <Zap size={28} /> : <Truck size={28} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                    <div style={{ fontWeight: 700 }}>{m.title}</div>
                                                    {m.badge && <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{m.badge}</span>}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.description}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                                                {m.price === 0 ? 'FREE' : `${m.priceType === 'from' ? 'From ' : ''}LKR ${m.price}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setStep(0)} className="btn btn-ghost" style={{ border: '1px solid var(--border)', flex: 1 }}>Back</button>
                                <button onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ flex: 2 }}>Review Order <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <div className="card" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Review Your Order</h3>
                            {items.map(item => (
                                <div key={`${item._id}-${item.size}`} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                                    <img src={item.imageUrl} alt={item.title} style={{ width: '60px', height: '66px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.qty} {item.size && `· Size: ${item.size}`}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>LKR {(item.price * item.qty).toFixed(0)}</div>
                                </div>
                            ))}
                            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <div>📍 {address.address}, {address.city} - {address.postalCode}</div>
                                <div style={{ marginTop: '0.3rem' }}>🚚 {selectedDelivery?.title || 'Delivery Method'} · 💳 {paymentMethod}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ border: '1px solid var(--border)', flex: 1 }}>Back</button>
                                <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 2, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}>
                                    {loading ? 'Placing Order...' : `Place Order · LKR ${total.toFixed(0)}`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary sidebar */}
                <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '130px', order: window.innerWidth < 768 ? 0 : 2 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Order Summary</div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                    {items.map(item => (
                        <div key={`${item._id}-${item.size}`} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <img src={item.imageUrl} alt="" style={{ width: '44px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                            <div style={{ flex: 1, fontSize: '0.78rem', lineHeight: 1.4 }}>{item.title}<br /><span style={{ color: 'var(--text-muted)' }}>{item.qty} x LKR {item.price}</span></div>
                        </div>
                    ))}
                    </div>
                    <hr className="divider" />
                    {[
                        { label: 'Subtotal', val: `LKR ${subtotal.toFixed(0)}` },
                        ...(discount > 0 ? [{ label: 'Discount', val: `-LKR ${discount.toFixed(0)}`, color: 'var(--success)' }] : []),
                        { label: 'Shipping', val: shipping === 0 ? 'FREE' : `LKR ${shipping}` }
                    ].map(({ label, val, color }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem', color: color || 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{label}</span><span>{val}</span>
                        </div>
                    ))}
                    <hr className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)' }}>
                        <span>Total</span><span>LKR {total.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
