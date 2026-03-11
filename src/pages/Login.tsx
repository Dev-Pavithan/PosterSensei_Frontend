import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Instagram, Twitter, Linkedin, Facebook, ChevronLeft, ChevronRight, ChevronDown, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login, register, loading } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexWrap: 'wrap',
            background: 'var(--background)', 
            overflowX: 'hidden' 
        }}>
            {/* Left side: Premium Artistic Panel */}
            <div className="auth-visual-panel" style={{ 
                flex: '1 1 500px', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                margin: 'clamp(0.5rem, 2vw, 1.5rem)',
                borderRadius: 'clamp(1rem, 3vw, 2.5rem)',
                overflow: 'hidden',
                background: 'url(https://i.pinimg.com/736x/22/ca/69/22ca6985cf0b93bd5604ce98cd64bf6b.jpg) center/cover no-repeat',
                minHeight: '400px',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }} />
                
                {/* Visual Label */}
                <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.9 }}>Featured Artist Collection</div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'white', fontWeight: 700, background: 'none', fontSize: '0.9rem' }}>{isLogin ? 'Sign up' : 'Sign in'}</button>
                        <button onClick={() => setIsLogin(false)} style={{ padding: '0.6rem 1.4rem', borderRadius: '2rem', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', fontWeight: 700, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontSize: '0.9rem' }}>Join Now</button>
                    </div>
                </div>

                <div style={{ flex: 1 }} />

                
            </div>

            {/* Right side: Form Panel */}
            <div style={{ 
                flex: '1 1 450px', 
                display: 'flex', 
                flexDirection: 'column', 
                padding: 'clamp(1.5rem, 6vw, 5rem)', 
                background: 'var(--surface)',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(2rem, 5vh, 4rem)' }}>
                        <Link to="/" style={{ fontWeight: 950, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                            POSTER<span style={{ color: 'var(--primary)' }}>SENSEI</span>
                        </Link>
                        {/* <div className="lang-switcher" style={{ border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', background: 'var(--surface-2)' }}>
                            <img src="https://flagcdn.com/w20/gb.png" width="18" alt="EN" /> EN <ChevronDown size={14} />
                        </div> */}
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                            {isLogin ? 'Welcome Back!' : 'Join the Guild'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.05rem', opacity: 0.8 }}>
                            {isLogin ? 'Continuing your journey through anime art.' : 'Start your collection of premium anime aesthetics.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {!isLogin && (
                            <div className="form-item">
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>Display Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" placeholder="Goku77" value={name} onChange={e => setName(e.target.value)} required 
                                        style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, transition: 'border-color 0.2s', fontSize: '1rem' }} />
                                </div>
                            </div>
                        )}
                        <div className="form-item">
                            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required 
                                    style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, transition: 'border-color 0.2s', fontSize: '1rem' }} />
                            </div>
                        </div>
                        <div className="form-item">
                            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>Security Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required 
                                    style={{ width: '100%', padding: '1.1rem 3.5rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, transition: 'border-color 0.2s', fontSize: '1rem' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none' }}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div style={{ textAlign: 'right' }}>
                                <a href="#" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700 }}>Recovery access?</a>
                            </div>
                        )}

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                                style={{ color: 'white', background: 'var(--error)', padding: '0.8rem', borderRadius: '0.75rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}>
                                {error}
                            </motion.div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlock: '0.75rem' }}>
                            <div style={{ flex: 1, height: '1.5px', background: 'var(--border)', opacity: 0.6 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                            <div style={{ flex: 1, height: '1.5px', background: 'var(--border)', opacity: 0.6 }} />
                        </div>

                        {/* <button type="button" className="btn btn-outline btn-full" style={{ justifyContent: 'center', padding: '1rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem' }}>
                            <img src="https://www.google.com/favicon.ico" width="18" alt="G" style={{ marginRight: '0.75rem' }} /> Continue with Google
                        </button> */}

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} 
                            style={{ justifyContent: 'center', background: 'var(--primary)', marginTop: '0.5rem', padding: '1.1rem', borderRadius: '1rem', fontSize: '1.05rem', boxShadow: '0 8px 20px rgba(255, 0, 127, 0.2)' }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="spinner-small" /> Verifying...
                                </div>
                            ) : (
                                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {isLogin ? "New to PosterSensei?" : "Member already?"}{' '}
                        <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary)', fontWeight: 800, background: 'none', borderBottom: '2px solid var(--primary-light)' }}>
                            {isLogin ? 'Join now' : 'Log in instead'}
                        </button>
                    </div>

                    {/* Socials */}
                    {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '1.75rem', marginTop: '3.5rem', color: 'var(--text-muted)' }}>
                        <Facebook size={22} cursor="pointer" className="hover-primary" />
                        <Twitter size={22} cursor="pointer" className="hover-primary" />
                        <Linkedin size={22} cursor="pointer" className="hover-primary" />
                        <Instagram size={22} cursor="pointer" className="hover-primary" />
                    </div> */}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .hover-primary:hover { color: var(--primary) !important; transform: translateY(-2px); transition: all 0.2s; }
                .spinner-small { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            ` }} />
        </div>
    );
};

export default Login;
