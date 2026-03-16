import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, ShoppingCart, X, Shield } from 'lucide-react';
import { showSuccess, showError } from '../utils/alerts';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
    const { items, removeItem, updateQty, subtotal, clearCart, coupon, applyCoupon, removeCoupon, discount } = useCart();
    const [couponCode, setCouponCode] = React.useState('');
    const [couponLoading, setCouponLoading] = React.useState(false);
    const navigate = useNavigate();
    
    const shipping = (subtotal - discount) >= 999 ? 0 : 79;
    const total = subtotal - discount + shipping;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        try {
            const { data } = await axios.post('/api/coupons/validate', { code: couponCode, cartTotal: subtotal });
            applyCoupon(data);
            setCouponCode('');
        } catch (err: any) {
            showError('Invalid Coupon', err.response?.data?.message || 'The entered coupon code is not valid.');
        } finally {
            setCouponLoading(false);
        }
    };

    if (items.length === 0) return (
        <div className="container" style={{ textAlign: 'center', padding: '10vh 2rem' }}>
            <div style={{ width: '120px', height: '120px', background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={56} />
            </div>
            <h2 style={{ fontWeight: 900, marginBottom: '0.75rem', fontSize: 'var(--font-xl)', color: 'var(--text-primary)' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Add some amazing anime posters to your collection!</p>
            <Link to="/shop" className="btn btn-primary btn-lg">Explore Posters <ArrowRight size={20} /></Link>
        </div>
    );

    return (
        <div className="container" style={{ paddingBlock: '3rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontWeight: 900, fontSize: 'var(--font-xl)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Shopping Cart</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <ShoppingCart size={18} /> {items.length} {items.length === 1 ? 'Item' : 'Items'} in bag
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(320px, 100%, 600px), 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                {/* Cart items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                        <button onClick={clearCart} style={{ color: 'var(--error)', fontSize: '0.85rem', background: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16} /> Empty Cart</button>
                    </div>
                    
                    {items.map(item => (
                        <div key={`${item._id}-${item.size}`} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                            <Link to={`/product/${item._id}`} style={{ width: 'clamp(100px, 15vw, 120px)', aspectRatio: '1/1.2', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Link>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <Link to={`/product/${item._id}`} style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', textDecoration: 'none' }} className="hover-primary">{item.title}</Link>
                                    <button onClick={() => removeItem(item._id, item.size)} style={{ color: 'var(--text-muted)', background: 'none', padding: '4px', alignSelf: 'start' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>{item.anime} {item.size && `· Size: ${item.size}`}</div>
                                
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="qty-stepper" style={{ background: 'var(--surface)', border: '2px solid var(--border)', height: '44px' }}>
                                        <button className="qty-btn" onClick={() => updateQty(item._id, item.qty - 1, item.size)} style={{ width: '36px' }}><Minus size={14} /></button>
                                        <div className="qty-display" style={{ width: '36px', fontWeight: 800 }}>{item.qty}</div>
                                        <button className="qty-btn" onClick={() => updateQty(item._id, item.qty + 1, item.size)} style={{ width: '36px' }}><Plus size={14} /></button>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>LKR {(item.price * item.qty).toFixed(0)}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LKR {item.price} / unit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order summary */}
                <div style={{ flex: '1 1 360px', position: 'sticky', top: '100px' }}>
                    <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Summary</h3>
                        
                        {/* Coupon */}
                        {coupon ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--success-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--success-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem' }}>
                                    <Tag size={18} fill="currentColor" /> {coupon.code} Applied
                                </div>
                                <button onClick={removeCoupon} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800 }}>Remove</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <input type="text" placeholder="Coupon Code" className="input" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600 }} />
                                </div>
                                <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn btn-outline" style={{ paddingInline: '1.5rem' }}>{couponLoading ? '...' : 'Apply'}</button>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                <span>Subtotal</span>
                                <span>LKR {subtotal.toFixed(0)}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--success)', fontWeight: 700 }}>
                                    <span>Discount</span>
                                    <span>-LKR {discount.toFixed(0)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                <span>Shipping</span>
                                <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `LKR ${shipping}`}</span>
                            </div>
                            {shipping > 0 && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                    Add LKR {(999 - (subtotal - discount)).toFixed(0)} more for FREE Shipping!
                                </div>
                            )}
                        </div>

                        <hr className="divider" style={{ marginBlock: '1.5rem', opacity: 0.1 }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span>LKR {total.toFixed(0)}</span>
                        </div>

                        <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-full btn-lg" style={{ height: '60px', fontSize: '1.1rem', fontWeight: 900 }}>
                            Checkout <ArrowRight size={22} />
                        </button>
                        
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <Link to="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Continue Shopping</Link>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%' }}><Shield size={20} /></div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Secure Payment</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>100% Guaranteed safe checkout</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
