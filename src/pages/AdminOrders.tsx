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

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Full Order List</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{!loading && `${orders.length} total orders`}</p>
                </div>
                <button onClick={fetchOrders} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}><RefreshCw size={16} /> Refresh</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="input-icon-wrap" style={{ flex: 1, minWidth: '200px' }}>
                    <Search size={16} className="input-icon" />
                    <input type="text" placeholder="Search by Order ID, Name or Email" className="input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={7} style={{ padding: '0.75rem 1rem' }}><div className="skeleton" style={{ height: '20px' }} /></td></tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={7}><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders match your filters.</div></td></tr>
                            ) : filteredOrders.map(o => (
                                <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>#{o._id.slice(-8).toUpperCase()}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{o.user?.name || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{o.totalPrice}</td>
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
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '0.4rem 0.6rem' }}>
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === o._id && (
                                            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '40px', top: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: '180px' }}>
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
