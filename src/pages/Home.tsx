import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Star, TrendingUp, ShoppingBag, ChevronRight } from 'lucide-react';
import axios from 'axios';

const HERO_SLIDES = [
    {
        title: 'Turn Your Walls Into',
        highlight: 'Anime Worlds',
        subtitle: 'Premium poster printing. Delivered to your door — or installed by us.',
        cta: 'Shop Now',
        ctaLink: '/shop',
        bg: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)',
        img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Room Makeover',
        highlight: 'Service Available',
        subtitle: 'We come to your home, bring the posters, and install everything perfectly.',
        cta: 'Book Now',
        ctaLink: '/shop',
        bg: 'linear-gradient(135deg, var(--secondary-light) 0%, var(--primary-light) 100%)',
        img: 'https://i.pinimg.com/originals/b0/66/3a/b0663a23991cc8e2b269012fc7af492c.jpg',
    },
];

const ProductCard = ({ product }: { product: any }) => (
    <Link to={`/product/${product._id}`} className="card product-card" style={{ textDecoration: 'none' }}>
        <div className="product-card-img">
            <img src={product.imageUrl} alt={product.title} loading="lazy" />
            {product.discount > 0 && (
                <span className="badge badge-primary" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>{product.discount}% OFF</span>
            )}
        </div>
        <div className="product-card-body">
            <div className="product-anime">{product.anime}</div>
            <div className="product-title">{product.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                    {'★'.repeat(Math.round(product.rating || 4))}{'☆'.repeat(5 - Math.round(product.rating || 4))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>({product.numReviews || 0})</span>
            </div>
            <div className="product-price-row">
                <span className="product-price">LKR {product.price}</span>
                {product.originalPrice > 0 && <span className="product-original-price">LKR {product.originalPrice}</span>}
                {product.discount > 0 && <span className="product-discount">-{product.discount}%</span>}
            </div>
        </div>
    </Link>
);

const Home = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [heroIdx, setHeroIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    const CAT_STYLES: Record<string, { img: string; color: string }> = {
        'Naruto': { img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=60', color: '#FF6B35' },
        'Dragon Ball Z': { img: 'https://images.unsplash.com/photo-1578339851080-33332db8a49c?w=200&auto=format&fit=crop&q=60', color: '#F59E0B' },
        'Attack on Titan': { img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=200&auto=format&fit=crop&q=60', color: '#7C3AED' },
        'One Piece': { img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&auto=format&fit=crop&q=60', color: '#EF4444' },
        'Demon Slayer': { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&auto=format&fit=crop&q=60', color: '#10B981' },
        'My Hero Academia': { img: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=200&auto=format&fit=crop&q=60', color: '#3B82F6' },
    };

    useEffect(() => {
        axios.get('/api/products?pageSize=8').then(r => setProducts(r.data.products || r.data)).catch(() => setProducts([]));
        
        axios.get('/api/products/animes').then(async r => {
            const animeNames = r.data;
            const dynamicCats = await Promise.all(animeNames.map(async (name: string) => {
                if (CAT_STYLES[name]) {
                    return { name, ...CAT_STYLES[name] };
                }
                // Fetch a random product from this anime for the image
                try {
                    const prodRes = await axios.get(`/api/products?anime=${encodeURIComponent(name)}&pageSize=1`);
                    const products = prodRes.data.products || prodRes.data;
                    const fallbackImg = products.length > 0 ? products[0].imageUrl : 'https://images.unsplash.com/photo-1618331835717-8016f122c19e?w=200&auto=format&fit=crop&q=60';
                    return { name, img: fallbackImg, color: 'var(--primary)' };
                } catch {
                    return { name, img: 'https://images.unsplash.com/photo-1618331835717-8016f122c19e?w=200&auto=format&fit=crop&q=60', color: 'var(--primary)' };
                }
            }));
            setCategories(dynamicCats);
        }).catch(() => {
            setCategories([
                { name: 'Naruto', img: CAT_STYLES['Naruto'].img, color: CAT_STYLES['Naruto'].color },
                { name: 'One Piece', img: CAT_STYLES['One Piece'].img, color: CAT_STYLES['One Piece'].color },
            ]);
        }).finally(() => setLoading(false));

        const timer = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(timer);
    }, []);

    const hero = HERO_SLIDES[heroIdx];

    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* Hero Banner */}
            <section style={{ background: hero.bg, transition: 'background var(--transition)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 45% , 100%), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center', minHeight: 'clamp(400px, 60vh, 600px)', paddingBlock: '3rem' }}>
                    <motion.div key={heroIdx} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <div className="badge badge-primary" style={{ marginBottom: '1.25rem' }}><Zap size={14} /> Flash Sale — Up to 30% OFF</div>
                        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            {hero.title}<br /><span style={{ color: 'var(--primary)', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{hero.highlight}</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)', marginBottom: '2.5rem', maxWidth: '500px' }}>{hero.subtitle}</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link to={hero.ctaLink} className="btn btn-primary btn-lg">{hero.cta} <ArrowRight size={20} /></Link>
                            <Link to="/shop" className="btn btn-outline btn-lg">Browse All</Link>
                        </div>
                        {/* Slide dots */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2.5rem' }}>
                            {HERO_SLIDES.map((_, i) => (
                                <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? '32px' : '10px', height: '10px', borderRadius: '5px', background: i === heroIdx ? 'var(--primary)' : 'var(--border)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            ))}
                        </div>
                    </motion.div>
                    <motion.div key={`img-${heroIdx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <div style={{ position: 'absolute', inset: '-1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '2rem', zIndex: 0, opacity: 0.1, filter: 'blur(10px)' }} />
                            <img src={hero.img} alt="Anime Poster" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 'var(--radius-xl)', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} />
                            <div style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 2, border: '1px solid var(--border)', display: 'clamp(0px, 10vw, block)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Customer Rating</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Star size={18} fill="var(--accent)" color="var(--accent)" />
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>4.9</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>(2.4k revs)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Anime Groups */}
            <section className="container" style={{ marginBlock: 'clamp(3rem, 10vw, 6rem)' }}>
                <div className="section-header">
                    <div className="section-title">Shop by Anime</div>
                    <Link to="/shop" className="btn btn-ghost" style={{ fontWeight: 700 }}>View All Anime <ChevronRight size={18} /></Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
                    {categories.map(cat => (
                        <Link key={cat.name} to={`/shop?anime=${encodeURIComponent(cat.name)}`} style={{ textDecoration: 'none' }}>
                            <motion.div whileHover={{ y: -8 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: 'clamp(60px, 10vw, 100px)', height: 'clamp(60px, 10vw, 100px)', borderRadius: '50%', border: `3px solid ${cat.color}40`, overflow: 'hidden', background: 'var(--surface-2)' }}>
                                    <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>{cat.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Flash Sale strip */}
            <section style={{ background: '#111827', padding: 'clamp(1.5rem, 5vw, 3rem) 0', marginBlock: 'clamp(3rem, 10vw, 6rem)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,111,97,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={28} color="var(--primary)" fill="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: 'var(--font-lg)' }}>Flash Sale is Live!</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>Limited time offers — Ending soon</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {['02', '47', '33'].map((val, i) => (
                            <React.Fragment key={i}>
                                <div style={{ background: '#1f2937', color: 'white', fontWeight: 900, fontSize: '1.5rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', minWidth: '64px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>{val}</div>
                                {i < 2 && <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', alignSelf: 'center' }}>:</span>}
                            </React.Fragment>
                        ))}
                    </div>
                    <Link to="/shop" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={20} /></Link>
                </div>
            </section>

            {/* Products */}
            <section className="container" style={{ marginBlock: 'clamp(3rem, 10vw, 6rem)' }}>
                <div className="section-header">
                    <div className="section-title"><TrendingUp size={24} color="var(--primary)" /> Trending Posters</div>
                    <Link to="/shop" className="btn btn-ghost" style={{ fontWeight: 700 }}>Browse Shop <ChevronRight size={18} /></Link>
                </div>
                <div className="product-grid">
                    {loading
                        ? Array(8).fill(0).map((_, i) => (
                            <div key={i} className="card" style={{ height: '350px' }}>
                                <div className="skeleton" style={{ height: '70%' }} />
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className="skeleton" style={{ height: '1.2rem', width: '80%' }} />
                                    <div className="skeleton" style={{ height: '1rem', width: '50%' }} />
                                    <div className="skeleton" style={{ height: '1.5rem', width: '40%', marginTop: 'auto' }} />
                                </div>
                            </div>
                        ))
                        : products.map(p => <ProductCard key={p._id} product={p} />)
                    }
                </div>
            </section>

            {/* Room Makeover Banner */}
            <section style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', paddingBlock: 'clamp(3rem, 8vw, 6rem)', marginBlock: '3rem 0', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', marginInline: 'clamp(0px, 2vw, 2rem)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45%, 100%), 1fr))', gap: '3rem', alignItems: 'center' }}>
                    <div>
                        <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: '1.5rem' }}><ShoppingBag size={14} /> Premium Service</div>
                        <h2 style={{ color: 'white', fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>Pinterest-Style Room Makeover 🎨</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '3rem', fontSize: 'var(--font-base)', lineHeight: 1.7, maxWidth: '540px' }}>
                            Our team visits your home, brings professionally printed posters, and arranges them exactly how you dreamed — a true anime aesthetic transformation.
                        </p>
                        <Link to="/shop" className="btn" style={{ background: 'white', color: 'var(--secondary)', fontWeight: 800, paddingInline: '2.5rem' }}>Book a Makeover <ArrowRight size={20} /></Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {['https://i.pinimg.com/1200x/fc/11/ff/fc11ff7a5d7a0ee08898da63ad54a74f.jpg',
                          'https://i.pinimg.com/1200x/c5/fd/b8/c5fdb8f1d6ec8551eacd65b425d15237.jpg',
                          'https://i.pinimg.com/736x/0c/d6/cb/0cd6cb49654420ae6632b26cf2c88f7a.jpg',
                          'https://i.pinimg.com/736x/f2/45/de/f245de69dcf5f679a4933eafbaf7e31d.jpg'].map((img, i) => (
                            <motion.img key={i} src={img} whileHover={{ scale: 1.05 }} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid rgba(255,255,255,0.1)' }} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
