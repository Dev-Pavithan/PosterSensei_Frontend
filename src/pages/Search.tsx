import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Star } from 'lucide-react';
import axios from 'axios';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        axios.get(`/api/products?keyword=${encodeURIComponent(query)}`).then(r => setResults(r.data.products || [])).catch(() => setResults([])).finally(() => setLoading(false));
    }, [query]);

    return (
        <div className="container" style={{ paddingBlock: '3rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <SearchIcon size={24} color="var(--primary)" />
                    <h1 style={{ fontWeight: 900, fontSize: 'var(--font-xl)', color: 'var(--text-primary)' }}>
                        Search results for <span style={{ color: 'var(--primary)' }}>"{query}"</span>
                    </h1>
                </div>
                {!loading && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                        We found {results.length} results matching your search.
                    </div>
                )}
            </div>

            {loading ? (
                <div className="product-grid">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="card" style={{ height: '350px' }}>
                            <div className="skeleton" style={{ height: '70%' }} />
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="skeleton" style={{ height: '1.25rem', width: '85%' }} />
                                <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
                                <div className="skeleton" style={{ height: '1.5rem', width: '40%', marginTop: 'auto' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10vh 2rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--border)' }}>
                    <div style={{ width: '120px', height: '120px', background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--text-muted)' }}>
                        <SearchIcon size={56} />
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>No results found</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Try different keywords or browse our full collection.</p>
                    <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Browse All Posters</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {results.map(p => (
                        <Link key={p._id} to={`/product/${p._id}`} className="card product-card">
                            <div className="product-card-img">
                                <img src={p.imageUrl} alt={p.title} loading="lazy" />
                                {p.discount > 0 && (
                                    <span className="badge badge-primary" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>{p.discount}% OFF</span>
                                )}
                            </div>
                            <div className="product-card-body">
                                <div className="product-anime">{p.anime}</div>
                                <div className="product-title">{p.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.rating || '4.5'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>({p.numReviews || 0})</span>
                                </div>
                                <div className="product-price-row">
                                    <span className="product-price">₹{p.price}</span>
                                    {p.originalPrice > 0 && <span className="product-original-price">₹{p.originalPrice}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
