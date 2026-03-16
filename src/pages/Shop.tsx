import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, Heart, ShoppingCart, Star } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

import { useWishlist } from '../contexts/WishlistContext';

const SORTS = [
    { label: 'Most Popular', value: 'topRated' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'priceAsc' },
    { label: 'Price: High to Low', value: 'priceDesc' },
];

const ProductCard = ({ product }: { product: any }) => {
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const isFav = isInWishlist(product._id);

    return (
        <Link to={`/product/${product._id}`} className="card product-card">
            <div className="product-card-img">
                <img src={product.imageUrl} alt={product.title} loading="lazy" />
                {product.discount > 0 && (
                    <span className="badge badge-primary" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>{product.discount}% OFF</span>
                )}
                <button 
                    className={`wishlist-btn ${isFav ? 'active' : ''}`} 
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }} 
                    style={{ zIndex: 10 }}>
                    <Heart size={18} fill={isFav ? 'var(--primary)' : 'none'} color={isFav ? 'var(--primary)' : 'currentColor'} />
                </button>
                <div className="product-card-overlay" style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', transition: 'all var(--transition)', opacity: 0 }}>
                    <button onClick={handleAddToCart} className="btn btn-primary btn-sm btn-full" id={`add-btn-${product._id}`}>
                        <ShoppingCart size={16} /> {added ? 'Added!' : 'Add to Cart'}
                    </button>
                </div>
            </div>
            <div className="product-card-body">
                <div className="product-anime">{product.anime}</div>
                <div className="product-title">{product.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{product.rating || '4.5'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>({product.numReviews || 0})</span>
                </div>
                <div className="product-price-row">
                    <span className="product-price">LKR {product.price}</span>
                    {product.originalPrice > 0 && <span className="product-original-price">LKR {product.originalPrice}</span>}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.product-card:hover .product-card-overlay { opacity: 1 !important; transform: translateY(-5px); }` }} />
        </Link>
    );
};

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [activeAnime, setActiveAnime] = useState(searchParams.get('anime') || 'All');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        axios.get('/api/products/animes')
            .then(r => setCategories(['All', ...r.data]))
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: any = { page, sort, pageSize: 12 };
        
        // Handle internal state navigation (clean URL filtering)
        if (location.state?.anime) {
            const stateAnime = location.state.anime;
            setActiveAnime(stateAnime);
            setPage(1);
            // Clear location state to prevent re-applying on refresh and keep URL clean
            navigate(location.pathname, { replace: true, state: {} });
            return; // Effect will re-run due to activeAnime change
        }

        if (activeAnime !== 'All') params.anime = activeAnime;
        if (searchParams.get('anime')) setActiveAnime(searchParams.get('anime')!);

        axios.get('/api/products', { params }).then(r => {
            setProducts(r.data.products || []);
            setTotalPages(r.data.pages || 1);
        }).catch(() => {
            setProducts([]);
            setTotalPages(1);
        }).finally(() => setLoading(false));
    }, [activeAnime, sort, page, searchParams, location.state, navigate, location.pathname]);

    const handleAnime = (cat: string) => { setActiveAnime(cat); setPage(1); };

    return (
        <div className="container" style={{ paddingBlock: '2rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Explore Posters</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Find the perfect anime aesthetic for your space.</p>
            </div>

            {/* Filter and sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
                <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm" style={{ paddingInline: '1rem' }}>
                    <SlidersHorizontal size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
                    {categories.map(cat => (
                        <button key={cat} className={`chip ${activeAnime === cat ? 'active' : ''}`} onClick={() => handleAnime(cat)}>{cat}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Sort:</span>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="input" style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Sidebar filters */}
                {showFilters && (
                    <aside style={{ flex: '1 1 240px', maxWidth: '300px' }}>
                        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
                            <div style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Price Range</div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <input type="number" placeholder="Min" className="input" style={{ padding: '0.6rem' }} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <input type="number" placeholder="Max" className="input" style={{ padding: '0.6rem' }} />
                                </div>
                            </div>
                            <hr className="divider" style={{ marginBlock: '1.5rem', opacity: 0.1 }} />
                            <div style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Anime</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {categories.slice(1).map(cat => (
                                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        <input type="checkbox" checked={activeAnime === cat} onChange={() => handleAnime(activeAnime === cat ? 'All' : cat)}
                                            style={{ width: '18px', height: '18px', borderRadius: '4px', accentColor: 'var(--primary)' }} />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-full" style={{ marginTop: '2rem' }}>Apply Filters</button>
                        </div>
                    </aside>
                )}

                {/* Product grid */}
                <div style={{ flex: '1 1 500px' }}>
                    {loading ? (
                        <div className="product-grid">
                            {Array(12).fill(0).map((_, i) => (
                                <div key={i} className="card" style={{ height: '380px' }}>
                                    <div className="skeleton" style={{ height: '70%' }} />
                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div className="skeleton" style={{ height: '1.25rem', width: '85%' }} />
                                        <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
                                        <div className="skeleton" style={{ height: '1.5rem', width: '40%', marginTop: 'auto' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--border)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>No products found</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try adjusting your filters or search query.</p>
                            <button onClick={() => { setActiveAnime('All'); setSearchParams({}); }} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Clear All Filters</button>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map(p => <ProductCard key={p._id} product={p} />)}
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '4rem' }}>
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">Prev</button>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button key={i} onClick={() => setPage(i + 1)}
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', transition: 'all var(--transition)',
                                                    background: page === i + 1 ? 'var(--primary)' : 'var(--surface)',
                                                    color: page === i + 1 ? 'white' : 'var(--text-primary)',
                                                    border: `1px solid ${page === i + 1 ? 'var(--primary)' : 'var(--border)'}`,
                                                    boxShadow: page === i + 1 ? 'var(--shadow-md)' : 'none'
                                                }}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-outline btn-sm">Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
