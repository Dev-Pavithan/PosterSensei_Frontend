import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = () => {
    const { user } = useAuth();
    const { addItem } = useCart();
    const { wishlist, loading, toggleWishlist } = useWishlist();

    if (!user) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><Link to="/login" className="btn btn-primary">Login to see wishlist</Link></div>;

    return (
        <div className="container" style={{ minHeight: '60vh' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={22} color="var(--primary)" fill="var(--primary)" /> My Wishlist ({wishlist.length})
            </h1>
            {loading ? (
                <div className="product-grid">{Array(4).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: '280px' }} />)}</div>
            ) : wishlist.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Heart size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your wishlist is empty. Start saving posters you love!</p>
                    <Link to="/shop" className="btn btn-primary">Browse Posters</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {wishlist.map(p => (
                        <div key={p._id} className="card product-card">
                            <div className="product-card-img">
                                <Link to={`/product/${p._id}`}>
                                    <img src={p.imageUrl} alt={p.title} />
                                </Link>
                                <button className="wishlist-btn active" onClick={() => toggleWishlist(p._id)} title="Remove from wishlist">
                                    <Heart size={16} fill="var(--primary)" />
                                </button>
                            </div>
                            <div className="product-card-body">
                                <Link to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                                    <div className="product-title" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                                    <div className="product-anime">{p.anime}</div>
                                </Link>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                                    <span className="product-price">LKR {p.price}</span>
                                    <button onClick={() => addItem(p)} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                                        <ShoppingCart size={14} /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
