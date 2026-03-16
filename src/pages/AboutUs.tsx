import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    Paintbrush, Sparkles, ShieldCheck, Truck, ArrowRight, Star, MapPin, 
    Lightbulb, Framer, Scissors, Globe, Instagram, Send, MoveUpRight,
    Camera, Layers, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const stats = [
        { label: 'High Quality', value: '10k+', icon: <Truck size={18} /> },
        { label: 'Creative Visions', value: '2k+', icon: <Paintbrush size={18} /> },
        { label: 'Unique Designs', value: '5k+', icon: <Sparkles size={18} /> },
        { label: 'Global Standard', value: '4.9/5', icon: <Star size={18} /> },
    ];

    const materials = [
        'Premium Neon Lights', 'Architectural Mirrors', 'Artificial Foliage', 
        'Pearl Wall Prints', 'Handcrafted Frames', 'LED Strips', 'Custom Vinyls'
    ];

    return (
        <div ref={containerRef} style={{ background: 'var(--surface)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* HERO: Immersive Mesh Gradient */}
            <section style={{ 
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem'
            }}>
                {/* Mesh Gradient Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    background: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
                    filter: 'blur(100px)',
                    opacity: 0.5
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 900, 
                            letterSpacing: '0.4em', 
                            textTransform: 'uppercase', 
                            color: 'var(--primary)',
                            marginBottom: '2rem'
                        }}>
                            Poster Sensei • Creative Studio
                        </div>
                        
                        <h1 style={{ 
                            fontSize: 'clamp(3rem, 12vw, 8rem)', 
                            fontWeight: 900, 
                            lineHeight: 0.9, 
                            letterSpacing: '-0.04em',
                            marginBottom: '3rem'
                        }}>
                            WHERE <br />
                            <span style={{ 
                                color: 'transparent',
                                WebkitTextStroke: '1px var(--primary)',
                                fontStyle: 'italic'
                            }}>ART</span> MEETS <br />
                            YOUR <span style={{ 
                                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>SPACE.</span>
                        </h1>

                        <p style={{ 
                            maxWidth: '600px', 
                            marginInline: 'auto', 
                            fontSize: '1.2rem', 
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            marginBottom: '3rem'
                        }}>
                            A Jaffna-born creative house redefining custom printing and room decoration. 
                            We don't just decorate; we tell your story.
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/shop" className="btn btn-primary btn-lg" style={{ borderRadius: '100px', paddingInline: '3rem' }}>
                                Explore Studio <MoveUpRight size={20} />
                            </Link>
                            <a href="#roots" className="btn btn-ghost btn-lg" style={{ borderRadius: '100px' }}>
                                Our Story
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '20%', right: '10%', opacity: 0.2 }}
                >
                    <Layers size={180} strokeWidth={0.5} color="var(--primary)" />
                </motion.div>
            </section>

            {/* ROOTS: Asymmetrical Bento Grid */}
            <section id="roots" style={{ paddingBlock: '10vw' }}>
                <div className="container">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(12, 1fr)', 
                        gap: '2rem',
                    }}>
                        {/* Big Story Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ 
                                gridColumn: 'span 8', 
                                background: 'var(--surface-2)', 
                                padding: '4rem', 
                                borderRadius: '32px',
                                border: '1px solid var(--border)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <MapPin size={40} className="text-primary" style={{ marginBottom: '2rem' }} />
                            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Born in Jaffna. <br />Driven by Craft.</h2>
                            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '500px' }}>
                                What began in a small studio in Jaffna has evolved into a movement. We realized that people wanted environments that felt personal. 
                                Whether it's high-quality custom prints or comprehensive room styling, our roots in craftsmanship guide every pixel and every paint stroke.
                            </p>
                            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', opacity: 0.05, fontSize: '15rem', fontWeight: 900 }}>JAFFNA</div>
                        </motion.div>

                        {/* Stats Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            style={{ 
                                gridColumn: 'span 4', 
                                background: 'var(--primary)', 
                                color: 'white', 
                                padding: '3rem', 
                                borderRadius: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Zap size={32} />
                            <div>
                                <div style={{ fontSize: '4rem', fontWeight: 900 }}>10k+</div>
                                <div style={{ fontSize: '1rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vibrant Spaces Transformed</div>
                            </div>
                        </motion.div>

                        {/* Image Card */}
                        <motion.div 
                             initial={{ opacity: 0, y: 50 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: 0.4 }}
                            style={{ gridColumn: 'span 5', borderRadius: '32px', overflow: 'hidden', height: '400px' }}
                        >
                            <img src="https://i.pinimg.com/736x/0b/6b/4e/0b6b4e91bda6099b33c18ac186fa5fe4.jpg" alt="Studio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>

                        {/* Quote Card */}
                        <motion.div 
                             initial={{ opacity: 0, y: 50 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: 0.6 }}
                            style={{ 
                                gridColumn: 'span 7', 
                                background: 'white', 
                                color: 'black', 
                                padding: '4rem', 
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <blockquote style={{ fontSize: '2rem', fontWeight: 700, fontStyle: 'italic', borderLeft: '8px solid var(--primary)', paddingLeft: '2rem' }}>
                                "We translate individual identities into physical spaces."
                            </blockquote>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* MARQUEE: Living Materials */}
            <div style={{ background: 'var(--primary)', paddingBlock: '3rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ display: 'inline-flex', gap: '4rem' }}
                >
                    {[...materials, ...materials, ...materials].map((m, i) => (
                        <div key={i} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Star size={20} fill="white" /> {m}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* SERVICES: Glassmorphic Experience */}
            <section style={{ paddingBlock: '10vw', position: 'relative' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '8vw' }}>
                        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900 }}>The Service Ecosystem</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginInline: 'auto', marginTop: '1rem' }}>Professional solutions tailored to your aesthetic requirements.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                        {[
                            {
                                title: 'Precision Print',
                                icon: <Camera size={32} />,
                                color: 'var(--primary)',
                                desc: 'Ultra-HD prints on museum-grade Pearl finish paper. Anime, Cinema, Automotive, or Personal photography.'
                            },
                            {
                                title: 'Direct Decor (Jaffna)',
                                icon: <Framer size={32} />,
                                color: 'var(--secondary)',
                                desc: 'Full-scale room restoration and thematic decoration exclusively available for our Jaffna community.'
                            },
                            {
                                title: 'Remote Planning',
                                icon: <Lightbulb size={32} />,
                                color: 'var(--accent)',
                                desc: 'Architecture-level decoration plans and curated material kits delivered island-wide for DIY perfection.'
                            }
                        ].map((s, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '32px',
                                    padding: '3.5rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem'
                                }}
                            >
                                <div style={{ color: s.color }}>{s.icon}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TIMELINE: Plan to Reality */}
            <section style={{ paddingBlock: '10vw', background: 'var(--surface-2)' }}>
                <div className="container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '3rem' }}>Plan to Reality.</h2>
                            {[
                                { step: '01', title: 'Consultation', text: 'Share your vision and theme with our design lead.' },
                                { step: '02', title: 'Strategy', text: 'We develop a custom plan, source items, and create layouts.' },
                                { step: '03', title: 'Execution', text: 'On-site in Jaffna or Remote Kits sent island-wide.' }
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)', opacity: 0.5 }}>{step.step}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{step.title}</h4>
                                        <p style={{ color: 'var(--text-secondary)' }}>{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                background: 'white', 
                                padding: '1rem', 
                                borderRadius: '24px', 
                                transform: 'rotate(2deg)',
                                boxShadow: 'var(--shadow-xl)'
                            }}>
                                <img src="https://i.pinimg.com/1200x/fc/11/ff/fc11ff7a5d7a0ee08898da63ad54a74f.jpg" alt="Process" style={{ width: '100%', borderRadius: '16px' }} />
                                <div style={{ padding: '1rem', color: '#000', fontWeight: 700 }}>Project: Minimalist Otaku Sanctum</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION: The Future */}
            <section style={{ paddingBlock: '10vw' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ 
                        background: 'black', 
                        color: 'white', 
                        padding: '8vw', 
                        borderRadius: '64px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <h2 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 1, marginBottom: '3rem' }}>
                            READY TO <br /> TRANSFORM?
                        </h2>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/shop" className="btn btn-primary btn-lg" style={{ borderRadius: '100px', background: 'white', color: 'black' }}>Visit Gallery</Link>
                            <Link to="/" state={{ scrollTo: 'contact' }} className="btn btn-outline btn-lg" style={{ borderRadius: '100px', borderColor: 'white', color: 'white' }}>Start Project</Link>
                        </div>
                        
                        {/* Interactive Social links */}
                        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem', opacity: 0.6 }}>
                            <a href="#" style={{ color: 'white' }}><Instagram size={24} /></a>
                            <a href="#" style={{ color: 'white' }}><Send size={24} /></a>
                            <a href="#" style={{ color: 'white' }}><Globe size={24} /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CSS Injection for custom local styles */}
            <style>{`
                #roots {
                    perspective: 1000px;
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }
                @media (max-width: 900px) {
                    #roots > .container > div {
                        display: flex !important;
                        flex-direction: column !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AboutUs;
