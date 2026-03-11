import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, MapPin, Truck, CreditCard, CheckCircle2, Tag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const [trackingId, setTrackingId] = useState('');

    const fetchOrder = () => {
        axios.get(`/api/orders/${id}`)
            .then(r => {
                setOrder(r.data);
                setStatus(r.data.status);
                setTrackingId(r.data.trackingId || '');
            })
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    };

    useEffect(fetchOrder, [id]);

    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            await axios.put(`/api/orders/${id}/status`, { status, trackingId });
            fetchOrder();
            alert('Order status updated!');
        } catch (err) {
            alert('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    if (loading) return <div className="container" style={{ padding: '2rem' }}><div className="skeleton" style={{ height: '400px' }} /></div>;
    if (!order) return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <Package size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Order not found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This order does not exist or you may not have permission to view it.</p>
            <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
        </div>
    );

    const stepIdx = STATUS_STEPS.indexOf(order.status);

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <Link to="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
                <ChevronLeft size={16} /> Back to Orders
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Order Details</h1>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Order #{order._id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <span className={`badge status-${order.status}`} style={{ textTransform: 'capitalize', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>{order.status}</span>
            </div>

            {/* Status progress */}
            {order.status !== 'cancelled' && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {STATUS_STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: i <= stepIdx ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= stepIdx ? 'white' : 'var(--text-muted)', transition: 'all 0.3s' }}>
                                        {i < stepIdx ? <CheckCircle2 size={18} /> : <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{i + 1}</span>}
                                    </div>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: i <= stepIdx ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize', textAlign: 'center' }}>{s}</span>
                                </div>
                                {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: '2px', background: i < stepIdx ? 'var(--primary)' : 'var(--border)', margin: '0 0.25rem', marginBottom: '1.5rem' }} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { icon: <MapPin size={16} />, label: 'Delivery Address', content: `${order.shippingAddress?.address}, ${order.shippingAddress?.city} - ${order.shippingAddress?.postalCode}` },
                    { icon: <Truck size={16} />, label: 'Delivery Method', content: order.deliveryMethod === 'post' ? 'Standard Post' : 'Room Makeover Service' },
                    { icon: <CreditCard size={16} />, label: 'Payment', content: order.paymentMethod + (order.isPaid ? ' · Paid' : ' · Pending') },
                    { icon: <Package size={16} />, label: 'Items', content: `${order.orderItems?.length} item(s)` },
                ].map(({ icon, label, content }) => (
                    <div key={label} className="card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem' }}>{icon} {label}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{content}</div>
                    </div>
                ))}
            </div>

            {/* Tracking Information — shown when order is shipped/delivered and trackingId is set */}
            {order.trackingId && (
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', border: '2px solid var(--primary)', background: 'var(--primary-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Truck size={18} /> Shipment Tracking
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Tracking ID</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Tag size={14} color="var(--primary)" />
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>{order.trackingId}</span>
                            </div>
                        </div>
                        {order.notes && (
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Note from Seller</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{order.notes}"</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Items</div>
                {order.orderItems?.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                        <img src={item.image} alt="" style={{ width: '70px', height: '78px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Qty: {item.qty} {item.size && `· Size: ${item.size}`}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toFixed(0)}</div>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', gap: '2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{order.totalPrice}</span>
                </div>
            </div>
            {/* Admin Controls */}
            {user?.isAdmin && (
                <div className="card" style={{ padding: '1.5rem', border: '2px dashed var(--primary)', marginBottom: '1.5rem', background: 'var(--primary-light)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Admin Control Panel</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Update Order Status</label>
                            <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tracking ID / Note</label>
                            <input className="input" placeholder="e.g. DTDC-123456" value={trackingId} onChange={e => setTrackingId(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={handleUpdateStatus} disabled={updating} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {updating ? 'Updating...' : 'Save Status Update'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
