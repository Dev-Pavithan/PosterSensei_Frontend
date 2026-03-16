import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Trash2, Edit2, ShieldAlert, ShieldOff, Users2 } from 'lucide-react';
import axios from 'axios';
import { showAlert, showConfirm, showError, showToast } from '../utils/alerts';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Pagination State
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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
        const result = await showConfirm(
            isAdmin ? 'Revoke Admin?' : 'Grant Admin?',
            `Are you sure you want to ${isAdmin ? 'remove admin rights from' : 'grant admin rights to'} this user?`,
            isAdmin ? 'Revoke Rights' : 'Grant Access'
        );
        if (!result.isConfirmed) return;
        
        try {
            await axios.put(`/api/users/${id}`, { isAdmin: !isAdmin });
            fetchUsers();
            showToast(`Role updated successfully`);
        } catch (err) {
            showError('Update Failed', 'Collision detected in user role modification.');
        }
    };

    const deleteUser = async (id: string) => {
        const result = await showConfirm('Exterminate User?', 'This account will be permanently deleted. This action is irreversible.', 'Delete Forever');
        if (!result.isConfirmed) return;
        
        try {
            await axios.delete(`/api/users/${id}`);
            setUsers(u => u.filter(user => user._id !== id));
            showToast('User account removed');
        } catch (err: any) {
            showError('Deletion Blocked', err.response?.data?.message || 'Could not delete user account.');
        }
    };

    const totalPages = Math.ceil(users.length / pageSize);
    const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page if pageSize changes
    useEffect(() => { setCurrentPage(1); }, [pageSize]);

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
                    }}>User Directory</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.4rem' }}>
                        {!loading ? `Managing ${users.length} authenticated souls` : 'Scanning entities...'}
                    </p>
                </div>
                <div style={{ width: window.innerWidth < 640 ? '100%' : 'auto' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.75rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                        <Users2 size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{users.length} Total</span>
                    </div>
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
                        minWidth: '850px'
                    }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['#', 'Name', 'Email', 'Joined', 'Role', 'Actions'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '0.85rem 1rem',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(pageSize || 5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={6} style={{ padding: '0.75rem 1rem' }}><div className="skeleton" style={{ height: '20px' }} /></td></tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6}><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</div></td></tr>
                            ) : paginatedUsers.map((u, idx) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, overflow: 'hidden' }}>
                                                {u.profilePic ? (
                                                    <img src={u.profilePic} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{u.name?.[0]?.toUpperCase() || 'U'}</div>
                                                )}
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
                                            className="btn-ghost-admin"
                                            style={{ width: '40px', height: '40px', borderRadius: '12px', justifyContent: 'center' }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === u._id && (
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

                    {/* Pagination Footer */}
                    {!loading && users.length > 0 && (
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface-2)', }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show</span>
                                <select
                                    value={pageSize}
                                    onChange={e => setPageSize(Number(e.target.value))}
                                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.3rem 0.6rem', color: 'var(--text-primary)', fontWeight: 700, outline: 'none' }}
                                >
                                    {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} users</option>)}
                                </select>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>of {users.length} total</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="btn-ghost-admin"
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', justifyContent: 'center', opacity: currentPage === 1 ? 0.4 : 1 }}
                                >
                                    <ShieldOff size={14} style={{ transform: 'rotate(-90deg)' }} />
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
                                    <ShieldOff size={14} style={{ transform: 'rotate(90deg)' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
