import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Trash2, Edit2, ShieldAlert, ShieldOff } from 'lucide-react';
import axios from 'axios';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const toggleAdmin = async (id: string, isAdmin: boolean) => {
        if (!confirm(`Are you sure you want to ${isAdmin ? 'remove admin rights from' : 'grant admin rights to'} this user?`)) return;
        try {
            await axios.put(`/api/users/${id}`, { isAdmin: !isAdmin });
            fetchUsers();
        } catch (err) {
            alert('Error updating user role');
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/users/${id}`);
            setUsers(u => u.filter(user => user._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Manage Users</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {!loading && `${users.length} users found`}
                    </p>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['#', 'Name', 'Email', 'Joined', 'Role', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={6} style={{ padding: '0.75rem 1rem' }}><div className="skeleton" style={{ height: '20px' }} /></td></tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6}><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</div></td></tr>
                            ) : users.map((u, idx) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                                                {u.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <a href={`mailto:${u.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{u.email}</a>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        {u.isAdmin
                                            ? <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={11} /> Admin</span>
                                            : <span className="badge badge-secondary">User</span>
                                        }
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === u._id ? null : u._id); }}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '0.4rem 0.6rem' }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === u._id && (
                                            <div
                                                onClick={e => e.stopPropagation()}
                                                style={{ position: 'absolute', right: '40px', top: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: '170px' }}>
                                                <div style={{ padding: '0.4rem' }}>
                                                    <button
                                                        onClick={() => { toggleAdmin(u._id, u.isAdmin); setOpenMenuId(null); }}
                                                        className="btn btn-ghost btn-sm btn-full"
                                                        style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                        {u.isAdmin ? <ShieldOff size={14} /> : <ShieldAlert size={14} />}
                                                        {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                    </button>
                                                    {!u.isAdmin && (
                                                        <button
                                                            onClick={() => { deleteUser(u._id); setOpenMenuId(null); }}
                                                            className="btn btn-ghost btn-sm btn-full"
                                                            style={{ justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--error)', marginTop: '0.25rem' }}>
                                                            <Trash2 size={14} /> Delete User
                                                        </button>
                                                    )}
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
        </div>
    );
};

export default AdminUsers;
