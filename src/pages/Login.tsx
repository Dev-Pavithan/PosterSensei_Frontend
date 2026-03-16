import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Instagram, Twitter, Linkedin, Facebook, ChevronLeft, ChevronRight, ChevronDown, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { showSuccess, showError } from '../utils/alerts';

import recoveryImg from '../assets/auth/recovery.png';
import verificationImg from '../assets/auth/verification.png';
import newIdentityImg from '../assets/auth/new_identity.png';

const Login = () => {
    const { login, register, loading } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code, 3: Reset
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleForgotRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSending(true);
        try {
            const { data } = await axios.post('/api/users/forgot-password', { email });
            showSuccess('Code Dispatched', 'A 4-digit recovery code has been broadcasted to your inbox.');
            setForgotStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset code.');
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);
        try {
            const { data } = await axios.post('/api/users/verify-code', { email, code });
            showSuccess('Identity Verified', 'Access granted. You may now establish your new security password.');
            setForgotStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const { data } = await axios.post('/api/users/reset-password', { email, code, password });
            showSuccess('Security Reset', 'Your security password has been updated. Access restored.');
            setTimeout(() => {
                setShowForgot(false);
                setForgotStep(1);
                setIsLogin(true);
                setSuccess('');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password.');
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
                background: `url(${
                    showForgot 
                        ? (forgotStep === 1 ? recoveryImg : forgotStep === 2 ? verificationImg : newIdentityImg)
                        : 'https://i.pinimg.com/736x/22/ca/69/22ca6985cf0b93bd5604ce98cd64bf6b.jpg'
                }) center/cover no-repeat`,
                minHeight: '400px',
                transition: 'background 0.5s ease-in-out'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }} />
                
                {/* Visual Label */}
                <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.9 }}>Featured Artist Collection</div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={() => { setIsLogin(!isLogin); setShowForgot(false); }} style={{ color: 'white', fontWeight: 700, background: 'none', fontSize: '0.9rem' }}>
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                        <button onClick={() => { setIsLogin(false); setShowForgot(false); }} style={{ padding: '0.6rem 1.4rem', borderRadius: '2rem', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', fontWeight: 700, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontSize: '0.9rem' }}>Join Now</button>
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
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.3rem)', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                            {showForgot 
                                ? (forgotStep === 1 ? 'Recovery' : forgotStep === 2 ? 'Verification' : 'New Identity')
                                : (isLogin ? 'Welcome Back!' : 'Join the Guild')}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.05rem', opacity: 0.8 }}>
                            {showForgot
                                ? (forgotStep === 1 ? 'Enter your email to receive a 4-digit reset code.' : forgotStep === 2 ? 'Check your email for the recovery code.' : 'Establish your new security password.')
                                : (isLogin ? 'Continuing your journey through anime art.' : 'Start your collection of premium anime aesthetics.')}
                        </p>
                    </div>

                    {(error || success) && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                            style={{ 
                                color: 'white', 
                                background: error ? 'var(--error)' : '#22c55e', 
                                padding: '0.8rem', 
                                borderRadius: '0.75rem', 
                                fontSize: '0.85rem', 
                                textAlign: 'center', 
                                fontWeight: 700,
                                marginBottom: '1.5rem'
                            }}>
                            {error || success}
                        </motion.div>
                    )}

                    {!showForgot ? (
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
                                    <button type="button" onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }} style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, background: 'none' }}>Recovery access?</button>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlock: '0.75rem' }}>
                                <div style={{ flex: 1, height: '1.5px', background: 'var(--border)', opacity: 0.6 }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                                <div style={{ flex: 1, height: '1.5px', background: 'var(--border)', opacity: 0.6 }} />
                            </div>

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
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {forgotStep === 1 && (
                                <form onSubmit={handleForgotRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-item">
                                        <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required 
                                                style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, fontSize: '1rem' }} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSending} style={{ justifyContent: 'center', padding: '1.1rem', borderRadius: '1rem', fontSize: '1.05rem' }}>
                                        {isSending ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="spinner-small" /> Sending...
                                            </div>
                                        ) : 'Send Code'}
                                    </button>
                                    <button type="button" onClick={() => setShowForgot(false)} style={{ color: 'var(--text-secondary)', background: 'none', fontWeight: 700, marginTop: '0.5rem' }}>Back to Login</button>
                                </form>
                            )}

                            {forgotStep === 2 && (
                                <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-item">
                                        <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>4-Digit Code</label>
                                        <input type="text" placeholder="XXXX" maxLength={4} value={code} onChange={e => setCode(e.target.value)} required 
                                            style={{ width: '100%', padding: '1.1rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', textAlign: 'center', letterSpacing: '1rem', fontSize: '1.5rem', fontWeight: 900, outline: 'none' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isVerifying} style={{ justifyContent: 'center', padding: '1.1rem', borderRadius: '1rem', fontSize: '1.05rem' }}>
                                        {isVerifying ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="spinner-small" /> Verifying...
                                            </div>
                                        ) : 'Verify Code'}
                                    </button>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        <button type="button" onClick={() => setForgotStep(1)} style={{ color: 'var(--text-secondary)', background: 'none', fontWeight: 700 }}>Resend Code</button>
                                        <button type="button" onClick={() => setShowForgot(false)} style={{ color: 'var(--text-muted)', background: 'none', fontWeight: 700 }}>Cancel</button>
                                    </div>
                                </form>
                            )}

                            {forgotStep === 3 && (
                                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-item">
                                        <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type={showNewPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required 
                                                style={{ width: '100%', padding: '1.1rem 3.5rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, fontSize: '1rem' }} />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none' }}>
                                                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-item">
                                        <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'block' }}>Confirm New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type={showConfirmPass ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
                                                style={{ width: '100%', padding: '1.1rem 3.5rem 1.1rem 3.25rem', borderRadius: '1rem', border: '2px solid var(--border)', background: 'var(--surface-2)', outline: 'none', fontWeight: 600, fontSize: '1rem' }} />
                                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none' }}>
                                                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'center', padding: '1.1rem', borderRadius: '1rem', fontSize: '1.05rem' }}>Reset Password</button>
                                </form>
                            )}
                        </div>
                    )}

                    {!showForgot && (
                        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {isLogin ? "New to PosterSensei?" : "Member already?"}{' '}
                            <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary)', fontWeight: 800, background: 'none', borderBottom: '2px solid var(--primary-light)' }}>
                                {isLogin ? 'Join now' : 'Log in instead'}
                            </button>
                        </div>
                    )}
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
