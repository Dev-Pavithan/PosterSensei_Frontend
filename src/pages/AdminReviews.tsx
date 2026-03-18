import React, { useEffect, useState } from 'react';
import { Check, X, Eye, Star, Image as ImageIcon, User, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { showConfirm, showError, showSuccess } from '../utils/alerts';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: 'rgba(245, 158, 11, 0.12)',  color: '#f59e0b', label: 'Pending' },
    approved: { bg: 'rgba(34, 197, 94, 0.12)',   color: '#22c55e', label: 'Approved' },
    rejected: { bg: 'rgba(239, 68, 68, 0.12)',   color: '#ef4444', label: 'Rejected' },
};

const FILTER_TABS = ['all', 'pending', 'approved', 'rejected'] as const;
type FilterTab = typeof FILTER_TABS[number];

const AdminReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewReview, setViewReview] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/products/reviews/all');
            setReviews(data);
        } catch (err) {
            showError('Fetch Failed', 'Failed to retrieve reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const filtered = activeFilter === 'all' ? reviews : reviews.filter(r => r.status === activeFilter);

    const counts = {
        all: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
    };

    const handleStatusUpdate = async (productId: string, reviewId: string, status: 'approved' | 'rejected') => {
        const action = status === 'approved' ? 'Approve' : 'Reject';
        const result = await showConfirm(`${action} Review?`, `Are you sure you want to ${status} this review?`, action);
        if (!result.isConfirmed) return;

        try {
            await axios.put(`/api/products/${productId}/reviews/${reviewId}`, { status });
            showSuccess('Status Updated', `Review has been ${status}.`);
            setReviews(prev => prev.map(r => (r.reviewId?.toString() === reviewId?.toString() || r._id?.toString() === reviewId?.toString()) ? { ...r, status } : r));
            if (viewReview && (viewReview.reviewId?.toString() === reviewId?.toString() || viewReview._id?.toString() === reviewId?.toString())) {
                setViewReview((v: any) => ({ ...v, status }));
            }
        } catch (err) {
            showError('Update Failed', 'Failed to update review status.');
        }
    };

    const handleDelete = async (productId: string, reviewId: string) => {
        const result = await showConfirm('Delete Review?', 'This action is permanent and cannot be undone.', 'Delete Forever');
        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/products/${productId}/reviews/${reviewId}`);
            showSuccess('Deleted', 'Review has been removed from the system.');
            setReviews(prev => prev.filter(r => r.reviewId?.toString() !== reviewId?.toString() && r._id?.toString() !== reviewId?.toString()));
            if (viewReview && (viewReview.reviewId?.toString() === reviewId?.toString())) setViewReview(null);
        } catch (err) {
            showError('Deletion Failed', 'Failed to delete review.');
        }
    };

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '2.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    Review Terminal
                    <button
                        onClick={fetchReviews}
                        title="Refresh"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                    >
                        <RotateCcw size={18} />
                    </button>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, marginTop: '0.4rem' }}>
                    Moderate all product feedback and maintain quality standards.
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {FILTER_TABS.map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '100px',
                            border: activeFilter === f ? '2px solid var(--primary)' : '2px solid var(--border)',
                            background: activeFilter === f ? 'var(--primary)' : 'var(--surface)',
                            color: activeFilter === f ? 'white' : 'var(--text-muted)',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {f}
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '20px',
                            height: '20px',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            background: activeFilter === f ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                            color: activeFilter === f ? 'white' : 'var(--text-primary)',
                            padding: '0 5px',
                        }}>
                            {counts[f]}
                        </span>
                    </button>
                ))}
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['Contributor', 'Product', 'Rating & Comment', 'Visual', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td colSpan={7} style={{ padding: '2rem' }}><div className="skeleton" style={{ height: '24px' }} /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍃</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>No {activeFilter === 'all' ? '' : activeFilter} reviews found.</div>
                                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Nothing to show here.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(r => {
                                const rid = r.reviewId || r._id;
                                const ss = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                                return (
                                    <tr key={rid?.toString()} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                                        {/* Contributor */}
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '12px', overflow: 'hidden', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {r.userProfilePic ? (
                                                        <img src={r.userProfilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.name || r.userName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Buyer</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Product */}
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 40, height: 44, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                    <img src={r.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.productTitle}</div>
                                            </div>
                                        </td>
                                        {/* Rating & Comment */}
                                        <td style={{ padding: '1.25rem 1.5rem', maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= r.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.comment}</p>
                                        </td>
                                        {/* Visual */}
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            {r.image ? (
                                                <div onClick={() => setViewReview(r)} style={{ width: 60, height: 60, borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}>
                                                    <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ) : (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</div>
                                            )}
                                        </td>
                                        {/* Status Badge */}
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '100px', background: ss.bg, color: ss.color, fontSize: '0.75rem', fontWeight: 800 }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: ss.color, display: 'inline-block' }} />
                                                {ss.label}
                                            </span>
                                        </td>
                                        {/* Date */}
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setViewReview(r)} className="btn-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }} title="View">
                                                    <Eye size={18} />
                                                </button>
                                                {r.status !== 'approved' && (
                                                    <button onClick={() => handleStatusUpdate(r.productId, rid, 'approved')} className="btn-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} title="Approve">
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                {r.status !== 'rejected' && (
                                                    <button onClick={() => handleStatusUpdate(r.productId, rid, 'rejected')} className="btn-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }} title="Reject">
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Review Modal */}
            <AnimatePresence>
                {viewReview && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewReview(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ position: 'relative', background: 'var(--surface)', borderRadius: '32px', maxWidth: '600px', width: '100%', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {viewReview.image ? (
                                <div style={{ position: 'relative', height: '350px', background: 'black' }}>
                                    <img src={viewReview.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div style={{ height: '120px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                                    <ImageIcon size={32} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>No image attached</span>
                                </div>
                            )}
                            <button onClick={() => setViewReview(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>

                            <div style={{ padding: '1.75rem' }}>
                                {/* Contributor info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {viewReview.userProfilePic ? (
                                            <img src={viewReview.userProfilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={22} color="var(--primary)" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{viewReview.name || viewReview.userName}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{viewReview.productTitle}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '100px', background: STATUS_STYLES[viewReview.status]?.bg, color: STATUS_STYLES[viewReview.status]?.color, fontSize: '0.75rem', fontWeight: 800 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_STYLES[viewReview.status]?.color, display: 'inline-block' }} />
                                            {STATUS_STYLES[viewReview.status]?.label}
                                        </span>
                                    </div>
                                </div>
                                {/* Stars */}
                                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={s <= viewReview.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                                </div>
                                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 1.5rem' }}>"{viewReview.comment}"</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    {viewReview.status !== 'approved' && (
                                        <button onClick={() => { handleStatusUpdate(viewReview.productId, viewReview.reviewId || viewReview._id, 'approved'); }} className="btn btn-primary" style={{ paddingInline: '1.75rem' }}>Approve</button>
                                    )}
                                    {viewReview.status !== 'rejected' && (
                                        <button onClick={() => { handleStatusUpdate(viewReview.productId, viewReview.reviewId || viewReview._id, 'rejected'); }} className="btn btn-outline" style={{ paddingInline: '1.75rem' }}>Reject</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .btn-icon:hover {
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default AdminReviews;
