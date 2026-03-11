import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, TrendingUp, ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('/api/orders/stats', { headers: { Authorization: `Bearer ${user?._id}` } }),
            axios.get('/api/orders', { headers: { Authorization: `Bearer ${user?._id}` } }),
        ]).then(([statsR, ordersR]) => {
            setStats(statsR.data);
            setRecentOrders(ordersR.data.slice(0, 5));
        }).finally(() => setLoading(false));
    }, []);

    const KPI_CARDS = [
        { icon: <Package size={24} />, label: 'Total Orders', value: stats.totalOrders, color: '#3b82f6', bg: '#dbeafe' },
        { icon: <TrendingUp size={24} />, label: 'Total Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}`, color: '#10b981', bg: '#d1fae5' },
        { icon: <Clock size={24} />, label: 'Pending Orders', value: stats.pendingOrders, color: '#f59e0b', bg: '#fef3c7' },
        { icon: <ShoppingBag size={24} />, label: 'Delivered', value: stats.deliveredOrders, color: '#8b5cf6', bg: '#ede9fe' },
    ];

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.6rem' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Welcome back, {user?.name}! Here's what's happening.</p>
                </div>
                <Link to="/admin/products" className="btn btn-primary">Manage Products <ArrowRight size={15} /></Link>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {KPI_CARDS.map(({ icon, label, value, color, bg }) => (
                    <div key={label} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '—' : value}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: <Package size={20} />, title: 'Manage Products', desc: 'Add, edit, delete poster listings', to: '/admin/products', color: 'var(--primary)' },
                    { icon: <Users size={20} />, title: 'View All Orders', desc: 'Review and update order statuses', to: '#', color: 'var(--secondary)' },
                ].map(({ icon, title, desc, to, color }) => (
                    <Link key={title} to={to} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
                        </div>
                        <ArrowRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                    </Link>
                ))}
            </div>

            {/* Recent orders table */}
            <div className="card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Recent Orders</div>
                {recentOrders.map((o, i) => (
                    <div key={o._id} style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{o._id?.slice(-6).toUpperCase()}</div>
                        </div>
                        <div style={{ fontWeight: 600 }}>LKR {o.totalPrice}</div>
                        <span className={`badge status-${o.status}`} style={{ textTransform: 'capitalize' }}>{o.status}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
