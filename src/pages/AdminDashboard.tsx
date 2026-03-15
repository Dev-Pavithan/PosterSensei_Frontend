import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, ArrowRight, Clock, Activity, BarChart3, Star, Zap, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        const interval = setInterval(fetchData, 60000); 
        return () => clearInterval(interval);
    }, []);

    const KPI_CARDS = [
        { icon: <TrendingUp size={24} />, label: 'Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}`, trend: '+12.5%', bg: 'linear-gradient(135deg, #6366f1, #a855f7)', size: 'large' },
        { icon: <Zap size={24} />, label: 'Orders', value: stats.totalOrders, trend: '+8.2%', bg: 'linear-gradient(135deg, #10b981, #3b82f6)', size: 'small' },
        { icon: <Clock size={24} />, label: 'Pending', value: stats.pendingOrders, trend: '-2.4%', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', size: 'small' },
        { icon: <Activity size={24} />, label: 'Delivered', value: stats.deliveredOrders, trend: '+4.1%', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', size: 'medium' },
    ];

    const maxRev = Math.max(...(stats.revenueByDay?.map((d: any) => d.revenue) || [1]));

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontWeight: 900, fontSize: '2.5rem', color: 'var(--text-primary)', letterSpacing: '-1px' }}>Studio Insight</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} /> 
                        Live Terminal · Synced {refreshTime.toLocaleTimeString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/products" className="btn-ghost-admin" style={{ border: '1px solid var(--border)', background: 'var(--surface)', paddingInline: '1.5rem' }}>Inventory</Link>
                    <Link to="/admin/orders" className="btn btn-primary" style={{ paddingInline: '2rem', borderRadius: '16px', fontWeight: 800 }}>Dispatch Hub</Link>
                </div>
            </div>

            <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'minmax(160px, auto)', gap: '1.5rem', marginBottom: '3rem' }}>
                {KPI_CARDS.map(({ icon, label, value, trend, bg, size }, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={label}
                        style={{ 
                            gridColumn: size === 'large' ? 'span 2' : size === 'medium' ? 'span 2' : 'span 1',
                            gridRow: size === 'large' ? 'span 2' : 'span 1',
                            background: bg, borderRadius: '32px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>{icon}</div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>{trend}</span>
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                                <div style={{ fontSize: size === 'large' ? '2.5rem' : '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>{loading ? '...' : value}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '40px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarChart3 size={28} color="var(--primary)" /> Velocity Curve
                    </h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '30px' }}>
                        {stats.revenueByDay?.map((day: any, i: number) => (
                            <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', height: '100%' }}>
                                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${(day.revenue / (maxRev || 1)) * 100}%` }} transition={{ delay: i * 0.05 + 0.5 }}
                                        style={{ width: '100%', background: 'linear-gradient(to top, var(--primary), var(--secondary))', borderRadius: '12px' }} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>{new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '40px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Star size={28} color="#f59e0b" /> Hall of Fame
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {stats.topProducts?.slice(0, 4).map((p: any, i: number) => (
                            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <img src={p.image} alt="" style={{ width: 64, height: 64, borderRadius: '16px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{p.totalQty} Sales</div>
                                </div>
                                <div style={{ fontWeight: 900, color: 'var(--primary)' }}>LKR {p.totalRevenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', borderRadius: '40px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1.5rem' }}>Live Transmission</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)' }}>
                                {['Code', 'Agent', 'Volume', 'Status', 'Timestamp'].map(h => (
                                    <th key={h} style={{ padding: '1.25rem 2.5rem', textAlign: 'left', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.5rem 2.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{o._id?.slice(-8).toUpperCase()}</td>
                                    <td style={{ padding: '1.5rem 2.5rem' }}>{o.user?.name}</td>
                                    <td style={{ padding: '1.5rem 2.5rem', fontWeight: 900 }}>LKR {o.totalPrice.toLocaleString()}</td>
                                    <td style={{ padding: '1.5rem 2.5rem' }}>{o.status}</td>
                                    <td style={{ padding: '1.5rem 2.5rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
