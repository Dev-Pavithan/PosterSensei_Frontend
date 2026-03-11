import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Image, MoreHorizontal, Star } from 'lucide-react';
import axios from 'axios';

const emptyForm = { title: '', anime: '', category: 'Posters', price: '', originalPrice: '', discount: '', imageUrl: '', stock: '', description: '', sizes: 'A4,A3,A2', featured: false };

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const fetchProducts = () => {
        axios.get('/api/products?pageSize=50').then(r => setProducts(r.data.products || [])).catch(() => setProducts([])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
    const openEdit = (p: any) => {
        setForm({ title: p.title, anime: p.anime, category: p.category, price: p.price, originalPrice: p.originalPrice || '', discount: p.discount || '', imageUrl: p.imageUrl, stock: p.stock, description: p.description, sizes: (p.sizes || []).join(','), featured: p.featured });
        setEditId(p._id); setShowModal(true); setOpenMenuId(null);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), discount: Number(form.discount), stock: Number(form.stock), sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean) };
        try {
            if (editId) {
                await axios.put(`/api/products/${editId}`, payload);
            } else {
                await axios.post('/api/products', payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            alert('Error saving product. Check console.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await axios.delete(`/api/products/${id}`);
            setProducts(ps => ps.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
        setOpenMenuId(null);
    };

    const toggleFeatured = async (p: any) => {
        try {
            await axios.put(`/api/products/${p._id}`, { featured: !p.featured });
            fetchProducts();
        } catch (err) {
            alert('Failed to update product');
        }
        setOpenMenuId(null);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Manage Products</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{!loading && `${products.length} products`}</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Product</button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['Product', 'Anime', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={7} style={{ padding: '0.75rem 1rem' }}><div className="skeleton" style={{ height: '20px' }} /></td></tr>
                                ))
                            ) : products.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={p.imageUrl} alt="" style={{ width: '44px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: 'var(--surface-2)' }} />
                                            <span style={{ fontWeight: 600 }}>{p.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{p.anime}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-secondary">{p.category}</span></td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>LKR {p.price}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-error'}`}>{p.stock > 0 ? p.stock : 'Out'}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        {p.featured ? <span className="badge badge-primary"><Star size={11} style={{ marginRight: '3px' }} />Yes</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === p._id ? null : p._id); }}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '0.4rem 0.6rem' }}>
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === p._id && (
                                            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '40px', top: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: '160px' }}>
                                                <div style={{ padding: '0.4rem' }}>
                                                    <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                        <Pencil size={14} /> Edit Product
                                                    </button>
                                                    <button onClick={() => toggleFeatured(p)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                        <Star size={14} /> {p.featured ? 'Unfeature' : 'Mark Featured'}
                                                    </button>
                                                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />
                                                    <button onClick={() => handleDelete(p._id)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--error)' }}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products yet. Click "Add Product" to get started.</div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{editId ? 'Edit Product' : 'Add New Product'}</div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { label: 'Title', field: 'title', placeholder: 'e.g. Naruto - Team 7', col: '1/-1' },
                                    { label: 'Anime', field: 'anime', placeholder: 'e.g. Naruto' },
                                    { label: 'Category', field: 'category', placeholder: 'Posters' },
                                    { label: 'Price (LKR)', field: 'price', placeholder: '449', type: 'number' },
                                    { label: 'Original Price (LKR)', field: 'originalPrice', placeholder: '599', type: 'number' },
                                    { label: 'Discount (%)', field: 'discount', placeholder: '25', type: 'number' },
                                    { label: 'Stock', field: 'stock', placeholder: '10', type: 'number' },
                                    { label: 'Sizes (comma separated)', field: 'sizes', placeholder: 'A4,A3,A2' },
                                ].map(({ label, field, placeholder, col, type }) => (
                                    <div key={field} className="input-group" style={col ? { gridColumn: col } : {}}>
                                        <label className="input-label">{label}</label>
                                        <input type={type || 'text'} className="input" placeholder={placeholder} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                                    </div>
                                ))}

                                {/* Image Upload */}
                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="input-label">Product Image</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        {form.imageUrl && (
                                            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <input type="text" className="input" placeholder="Image URL (paste or upload below)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <input type="file" id="image-upload" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setUploadingImage(true);
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    try {
                                                        const { data } = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        setForm(f => ({ ...f, imageUrl: data.imageUrl }));
                                                    } catch (err: any) {
                                                        alert(err.response?.data?.message || 'Image upload failed. Is Cloudinary configured?');
                                                    } finally {
                                                        setUploadingImage(false);
                                                    }
                                                }} />
                                                <label htmlFor="image-upload" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                                                    <Image size={16} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="input-label">Description</label>
                                    <textarea className="input" placeholder="Premium poster details..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                                </div>

                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Featured Product
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving || uploadingImage} className="btn btn-primary"><Save size={15} /> {saving ? 'Saving...' : 'Save Product'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
