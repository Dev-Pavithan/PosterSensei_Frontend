import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, Loader2 } from 'lucide-react';
import axios from 'axios';
import { showError, showSuccess } from '../utils/alerts';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productTitle: string;
    productImage: string;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, productId, productTitle, productImage, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await axios.post('/api/upload', formData);
            setImage(data.imageUrl);
        } catch (err) {
            showError('Upload Failed', 'Failed to transmit image to the studio vault.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return showError('Comment Required', 'Please share your thoughts on the product.');

        setSubmitting(true);
        try {
            await axios.post(`/api/products/${productId}/reviews`, { rating, comment, image });
            showSuccess('Review Logged', 'Your feedback has been submitted for moderation.');
            onSuccess();
            onClose();
        } catch (err: any) {
            showError('Submission Error', err.response?.data?.message || 'Failed to sync review with the studio.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={onClose} 
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} 
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{ 
                        position: 'relative', 
                        background: 'var(--surface)', 
                        borderRadius: '32px', 
                        maxWidth: '550px', 
                        width: '100%', 
                        overflow: 'hidden', 
                        border: '1px solid var(--border)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{ padding: '2rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <img src={productImage} alt="" style={{ width: '60px', height: '70px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Reviewing</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{productTitle}</h3>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}>RATING SCOPE</label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                        key={s} 
                                        type="button" 
                                        onClick={() => setRating(s)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Star size={32} fill={s <= rating ? 'var(--accent)' : 'none'} color="var(--accent)" strokeWidth={s <= rating ? 0 : 2} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>YOUR FEEDBACK</label>
                            <textarea 
                                className="input studio-input" 
                                value={comment} 
                                onChange={e => setComment(e.target.value)} 
                                placeholder="Describe your experience with this creative asset..."
                                rows={4}
                                style={{ width: '100%', borderRadius: '20px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1.25rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', resize: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}>VISUAL EVIDENCE (OPTIONAL)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {image ? (
                                    <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                                        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            type="button" 
                                            onClick={() => setImage('')} 
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{ width: '120px', height: '120px', border: '2px dashed var(--border)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s' }}>
                                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                        {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <Camera size={24} color="var(--text-muted)" />}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 800 }}>{uploading ? 'Processing...' : 'Add Photo'}</span>
                                    </label>
                                )}
                                <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>
                                    Upload a high-quality photo of your poster displayed in your space for a chance to be featured.
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting || uploading} 
                            className="btn btn-primary btn-lg rounded-pill" 
                            style={{ width: '100%', height: '60px', fontSize: '1.1rem', fontWeight: 900 }}
                        >
                            {submitting ? 'Transmitting Data...' : 'Submit Feedback'}
                        </button>
                    </form>
                </motion.div>
                
                <style>{`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
