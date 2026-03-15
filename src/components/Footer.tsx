import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail, Phone, MapPin, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import axios from 'axios';

const Footer = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [categories, setCategories] = React.useState<string[]>(['Naruto', 'One Piece', 'Attack on Titan']);

    React.useEffect(() => {
        axios.get('/api/products/categories')
            .then(r => setCategories(r.data.slice(0, 4)))
            .catch(() => {});
    }, []);

    const trust = [
        { icon: <Truck size={20} />, title: 'Fast Delivery', desc: 'Within 5-7 business days' },
        { icon: <Shield size={20} />, title: 'Secure Payments', desc: '100% protected checkout' },
        { icon: <RefreshCw size={20} />, title: 'Easy Returns', desc: 'Hassle-free exchanges' },
        { icon: <Headphones size={20} />, title: '24/7 Support', desc: 'Always here to help' },
    ];

    return (
        <footer style={{ background: '#111827', color: 'white', }}>
            {/* Trust badges */}
            {isHome && (
                <div style={{ background: '#f9fafb', borderTop: '1px solid var(--border)', padding: '1.5rem 0' }}>
                    <div className="container trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {trust.map(({ icon, title, desc }) => (
                            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ff007f15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff007f', flexShrink: 0 }}>
                                    {icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937' }}>{title}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main footer */}
            <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '3rem 1.5rem' }}>
                {/* Brand */}
                <div className="footer-brand">
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.8rem' }}>
                        Poster<span style={{ color: 'var(--primary)' }}>Sensei</span>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        Turn Your Walls into Anime Worlds. Premium quality anime & cartoon poster printing, delivered to your door or installed by our team.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[Instagram, Twitter, Youtube].map((Icon, i) => (
                            <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', transition: 'all var(--transition)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9ca3af'; }}>
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop links */}
                <div className="footer-links">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Anime</div>
                    <Link to="/shop" style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>All Posters</Link>
                    {categories.map(cat => (
                        <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{cat}</Link>
                    ))}
                    <Link to="/shop?sort=newest" style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>New Arrivals</Link>
                    <Link to="/shop?sort=topRated" style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Best Sellers</Link>
                </div>

                {/* Company links */}
                <div className="footer-links">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Company</div>
                    {[
                        ['About Us', '/about'],
                        ['Store Locations', '/shop'],
                        ['Room Makeover', '/shop'],
                        ['Terms & Policies', '/']
                    ].map(([label, to]) => (
                        <Link key={label} to={to} style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{label}</Link>
                    ))}
                </div>

                {/* Account links */}
                <div className="footer-links">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'white' }}>My Account</div>
                    {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Cart', '/cart']].map(([label, to]) => (
                        <Link key={label} to={to} style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{label}</Link>
                    ))}
                </div>

                {/* Contact */}
                <div className="footer-contact">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Contact Us</div>
                    {[
                        { icon: <Mail size={14} />, text: 'postersenseianime@gmail.com' },
                        { icon: <Phone size={14} />, text: '0750429863' },
                        { icon: <MapPin size={14} />, text: 'Jaffna Srilanka' },
                    ].map(({ icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.6rem' }}>
                            <span style={{ color: 'var(--primary)' }}>{icon}</span> {text}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
                © {new Date().getFullYear()} PosterSensei. All rights reserved. Made with ❤️ for anime fans.
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 2.5rem 1.5rem !important;
                        padding-top: 2rem !important;
                    }
                    .footer-brand {
                        grid-column: span 2 !important;
                        margin-bottom: 1rem;
                    }
                    .footer-contact {
                        grid-column: span 2 !important;
                        margin-top: 1rem;
                        padding-top: 1.5rem;
                        border-top: 1px solid rgba(255,255,255,0.05);
                    }
                }
                @media (max-width: 480px) {
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                    .footer-brand, .footer-contact {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .footer-brand p {
                        max-width: 300px;
                    }
                    .footer-contact div {
                        justify-content: center;
                    }
                    .trust-grid {
                        grid-template-columns: 1fr !important;
                        padding-inline: 2rem !important;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
