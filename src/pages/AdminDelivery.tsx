import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Truck, Home, Package, Zap } from 'lucide-react';
import { showSuccess, showError } from '../utils/alerts';

interface DeliveryMethod {
    _id: string;
    title: string;
    description: string;
    price: number;
    priceType: 'fixed' | 'from';
    iconType: string;
    badge: string;
    isActive: boolean;
}

const ICONS: Record<string, any> = {
    Truck: <Truck size={20} />,
    Home: <Home size={20} />,
    Package: <Package size={20} />,
    Zap: <Zap size={20} />
};

const AdminDelivery = () => {
    const [methods, setMethods] = useState<DeliveryMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMethod, setCurrentMethod] = useState<Partial<DeliveryMethod>>({});

    const fetchMethods = async () => {
        try {
            const { data } = await axios.get('/api/delivery/admin');
            setMethods(data);
        } catch (error) {
            showError('Load Error', 'Failed to load delivery methods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentMethod._id) {
                await axios.put(`/api/delivery/${currentMethod._id}`, currentMethod);
                showSuccess('Method Updated', 'Delivery method updated successfully');
            } else {
                await axios.post('/api/delivery', currentMethod);
                showSuccess('Method Created', 'New delivery method added');
            }
            setIsEditing(false);
            fetchMethods();
        } catch (error: any) {
            showError('Save Failed', error.response?.data?.message || 'Failed to save method');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this delivery method?')) {
            try {
                await axios.delete(`/api/delivery/${id}`);
                showSuccess('Deleted', 'Method deleted successfully');
                fetchMethods();
            } catch (error) {
                showError('Delete Failed', 'Could not remove the selected method');
            }
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await axios.put(`/api/delivery/${id}`, { isActive: !isActive });
            fetchMethods();
        } catch (error) {
            showError('Update Failed', 'Failed to toggle status');
        }
    };

    return (
        <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Manage Delivery Options</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => { setCurrentMethod({ price: 0, priceType: 'fixed', iconType: 'Truck', isActive: true }); setIsEditing(true); }}>
                        <Plus size={16} /> Add Method
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>{currentMethod._id ? 'Edit Method' : 'Add New Method'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Title</label>
                                <input value={currentMethod.title || ''} onChange={e => setCurrentMethod({ ...currentMethod, title: e.target.value })} required className="input" placeholder="e.g. Standard Post" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Badge (Optional)</label>
                                <input value={currentMethod.badge || ''} onChange={e => setCurrentMethod({ ...currentMethod, badge: e.target.value })} className="input" placeholder="e.g. ✨ Premium" />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Description</label>
                                <input value={currentMethod.description || ''} onChange={e => setCurrentMethod({ ...currentMethod, description: e.target.value })} required className="input" placeholder="Explanation for customer" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Price</label>
                                <input type="number" value={currentMethod.price || 0} onChange={e => setCurrentMethod({ ...currentMethod, price: Number(e.target.value) })} required className="input" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Price Label Type</label>
                                <select value={currentMethod.priceType || 'fixed'} onChange={e => setCurrentMethod({ ...currentMethod, priceType: e.target.value as any })} className="input">
                                    <option value="fixed">Fixed (e.g. LKR 299)</option>
                                    <option value="from">Dynamic (e.g. From LKR 299)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Icon</label>
                                <select value={currentMethod.iconType || 'Truck'} onChange={e => setCurrentMethod({ ...currentMethod, iconType: e.target.value })} className="input">
                                    <option value="Truck">Truck (Standard)</option>
                                    <option value="Home">Home (Installation)</option>
                                    <option value="Package">Package (Box)</option>
                                    <option value="Zap">Zap (Express)</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <input type="checkbox" checked={currentMethod.isActive !== false} onChange={e => setCurrentMethod({ ...currentMethod, isActive: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <label style={{ fontWeight: 600 }}>Active (Visible to customers)</label>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button type="submit" className="btn btn-primary">Save Method</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '1rem 0', width: '40px' }}>Icon</th>
                                    <th style={{ padding: '1rem 0' }}>Method</th>
                                    <th style={{ padding: '1rem 0' }}>Price</th>
                                    <th style={{ padding: '1rem 0' }}>Status</th>
                                    <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ padding: '1rem 0', textAlign: 'center' }}>Loading...</td></tr>
                                ) : methods.map(m => (
                                    <tr key={m._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0', color: 'var(--primary)' }}>{ICONS[m.iconType] || <Truck size={20} />}</td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {m.title}
                                                {m.badge && <span className="badge badge-secondary" style={{ fontSize: '0.6rem' }}>{m.badge}</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{m.description}</div>
                                        </td>
                                        <td style={{ padding: '1rem 0', fontWeight: 600 }}>
                                            {m.price === 0 ? 'FREE' : `${m.priceType === 'from' ? 'From ' : ''}LKR ${m.price}`}
                                        </td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <button onClick={() => toggleActive(m._id, m.isActive)} className={`badge badge-${m.isActive ? 'success' : 'error'}`} style={{ border: 'none', cursor: 'pointer' }}>
                                                {m.isActive ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                            <button onClick={() => { setCurrentMethod(m); setIsEditing(true); }} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(m._id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--error)' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {methods.length === 0 && !loading && (
                                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No delivery methods configured. Please add one.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
    );
};

export default AdminDelivery;
