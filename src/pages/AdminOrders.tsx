import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Search, Filter, RefreshCw, Check, XCircle, Truck, Package, Eye, X } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
    pending: 'badge-secondary',
    processing: 'badge-primary',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Tracking ID modal state
    const [trackingModal, setTrackingModal] = useState<{ orderId: string; status: string } | null>(null);
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingNote, setTrackingNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    // Pagination State
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = () => {
        setLoading(true);
        axios.get('/api/orders').then(r => setOrders(r.data)).catch(() => setOrders([])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const handleStatusClick = (orderId: string, status: string) => {
        setOpenMenuId(null);
        if (status === 'shipped') {
            // Require tracking ID
            setTrackingInput('');
            setTrackingNote('');
            setTrackingError('');
            setTrackingModal({ orderId, status });
        } else {
            updateStatus(orderId, status, '');
        }
    };

    const updateStatus = async (id: string, status: string, trackingId: string, note = '') => {
        setSaving(true);
        try {
            await axios.put(`/api/orders/${id}/status`, { status, trackingId, notes: note });
            setOrders(os => os.map(o => o._id === id ? { ...o, status, trackingId } : o));
            setTrackingModal(null);
        } catch (err) {
            alert('Failed to update order status');
        } finally {
            setSaving(false);
        }
    };

    const handleTrackingSubmit = () => {
        if (!trackingInput.trim()) {
            setTrackingError('Tracking ID is required to mark as Shipped.');
            return;
        }
        if (trackingModal) {
            updateStatus(trackingModal.orderId, trackingModal.status, trackingInput.trim(), trackingNote.trim());
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
        const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page if search/filter changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, pageSize]);

    return (
        <div className="container">
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{
                        fontWeight: 900,
                        fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                        color: 'var(--text-primary)',
                        letterSpacing: '-1px'
                    }}>Order Manifest</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.4rem' }}>
                        {!loading ? `Orchestrating ${orders.length} deployments` : 'Loading manifest...'}
                    </p>
                </div>
                <button onClick={fetchOrders} className="btn-ghost-admin" style={{
                    border: '1px solid var(--border)',
                    width: 'auto',
                    paddingInline: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    background: 'var(--surface)'
                }}>
                    <RefreshCw size={18} /> Sync Orders
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div className="input-icon-wrap" style={{ flex: '1 1 300px', minWidth: 'min(100%, 300px)' }}>
                    <Search size={16} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name or Email"
                        className="input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem', borderRadius: '16px' }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: window.innerWidth < 640 ? '1 1 100%' : 'none'
                }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', minWidth: '150px', borderRadius: '16px' }}>
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div style={{
                background: 'rgba(var(--surface-rgb), 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    overflowX: 'auto',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                        fontSize: '0.875rem',
                        minWidth: '950px'
                    }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '0.85rem 1rem',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(pageSize || 6).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={7} style={{ padding: '0.75rem 1rem' }}><div className="skeleton" style={{ height: '20px' }} /></td></tr>
                                ))
                            ) : paginatedOrders.length === 0 ? (
                                <tr><td colSpan={7}><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders match your filters.</div></td></tr>
                            ) : paginatedOrders.map(o => (
                                <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>#{o._id.slice(-8).toUpperCase()}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{o.user?.name || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>LKR {o.totalPrice}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontSize: '0.78rem' }}>{o.paymentMethod}</div>
                                        <div style={{ fontSize: '0.68rem', color: o.isPaid ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>{o.isPaid ? 'PAID' : 'PENDING'}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span className={`badge ${STATUS_COLORS[o.status] || 'badge-secondary'}`} style={{ textTransform: 'capitalize' }}>{o.status}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === o._id ? null : o._id); }}
                                            className="btn-ghost-admin"
                                            style={{ width: '40px', height: '40px', borderRadius: '12px', justifyContent: 'center' }}>
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === o._id && (
                                            <div
                                                onClick={e => e.stopPropagation()}
                                                style={{
                                                    position: 'absolute',
                                                    right: '100%',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    marginRight: '0.75rem',
                                                    background: 'var(--surface)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                                    zIndex: 2000,
                                                    minWidth: '200px',
                                                    overflow: 'hidden',
                                                    padding: '0.5rem'
                                                }}>
                                                <div style={{ padding: '0.4rem' }}>
                                                    <Link to={`/orders/${o._id}`} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                                        <Eye size={14} /> View Details
                                                    </Link>
                                                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />
                                                    <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Status</div>
                                                    {STATUS_OPTIONS.filter(s => s !== o.status).map(s => (
                                                        <button key={s} onClick={() => handleStatusClick(o._id, s)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.5rem', textTransform: 'capitalize', color: s === 'cancelled' ? 'var(--error)' : 'var(--text-primary)' }}>
                                                            {s === 'delivered' ? <Check size={14} /> : s === 'cancelled' ? <XCircle size={14} /> : s === 'shipped' ? <Truck size={14} /> : <Package size={14} />}
                                                            {s === 'shipped' ? '📦 Shipped (Tracking required)' : s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    {!loading && filteredOrders.length > 0 && (
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface-2)', }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show</span>
                                <select
                                    value={pageSize}
                                    onChange={e => setPageSize(Number(e.target.value))}
                                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.3rem 0.6rem', color: 'var(--text-primary)', fontWeight: 700, outline: 'none' }}
                                >
                                    {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} entries</option>)}
                                </select>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>of {filteredOrders.length} orders</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="btn-ghost-admin"
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', justifyContent: 'center', opacity: currentPage === 1 ? 0.4 : 1 }}
                                >
                                    <RefreshCw size={14} style={{ transform: 'rotate(-90deg)' }} />
                                </button>

                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                                            if (p === 2 || p === totalPages - 1) return <span key={p} style={{ padding: '0 0.25rem', color: 'var(--text-muted)' }}>...</span>;
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                                                    background: currentPage === p ? 'var(--primary)' : 'transparent',
                                                    color: currentPage === p ? 'white' : 'var(--text-primary)',
                                                    fontWeight: 800, cursor: 'pointer', transition: '0.2s', fontSize: '0.85rem'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="btn-ghost-admin"
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', justifyContent: 'center', opacity: currentPage === totalPages ? 0.4 : 1 }}
                                >
                                    <RefreshCw size={14} style={{ transform: 'rotate(90deg)' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tracking ID Modal */}
            {trackingModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Truck size={20} />
                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Mark as Shipped</span>
                            </div>
                            <button onClick={() => setTrackingModal(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0.4rem', color: 'white', display: 'flex' }}><X size={18} /></button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                Please enter a <strong>Tracking ID</strong> so the customer can track their shipment. This is required before marking the order as shipped.
                            </p>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Tracking ID / Courier Number <span style={{ color: 'var(--error)' }}>*</span>
                                </label>
                                <input
                                    className={`input ${trackingError ? 'input-error' : ''}`}
                                    placeholder="e.g. DTDC-123456, BlueDart-AB789"
                                    value={trackingInput}
                                    onChange={e => { setTrackingInput(e.target.value); setTrackingError(''); }}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleTrackingSubmit()}
                                />
                                {trackingError && <span style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>{trackingError}</span>}
                            </div>

                            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="input-label">Note / Message to Customer <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                                <textarea
                                    className="input"
                                    placeholder="e.g. Dispatched via DTDC. Expected delivery in 3–5 days."
                                    value={trackingNote}
                                    onChange={e => setTrackingNote(e.target.value)}
                                    rows={2}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => setTrackingModal(null)} className="btn btn-ghost" style={{ border: '1px solid var(--border)', flex: 1 }}>Cancel</button>
                                <button onClick={handleTrackingSubmit} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                                    <Truck size={15} /> {saving ? 'Saving...' : 'Confirm Shipment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
