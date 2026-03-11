import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, TrendingUp, ShoppingBag, ArrowRight, Clock, Activity, BarChart3, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0, revenueByDay: [], topProducts: [], statusDistribution: [] });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTime, setRefreshTime] = useState(new Date());

    const fetchData = () => {
        Promise.all([
            axios.get('/api/orders/stats'),
            axios.get('/api/orders'),
        ]).then(([statsR, ordersR]) => {
            setStats(statsR.data);
            setRecentOrders(ordersR.data.slice(0, 5));
            setRefreshTime(new Date());
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Live update every minute
        return () => clearInterval(interval);
    }, []);

    const KPI_CARDS = [
        { icon: <TrendingUp size={24} />, label: 'Total Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { icon: <Package size={24} />, label: 'Total Orders', value: stats.totalOrders, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { icon: <Clock size={24} />, label: 'Pending', value: stats.pendingOrders, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { icon: <Activity size={24} />, label: 'Delivered', value: stats.deliveredOrders, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    const maxRev = Math.max(...(stats.revenueByDay?.map((d: any) => d.revenue) || [1]));

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)' }}>Dashboard Overview</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> 
                        Live Data · Last updated {refreshTime.toLocaleTimeString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/admin/products" className="btn btn-outline">Manage Products</Link>
                    <Link to="/admin/orders" className="btn btn-primary">All Orders</Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {KPI_CARDS.map(({ icon, label, value, color, bg }) => (
                    <div key={label} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: color, opacity: 0.05, borderRadius: '50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{loading ? '—' : value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Sales Chart */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={20} color="var(--primary)" /> Revenue Trend (Last 7 Days)</h3>
                    </div>
                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                        {stats.revenueByDay?.map((day: any) => (
                            <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                    <div style={{ 
                                        width: '100%', 
                                        height: `${(day.revenue / maxRev) * 100}%`, 
                                        background: 'linear-gradient(to top, var(--primary), var(--secondary))', 
                                        borderRadius: '4px 4px 0 0',
                                        minHeight: '4px',
                                        transition: 'height 1s ease-out'
                                    }} title={`LKR ${day.revenue}`} />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', transform: 'rotate(-45deg)', marginTop: '5px' }}>
                                    {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={20} color="var(--accent)" /> Best Sellers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.topProducts?.map((p: any) => (
                            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                                <img src={p.image} alt="" style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.totalQty} units sold</div>
                                </div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>LKR {p.totalRevenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="card">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Recent Order Activity</h3>
                    <Link to="/admin/orders" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ArrowRight size={14} /></Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Order</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--primary)' }}>#{o._id?.slice(-8).toUpperCase()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{o.user?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 750 }}>LKR {o.totalPrice.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span className={`badge status-${o.status}`} style={{ background: 'var(--surface-2)', borderRadius: '6px' }}>{o.status}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
