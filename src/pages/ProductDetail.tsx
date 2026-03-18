import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, ChevronLeft, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { showError, showSuccess } from '../utils/alerts';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Image as ImageIcon, Trash, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { triggerFlyAnimation } from '../utils/animations';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [mainImg, setMainImg] = useState('');
    const [added, setAdded] = useState(false);
    const [review, setReview] = useState({ rating: 5, comment: '', image: '' });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [eligibility, setEligibility] = useState<{ eligible: boolean, message: string }>({ eligible: false, message: 'Checking eligibility...' });

    useEffect(() => {
        axios.get(`/api/products/${id}`).then(r => {
            setProduct(r.data);
            setMainImg(r.data.imageUrl);
            setSelectedSize(r.data.sizes?.[0] || '');
        }).catch(() => {
            const mock = {
                _id: id, title: 'Naruto - Team 7 Reunion', character: 'Naruto', category: 'Posters',
                price: 449, discount: 25, rating: 4.7, numReviews: 124,
                imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
                sizes: ['A4', 'A3', 'A2', 'A1'], description: 'Premium quality anime poster printed on 200 GSM glossy/matte paper. UV coated for durability. Vibrant colors that won\'t fade. Frame-ready with standard dimensions.',
                orientation: 'Portrait',
                reviews: [
                    { _id: 'r1', name: 'Ravi K.', rating: 5, comment: 'Absolutely love it! Colors are vibrant, print quality is top notch. Framed it immediately.', createdAt: '2025-12-01' },
                    { _id: 'r2', name: 'Priya S.', rating: 4, comment: 'Great quality poster. Delivery was quick. Would have loved thicker paper but happy overall!', createdAt: '2025-11-20' },
                ],
            };
            setProduct(mock);
            setMainImg(mock.imageUrl);
            setSelectedSize(mock.sizes[0]);
        }).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (user && product) {
            axios.get('/api/orders/myorders').then(ordersRes => {
                const orders = ordersRes.data;
                const deliveredOrders = orders.filter((o: any) => o.status === 'delivered' && o.orderItems.some((i: any) => i.product === product._id));
                
                if (deliveredOrders.length === 0) {
                    setEligibility({ eligible: false, message: 'You can only review products that have been delivered to you.' });
                    return;
                }

                // Check how many reviews this user has for this product
                const userReviews = product.reviews.filter((r: any) => r.user === user._id);
                if (userReviews.length < deliveredOrders.length) {
                    setEligibility({ eligible: true, message: '' });
                } else {
                    setEligibility({ eligible: false, message: 'You have already reviewed this product for all your delivered orders.' });
                }
            }).catch(() => setEligibility({ eligible: false, message: 'Error checking eligibility.' }));
        } else if (!user) {
            setEligibility({ eligible: false, message: 'Please login to write a review.' });
        }
    }, [id, user, product]);

    const handleAddToCart = (e: React.MouseEvent) => {
        addItem(product, qty, selectedSize);
        setAdded(true);
        triggerFlyAnimation(e, 'cart');
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyItNow = () => {
        navigate('/checkout', { state: { buyNowItem: { ...product, qty, size: selectedSize, imageUrl: product.images?.[0] || product.imageUrl } } });
    };

    if (loading) return (
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem 0' }}>
            <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-lg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[200, 120, 80, 200, 60].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
            </div>
        </div>
    );

    if (!product) return <div className="container"><p>Product not found.</p></div>;

    return (
        <div className="container" style={{ paddingBlock: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ChevronLeft size={16} /> Back to Shop
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', marginBottom: '4rem' }}>
                {/* Image gallery */}
                <div style={{ top: '100px', height: 'fit-content' }}>
                    <div className="watermark-overlay" style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem', background: 'var(--surface-2)', boxShadow: 'var(--shadow-lg)' }}>
                        <img src={mainImg} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                {/* Product info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div className="badge badge-primary">{product.category}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>{product.character}</div>
                        </div>
                        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1, color: 'var(--text-primary)' }}>{product.title}</h1>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={s <= Math.round(product.rating) ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                                <span style={{ marginLeft: '4px', fontWeight: 800, color: 'var(--text-primary)' }}>{product.rating}</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>({product.reviews?.filter((r: any) => r.status === 'approved').length || 0} Reviews)</span>
                            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                                <ImageIcon size={14} /> {product.orientation || 'Standard'}
                            </span>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>LKR {product.price}</span>
                        </div>
                        {product.discount > 0 && (
                            <div className="badge badge-success" style={{ fontWeight: 800 }}>{product.discount}% OFF</div>
                        )}
                    </div>

                    {/* Sizes */}
                    {product.sizes?.length > 0 && (
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Select Size</div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {product.sizes.map((s: string) => (
                                    <button key={s} onClick={() => setSelectedSize(s)} 
                                        style={{ 
                                            minWidth: '60px', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 800, transition: 'all var(--transition)', cursor: 'pointer',
                                            background: selectedSize === s ? 'var(--primary)' : 'var(--surface)',
                                            color: selectedSize === s ? 'white' : 'var(--text-primary)',
                                            border: `2px solid ${selectedSize === s ? 'var(--primary)' : 'var(--border)'}`,
                                            boxShadow: selectedSize === s ? 'var(--shadow-md)' : 'none'
                                        }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Qty and CTA */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        <div className="qty-stepper" style={{ height: '56px', background: 'var(--surface)', border: '2px solid var(--border)' }}>
                            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px' }}><Minus size={18} /></button>
                            <div className="qty-display" style={{ width: '40px', fontSize: '1.1rem', fontWeight: 800 }}>{qty}</div>
                            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: '40px' }}><Plus size={18} /></button>
                        </div>

                        {product.stock > 0 ? (
                            <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: '1 1 200px', height: '56px', fontSize: '1.1rem' }}>
                                <ShoppingCart size={22} /> {added ? 'Added to Cart!' : 'Add to Cart'}
                            </button>
                        ) : (
                            <button disabled className="btn btn-muted btn-lg" style={{ flex: '1 1 200px', height: '56px', fontSize: '1.1rem' }}>Out of Stock</button>
                        )}

                        <button 
                            onClick={(e) => {
                                toggleWishlist(product._id);
                                if (!isInWishlist(product._id)) {
                                    triggerFlyAnimation(e, 'wishlist');
                                }
                            }}
                            className="btn btn-outline" 
                            style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', padding: 0 }}
                        >
                            <Heart size={24} fill={isInWishlist(product?._id) ? "var(--primary)" : "none"} color={isInWishlist(product?._id) ? "var(--primary)" : "currentColor"} />
                        </button>
                    </div>
                    <button 
                        onClick={handleBuyItNow} 
                        disabled={product.stock === 0}
                        className="btn btn-secondary btn-lg" 
                        style={{ height: '56px', fontSize: '1.1rem', fontWeight: 900, opacity: product.stock === 0 ? 0.5 : 1 }}
                    >
                        {product.stock > 0 ? 'Buy it Now' : 'Out of Stock'}
                    </button>

                    {/* Trust badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {[
                            { icon: <Truck size={20} />, label: 'Free Delivery', sub: 'Orders over LKR 999' },
                            { icon: <Shield size={20} />, label: 'Secure Payment', sub: 'Encrypted & Safe' },
                            { icon: <Package size={20} />, label: 'Quality Check', sub: 'Verified Premium' }
                        ].map(({ icon, label, sub }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%' }}>{icon}</div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{label}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                {['description', 'reviews',].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>{tab === 'reviews' ? `Reviews (${product.reviews?.filter((r: any) => r.status === 'approved').length || 0})` : tab}</button>
                ))}
            </div>
            {activeTab === 'description' && (
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '700px' }}>
                    {product.description ? (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                    ) : (
                        <>
                            {/* <p>Premium quality anime poster printed on 200 GSM glossy paper. Vibrant, fade-resistant colors. Multiple sizes available. Perfect for framing.</p>
                            <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                                {['Premium 200 GSM paper', 'UV-coated for durability', 'Vivid, fade-resistant inks', 'Standard frame-compatible sizes', 'Rolled in protective tube for shipping'].map(f => (
                                    <li key={f} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>{f}</li>
                                ))}
                            </ul> */}
                        </>
                    )}
                </div>
            )}
            {activeTab === 'reviews' && (
                <div style={{ maxWidth: '700px', marginBottom: '2rem' }}>
                    {(product.reviews || []).filter((r: any) => r.status === 'approved').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r: any) => (
                        <div key={r._id} style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '1.5rem', position: 'relative' }}>
                            {user && r.user === user._id && r.status !== 'approved' && (
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', background: r.status === 'pending' ? 'var(--warning-light)' : 'var(--error-light)', color: r.status === 'pending' ? 'var(--warning)' : 'var(--error)' }}>
                                    {r.status === 'pending' ? <><Clock size={12} /> Pending Moderation</> : <><XCircle size={12} /> Rejected</>}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', fontWeight: 900, fontSize: '1rem' }}>
                                        {(r.user as any)?.profilePic ? (
                                            <img src={(r.user as any).profilePic} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            r.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.name}</div>
                                        <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= r.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: r.image ? '1rem' : 0 }}>{r.comment}</p>
                            {r.image && (
                                <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '1rem' }}>
                                    <img src={r.image} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    ))}
                    {product.reviews?.filter((r: any) => r.status === 'approved').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
                            <div style={{ fontWeight: 700 }}>No approved reviews yet</div>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
