import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, ChevronLeft, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [mainImg, setMainImg] = useState('');
    const [added, setAdded] = useState(false);
    const [review, setReview] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        axios.get(`/api/products/${id}`).then(r => {
            setProduct(r.data);
            setMainImg(r.data.imageUrl);
            setSelectedSize(r.data.sizes?.[0] || '');
        }).catch(() => {
            const mock = {
                _id: id, title: 'Naruto - Team 7 Reunion', anime: 'Naruto', category: 'Posters',
                price: 449, originalPrice: 599, discount: 25, stock: 15, rating: 4.7, numReviews: 124,
                imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
                images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1578339851080-33332db8a49c?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=600&auto=format&fit=crop&q=80'],
                sizes: ['A4', 'A3', 'A2', 'A1'], description: 'Premium quality anime poster printed on 200 GSM glossy/matte paper. UV coated for durability. Vibrant colors that won\'t fade. Frame-ready with standard dimensions.',
                seller: 'PosterSensei Official',
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

    const handleAddToCart = () => {
        addItem(product, qty, selectedSize);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
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

    const allImages = [product.imageUrl, ...(product.images?.filter((img: string) => img !== product.imageUrl) || [])];

    return (
        <div className="container" style={{ paddingBlock: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ChevronLeft size={16} /> Back to Shop
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', marginBottom: '4rem' }}>
                {/* Image gallery */}
                <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div className="watermark-overlay" style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem', background: 'var(--surface-2)', boxShadow: 'var(--shadow-lg)' }}>
                        <img src={mainImg} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {allImages.map((img: string, i: number) => (
                            <button key={i} onClick={() => setMainImg(img)} 
                                style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${mainImg === img ? 'var(--primary)' : 'var(--border)'}`, padding: 0, background: 'var(--surface)', cursor: 'pointer', transition: 'all var(--transition)' }}>
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div className="badge badge-primary">{product.category}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>{product.anime}</div>
                        </div>
                        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1, color: 'var(--text-primary)' }}>{product.title}</h1>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={s <= Math.round(product.rating) ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                                <span style={{ marginLeft: '4px', fontWeight: 800, color: 'var(--text-primary)' }}>{product.rating}</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>({product.numReviews} Reviews)</span>
                            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
                            {product.stock > 0 
                                ? <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} /> In Stock</span>
                                : <span style={{ color: 'var(--error)', fontWeight: 800, fontSize: '0.85rem' }}>Out of Stock</span>
                            }
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>LKR {product.price}</span>
                            {product.originalPrice > 0 && (
                                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>LKR {product.originalPrice}</span>
                            )}
                        </div>
                        {product.discount > 0 && (
                            <div className="badge badge-success" style={{ fontWeight: 800 }}>Save LKR {product.originalPrice - product.price} ({product.discount}% OFF)</div>
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
                        <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary btn-lg" style={{ flex: '1 1 200px', height: '56px', fontSize: '1.1rem' }}>
                            <ShoppingCart size={22} /> {added ? 'Added to Cart!' : 'Add to Cart'}
                        </button>
                        <button className="btn btn-outline" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', padding: 0 }}>
                            <Heart size={24} />
                        </button>
                    </div>
                    
                    <button className="btn btn-secondary btn-lg" style={{ height: '56px', fontSize: '1.1rem', fontWeight: 900 }}>Buy it Now</button>

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
                {['description', 'reviews', 'shipping'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>{tab === 'reviews' ? `Reviews (${product.numReviews})` : tab}</button>
                ))}
            </div>
            {activeTab === 'description' && (
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '700px' }}>
                    <p>{product.description || 'Premium quality anime poster printed on 200 GSM glossy paper. Vibrant, fade-resistant colors. Multiple sizes available. Perfect for framing.'}</p>
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                        {['Premium 200 GSM paper', 'UV-coated for durability', 'Vivid, fade-resistant inks', 'Standard frame-compatible sizes', 'Rolled in protective tube for shipping'].map(f => (
                            <li key={f} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}
            {activeTab === 'reviews' && (
                <div style={{ maxWidth: '700px', marginBottom: '2rem' }}>
                    {user ? (
                        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Write a Review</div>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setReview({ ...review, rating: s })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                        <Star size={20} fill={s <= review.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />
                                    </button>
                                ))}
                            </div>
                            <textarea className="input" placeholder="Share your thoughts about this poster..." rows={3} value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} style={{ marginBottom: '1rem', resize: 'vertical' }} />
                            <button onClick={async () => {
                                try {
                                    await axios.post(`/api/products/${id}/reviews`, review, { headers: { Authorization: `Bearer ${user?._id}` } });
                                    alert('Review submitted!');
                                    setReview({ rating: 5, comment: '' });
                                    // reload
                                    window.location.reload();
                                } catch (err) {
                                    alert('Failed to submit review. You may have already reviewed this product.');
                                }
                            }} className="btn btn-primary">Submit Review</button>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '1rem', marginBottom: '2rem', textAlign: 'center', background: 'var(--surface-2)' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to write a review.</p>
                        </div>
                    )}

                    {(product.reviews || []).map((r: any) => (
                        <div key={r._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <div style={{ fontWeight: 600 }}>{r.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.4rem' }}>
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} fill={s <= r.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'shipping' && (
                <div style={{ maxWidth: '700px', marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                    <p><strong>Standard Post:</strong> 5-7 business days · Free above LKR 999.</p>
                    <p><strong>Room Makeover Service:</strong> We schedule a visit, bring the posters, and professionally install them on your walls. Available in Jaffna Srilanka and nearby areas.</p>
                    <p><strong>Packaging:</strong> Each poster is carefully rolled and shipped in a rigid tube to prevent any damage during transit.</p>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
