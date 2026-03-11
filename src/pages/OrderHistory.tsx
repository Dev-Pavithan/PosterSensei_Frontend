import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const statusClass = (s: string) => `badge status-${s}`;

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        axios.get('/api/orders/myorders')
            .then(r => setOrders(r.data))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><Link to="/login" className="btn btn-primary">Login to view orders</Link></div>;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={22} color="var(--primary)" /> My Orders
            </h1>
            {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: '100px', marginBottom: '1rem' }} />)
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Package size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                orders.map(order => (
                    <Link key={order._id} to={`/orders/${order._id}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '0.75rem', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                            {order.orderItems.slice(0, 3).map((item: any, i: number) => (
                                <img key={i} src={item.image} alt="" style={{ width: '56px', height: '62px', objectFit: 'cover', borderRadius: '6px' }} />
                            ))}
                            {order.orderItems.length > 3 && <div style={{ width: '56px', height: '62px', borderRadius: '6px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>+{order.orderItems.length - 3}</div>}
                        </div>
                        <div style={{ flex: 2 }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                {order.orderItems.length === 1 ? order.orderItems[0].title : `${order.orderItems.length} items`}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>₹{order.totalPrice}</div>
                            <span className={`badge ${statusClass(order.status)}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </Link>
                ))
            )}
        </div>
    );
};

export default OrderHistory;
