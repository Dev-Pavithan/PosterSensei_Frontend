import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, ArrowRight, Clock, Activity, BarChart3, Star, Zap, Target,
    Package, ShoppingBag, DollarSign, Users, RefreshCw, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>({ 
        totalOrders: 0, 
        totalRevenue: 0, 
        pendingOrders: 0, 
        deliveredOrders: 0, 
        revenueByDay: [], 
        topProducts: [], 
        statusDistribution: [] 
    });
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
        { 
            icon: <DollarSign size={24} />, 
            label: 'Revenue', 
            value: `LKR ${stats.totalRevenue?.toLocaleString() || 0}`, 
            change: '+12.5%', 
            color: 'from-blue-500 to-indigo-600',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        { 
            icon: <ShoppingBag size={24} />, 
            label: 'Total Orders', 
            value: stats.totalOrders || 0, 
            change: '+8.2%', 
            color: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        },
        { 
            icon: <Clock size={24} />, 
            label: 'Pending', 
            value: stats.pendingOrders || 0, 
            change: '-2.4%', 
            color: 'from-amber-500 to-orange-600',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400'
        },
        { 
            icon: <Package size={24} />, 
            label: 'Delivered', 
            value: stats.deliveredOrders || 0, 
            change: '+4.1%', 
            color: 'from-purple-500 to-pink-600',
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-600 dark:text-purple-400'
        },
    ];

    const maxRev = Math.max(...(stats.revenueByDay?.map((d: any) => d.revenue) || [1]));

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '4rem' }}
        >
            {/* Header Section */}
            <motion.div 
                variants={itemVariants}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '3rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}
            >
                <div>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 800, 
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.5rem'
                    }}>
                        Dashboard
                    </h1>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        <span>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            <span>Updated {refreshTime.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link 
                        to="/admin/products" 
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--surface-2)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--surface)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    >
                        Manage Products
                    </Link>
                    <Link 
                        to="/admin/orders" 
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--primary-dark)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        View Orders
                    </Link>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div 
                variants={containerVariants}
                className="bento-grid"
                style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2.5rem'
                }}
            >
                {KPI_CARDS.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        style={{ 
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ 
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: card.iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.iconColor
                            }}>
                                {card.icon}
                            </div>
                            <span style={{ 
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '0.25rem 0.75rem',
                                background: card.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: card.change.startsWith('+') ? '#10b981' : '#ef4444',
                                borderRadius: '20px'
                            }}>
                                {card.change}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {loading ? '...' : card.value}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <div className="velocity-curve-container" style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                {/* Revenue Chart */}
                <motion.div
                    variants={itemVariants}
                    style={{ 
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Revenue Overview
                        </h3>
                        <BarChart3 size={20} color="var(--text-muted)" />
                    </div>
                    
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        {stats.revenueByDay?.map((day: any, i: number) => (
                            <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '100%', position: 'relative', height: '150px', display: 'flex', alignItems: 'flex-end' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.revenue / (maxRev || 1)) * 100}%` }}
                                        transition={{ delay: i * 0.02, duration: 0.5 }}
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)',
                                            borderRadius: '8px 8px 4px 4px',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            color: 'var(--text-muted)',
                                            whiteSpace: 'nowrap',
                                            opacity: 0,
                                            transition: 'opacity 0.2s'
                                        }}>
                                            LKR {day.revenue.toLocaleString()}
                                        </div>
                                    </motion.div>
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    variants={itemVariants}
                    style={{ 
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Top Products
                        </h3>
                        <Star size={20} color="var(--text-muted)" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.topProducts?.slice(0, 4).map((product: any, i: number) => (
                            <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'var(--surface-2)',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {product.image && (
                                        <img 
                                            src={product.image} 
                                            alt="" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        fontWeight: 600, 
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.25rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {product.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {product.totalQty} sold
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                    LKR {product.totalRevenue?.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Orders Table */}
            <motion.div
                variants={itemVariants}
                style={{ 
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    overflow: 'hidden'
                }}
            >
                <div style={{ 
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Recent Orders
                    </h3>
                    <Link 
                        to="/admin/orders"
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}
                    >
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Order ID</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, idx) => (
                                <motion.tr 
                                    key={order._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                                        #{order._id?.slice(-8).toUpperCase()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>
                                        {order.user?.name || 'Guest'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        LKR {order.totalPrice?.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' :
                                                        order.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                                                        'rgba(59, 130, 246, 0.1)',
                                            color: order.status === 'delivered' ? '#10b981' :
                                                   order.status === 'pending' ? '#f59e0b' :
                                                   '#3b82f6'
                                        }}>
                                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .container {
                        padding-inline: 1rem !important;
                    }
                    h1 {
                        font-size: 2rem !important;
                    }
                    .bento-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .bento-grid > div {
                        grid-column: span 1 !important;
                        grid-row: span 1 !important;
                        height: auto !important;
                        min-height: 160px;
                    }
                    .velocity-curve-container {
                        grid-template-columns: 1fr !important;
                    }
                    table th:nth-child(4), table td:nth-child(4),
                    table th:nth-child(5), table td:nth-child(5) {
                        display: none;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default AdminDashboard;