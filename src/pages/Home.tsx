import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    ArrowRight, Zap, Star, TrendingUp, ShoppingBag, ChevronRight, 
    Sparkles, MoveUpRight, Layers, Layout, Palette, Heart
} from 'lucide-react';
import axios from 'axios';

const HERO_SLIDES = [
    {
        title: 'Turn Your Space Into',
        highlight: 'Anime Worlds',
        subtitle: 'The destination for museum-grade anime prints and professional room transformations.',
        cta: 'Enter Shop',
        ctaLink: '/shop',
        img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Boutique Room',
        highlight: 'Styling Service',
        subtitle: 'Our curators design, deliver, and install your dream aesthetic — anywhere in Sri Lanka.',
        cta: 'Book Studio',
        ctaLink: '/shop',
        img: 'https://i.pinimg.com/originals/b0/66/3a/b0663a23991cc8e2b269012fc7af492c.jpg',
    },
];

const ProductCard = ({ product, style }: { product: any, style?: React.CSSProperties }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="product-card-container"
        style={style}
    >
        <Link to={`/product/${product._id}`} className="card product-card" style={{ 
            textDecoration: 'none', 
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            height: '100%'
        }}>
            <div className="product-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={product.imageUrl} alt={product.title} loading="lazy" style={{ transition: 'transform 0.5s ease', width: '100%', height: '100%', objectFit: 'cover' }} />
                {product.discount > 0 && (
                    <span className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem', borderRadius: '100px', fontWeight: 900 }}>{product.discount}% OFF</span>
                )}
                <div className="hover-action-overlay">
                    <div className="btn btn-primary btn-sm rounded-pill">View Details</div>
                </div>
            </div>
            <div className="product-card-body" style={{ padding: '1.5rem' }}>
                <div className="product-anime" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{product.anime}</div>
                <div className="product-title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{product.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ color: '#EAB308', display: 'flex' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < Math.round(product.rating || 4) ? '#EAB308' : 'transparent'} strokeWidth={1.5} />
                        ))}
                    </div>
                </div>
                <div className="product-price-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="product-price" style={{ fontSize: '1.1rem', fontWeight: 900 }}>LKR {product.price}</span>
                    {product.originalPrice > 0 && <span className="product-original-price" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85rem' }}>LKR {product.originalPrice}</span>}
                </div>
            </div>
        </Link>
    </motion.div>
);

const Home = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [heroIdx, setHeroIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const CAT_STYLES: Record<string, { img: string; color: string }> = {
        'Dragon Ball Z': { img: 'https://images.unsplash.com/photo-1578339851080-33332db8a49c?w=400&auto=format&fit=crop&q=80', color: '#F59E0B' },
        'Attack on Titan': { img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&auto=format&fit=crop&q=80', color: '#7C3AED' },
        'One Piece': { img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&auto=format&fit=crop&q=80', color: '#EF4444' },
        'Demon Slayer': { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop&q=80', color: '#10B981' },
    };

    useEffect(() => {
        axios.get('/api/products?pageSize=8').then(r => setProducts(r.data.products || r.data)).catch(() => setProducts([]));
        
        axios.get('/api/products/animes').then(async r => {
            const animeNames = r.data;
            const dynamicCats = await Promise.all(animeNames.slice(0, 6).map(async (name: string) => {
                if (CAT_STYLES[name]) return { name, ...CAT_STYLES[name] };
                try {
                    const prodRes = await axios.get(`/api/products?anime=${encodeURIComponent(name)}&pageSize=1`);
                    const products = prodRes.data.products || prodRes.data;
                    const fallbackImg = products.length > 0 ? products[0].imageUrl : 'https://images.unsplash.com/photo-1618331835717-8016f122c19e?w=400&auto=format&fit=crop&q=80';
                    return { name, img: fallbackImg, color: 'var(--primary)' };
                } catch {
                    return { name, img: 'https://images.unsplash.com/photo-1618331835717-8016f122c19e?w=400&auto=format&fit=crop&q=80', color: 'var(--primary)' };
                }
            }));
            setCategories(dynamicCats);
        }).finally(() => setLoading(false));

        const timer = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 8000);
        return () => clearInterval(timer);
    }, []);

    const hero = HERO_SLIDES[heroIdx];

    return (
        <div ref={containerRef} style={{ background: 'var(--surface)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* HERO: Cinematic Mesh Gradient */}
            <section style={{ 
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                paddingBlock: '4rem'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    background: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(339,49%,30%,1) 0, transparent 50%)',
                    filter: 'blur(100px)',
                    opacity: 0.4
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 45% , 100%), 1fr))', gap: '6vw', alignItems: 'center' }}>
                        <motion.div key={heroIdx} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 900, 
                                letterSpacing: '0.2em', 
                                textTransform: 'uppercase', 
                                color: 'var(--primary)',
                                marginBottom: '1.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '100px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Sparkles size={14} /> Seasonal Drop is Live
                            </div>
                            
                            <h1 style={{ 
                                fontSize: 'clamp(3rem, 7vw, 6rem)', 
                                fontWeight: 900, 
                                lineHeight: 1, 
                                letterSpacing: '-0.04em',
                                marginBottom: '2rem'
                            }}>
                                {hero.title}<br />
                                <span style={{ 
                                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}>{hero.highlight}</span>
                            </h1>

                            <p style={{ 
                                maxWidth: '500px', 
                                fontSize: '1.2rem', 
                                color: 'var(--text-secondary)',
                                lineHeight: 1.6,
                                marginBottom: '2.5rem'
                            }}>
                                {hero.subtitle}
                            </p>

                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <Link to={hero.ctaLink} className="btn btn-primary btn-lg" style={{ borderRadius: '100px', paddingInline: '2.5rem' }}>
                                    {hero.cta} <MoveUpRight size={20} />
                                </Link>
                                <Link to="/shop" className="btn btn-outline btn-lg" style={{ borderRadius: '100px' }}>
                                    Browse Gallery
                                </Link>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '3rem' }}>
                                {HERO_SLIDES.map((_, i) => (
                                    <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? '48px' : '12px', height: '6px', borderRadius: '3px', background: i === heroIdx ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', transition: 'all 0.4s' }} />
                                ))}
                            </div>
                        </motion.div>

                        <motion.div key={`img-${heroIdx}`} initial={{ opacity: 0, scale: 0.9, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8 }} style={{ position: 'relative' }}>
                            <div style={{ 
                                position: 'absolute', 
                                inset: '-2rem', 
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                                borderRadius: '3rem', 
                                zIndex: 0, 
                                opacity: 0.15, 
                                filter: 'blur(40px)' 
                            }} />
                            <div style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                backdropFilter: 'blur(20px)',
                                padding: '1rem',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                zIndex: 5,
                                boxShadow: 'var(--shadow-2xl)'
                            }}>
                                <img src={hero.img} alt="Hero" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '24px' }} />
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '2rem', 
                                    right: '-2rem', 
                                    background: 'var(--surface-2)', 
                                    borderRadius: '24px', 
                                    padding: '1.5rem', 
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <Layers size={24} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Studio Standard</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>4K Pearl Finish</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* MARQUEE: Trends loop */}
            {/* MARQUEE: Trends loop - Fixed version */}
<div style={{ 
    background: 'var(--primary)', 
    paddingBlock: '1.5rem', 
    overflow: 'hidden', 
    whiteSpace: 'nowrap',
    position: 'relative',
    width: '100%'
}}>
    <motion.div 
        animate={{ 
            x: ['0%', '-50%']
        }} 
        transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
        }} 
        style={{ 
            display: 'inline-flex', 
            gap: '4rem',
            width: 'max-content'
        }}
    >
        {/* Original items */}
        {['COLLECTOR EDITIONS', 'HAND-PAINTED KITS', 'EXCLUSIVE MANGA ART', 'CUSTOM CINEMATIC PRINTS', 'JAFFNA EXCLUSIVE DECOR'].map((m, i) => (
            <div key={`orig-${i}`} style={{ fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <Star size={14} fill="white" style={{ verticalAlign: 'middle', marginRight: '1rem' }} /> {m}
            </div>
        ))}
        
        {/* Duplicate items for seamless loop */}
        {['COLLECTOR EDITIONS', 'HAND-PAINTED KITS', 'EXCLUSIVE MANGA ART', 'CUSTOM CINEMATIC PRINTS', 'JAFFNA EXCLUSIVE DECOR'].map((m, i) => (
            <div key={`dup-${i}`} style={{ fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <Star size={14} fill="white" style={{ verticalAlign: 'middle', marginRight: '1rem' }} /> {m}
            </div>
        ))}
    </motion.div>
</div>

            {/* CATEGORIES: Dynamic Collage */}
            <section style={{ paddingBlock: '10vw' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5vw' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.4em', marginBottom: '1rem' }}>COLLECTIONS</div>
                            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 0.9 }}>Shop by Anime</h2>
                        </div>
                        <Link to="/shop" className="btn" style={{ 
                            borderRadius: '100px', 
                            marginBottom: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            letterSpacing: '1px'
                        }}>View Collections</Link>
                    </div>

                    <div className="collage-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(12, 1fr)', 
                        gridAutoRows: 'minmax(200px, auto)',
                        gap: '1.5rem' 
                    }}>
                        {categories.map((cat, i) => {
                            const spans = [
                                { col: 'span 7', row: 'span 2', h: '600px', font: '2.5rem' },
                                { col: 'span 5', row: 'span 1', h: '290px', font: '1.5rem' },
                                { col: 'span 5', row: 'span 1', h: '290px', font: '1.5rem' },
                                { col: 'span 4', row: 'span 1', h: '300px', font: '1.5rem' },
                                { col: 'span 4', row: 'span 1', h: '300px', font: '1.5rem' },
                                { col: 'span 4', row: 'span 1', h: '300px', font: '1.5rem' }
                            ];
                            const style = spans[i % spans.length];

                            return (
                                <motion.div 
                                    className="collage-item"
                                    key={cat.name}
                                    whileHover={{ y: -10 }}
                                    style={{ 
                                        gridColumn: style.col, 
                                        gridRow: style.row,
                                        height: style.h,
                                        borderRadius: '32px', 
                                        overflow: 'hidden', 
                                        position: 'relative', 
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    <Link to={`/shop?anime=${encodeURIComponent(cat.name)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                                        <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                        <div/>
                                        <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', right: '2.5rem' }}>
                                            <div style={{ fontSize: style.font, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '0.5rem' }}>{cat.name}</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PRODUCTS: Trending */}
<section style={{ background: 'var(--surface-2)', paddingBlock: '10vw', overflow: 'hidden' }}>
    <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5vw' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <TrendingUp size={32} color="var(--primary)" /> Trending Now
            </h2>
            <Link to="/shop" className="btn btn-outline" style={{ borderRadius: '100px' }}>Full Collection</Link>
        </div>
    </div>
    
    {/* Continuous Marquee Product Carousel */}
    <div style={{ 
        overflow: 'hidden',
        width: '100%',
        position: 'relative'
    }}>
        {/* Gradient overlays for fade effect */}
        <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: 'linear-gradient(to right, var(--surface-2), transparent)',
            zIndex: 2,
            pointerEvents: 'none'
        }} />
        <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: 'linear-gradient(to left, var(--surface-2), transparent)',
            zIndex: 2,
            pointerEvents: 'none'
        }} />
        
        <motion.div 
            animate={{ 
                x: ['0%', '-50%']
            }} 
            transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "loop"
            }} 
            style={{ 
                display: 'inline-flex', 
                gap: '2.5rem',
                width: 'max-content',
                paddingLeft: '2.5rem'
            }}
        >
            {loading ? (
                // Loading skeletons repeated twice for continuous loop
                <>
                    {Array(8).fill(0).map((_, i) => (
                        <div key={`load-orig-${i}`} className="skeleton-card" style={{ width: '280px', height: '520px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)' }} />
                    ))}
                    {Array(8).fill(0).map((_, i) => (
                        <div key={`load-dup-${i}`} className="skeleton-card" style={{ width: '280px', height: '520px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)' }} />
                    ))}
                </>
            ) : (
                <>
                    {/* Original products */}
                    {products.map(p => <ProductCard key={p._id} product={p} style={{ width: '280px' }} />)}
                    {/* Duplicate products for seamless loop */}
                    {products.map(p => <ProductCard key={`dup-${p._id}`} product={p} style={{ width: '280px' }} />)}
                </>
            )}
        </motion.div>
    </div>
</section>

            {/* SERVICE SPOTLIGHT: immersive Makeover */}
            <section style={{ paddingBlock: '5vw' }}>
                <div className="container">
                    <div style={{ 
                        background: 'black', 
                        color: 'white', 
                        borderRadius: '64px', 
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0, 
                            width: '50%', 
                            height: '100%', 
                            background: 'linear-gradient(to right, black, transparent)',
                            zIndex: 2
                        }} />
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 500px', padding: '10vw 6vw', position: 'relative', zIndex: 10 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.4em', marginBottom: '2rem' }}>PREMIUM EXPERIENCE</div>
                                <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1, marginBottom: '2rem' }}>Pinterest-Style Room Makeovers.</h2>
                                <p style={{ fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '500px' }}>
                                    We bring the posters, the lights, the mirrors, and the expertise. Our team transforms your space into a thematic masterpiece locally in Jaffna.
                                </p>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Layout size={20} color="var(--primary)" /> Layout Strategy</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Palette size={20} color="var(--primary)" /> Theme Design</div>
                                </div>
                                <div style={{ marginTop: '4rem' }}>
                                    <Link to="/contact" className="btn btn-primary btn-lg" style={{ borderRadius: '100px', background: 'white', color: 'black' }}>Book Your Session</Link>
                                </div>
                            </div>
                            <div style={{ flex: '1 1 500px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '2rem' }}>
                                {['https://i.pinimg.com/1200x/fc/11/ff/fc11ff7a5d7a0ee08898da63ad54a74f.jpg',
                                  'https://i.pinimg.com/1200x/c5/fd/b8/c5fdb8f1d6ec8551eacd65b425d15237.jpg',
                                  'https://i.pinimg.com/736x/0c/d6/cb/0cd6cb49654420ae6632b26cf2c88f7a.jpg',
                                  'https://i.pinimg.com/736x/f2/45/de/f245de69dcf5f679a4933eafbaf7e31d.jpg'].map((img, i) => (
                                    <motion.img key={i} src={img} whileHover={{ scale: 1.05 }} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '24px' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .collage-grid {
                    perspective: 1000px;
                }
                .collage-item:hover img {
                    transform: scale(1.05);
                }
                .hover-action-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .product-card:hover .hover-action-overlay {
                    opacity: 1;
                }
                .product-card:hover img {
                    transform: scale(1.1);
                }
                .skeleton-card {
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.1; }
                }
                @media (max-width: 1000px) {
                    .collage-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 0.75rem !important;
                    }
                    .collage-item {
                        grid-column: span 1 !important;
                        grid-row: span 1 !important;
                        height: 250px !important;
                    }
                    /* Re-enable collage feel by making the first item larger even on mobile */
                    .collage-item:nth-child(1) {
                        grid-column: span 2 !important;
                        height: 400px !important;
                    }
                    .collage-item h2, .collage-item div {
                        left: 1rem !important;
                        bottom: 1rem !important;
                    }
                    .collage-item div {
                        font-size: 1.2rem !important;
                    }
                }
                @media (max-width: 500px) {
                    .collage-grid {
                        gap: 0.5rem !important;
                    }
                    .collage-item {
                        height: 200px !important;
                    }
                    .collage-item:nth-child(1) {
                        height: 300px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
