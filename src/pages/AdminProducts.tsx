import React, { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, MoreHorizontal, Star, Eye, Upload, CloudLightning, Info, Layout, Tag, DollarSign, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [viewProduct, setViewProduct] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = () => {
        setLoading(true);
        axios.get(`/api/products?page=${page}&pageSize=${pageSize}`)
            .then(r => {
                setProducts(r.data.products || []);
                setTotalProducts(r.data.totalProducts || r.data.products?.length || 0);
                setTotalPages(r.data.totalPages || Math.ceil((r.data.totalProducts || r.data.products?.length) / pageSize) || 1);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, [page, pageSize]);

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
        if (!form.title || !form.imageUrl) {
            alert('Title and Image are required!');
            return;
        }
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

    // Drag and Drop Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, etc)');
            return;
        }
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(f => ({ ...f, imageUrl: data.imageUrl }));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Image upload failed. Is Cloudinary configured?');
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            {/* Header section with Bento Stats */}
            <div style={{ marginBottom: '3rem' }}>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            letterSpacing: '-0.5px'
                        }}>
                            Product Arsenal
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.4rem', lineHeight: 1.4 }}>
                            Design, refine, and deploy your master collection.
                        </p>
                    </div>
                    <button onClick={openAdd} className="btn btn-primary" style={{
                        padding: '1rem 2rem',
                        borderRadius: '18px',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb), 0.4)',
                        width: 'auto',
                        minWidth: 'fit-content'
                    }}>
                        <Plus size={20} /> Create New Masterpiece
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '1.5rem'
                }}>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layout size={28} /></div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inventory</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{products.length} Items</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={28} /></div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Featured Art</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{products.filter(p => p.featured).length} Active</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={28} /></div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Depleted Stock</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{products.filter(p => p.stock === 0).length} Sold Out</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Table Container */}
            <div style={{
                background: 'rgba(var(--surface-rgb), 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
                marginBottom: '2rem'
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
                        minWidth: '800px' // Ensure table doesn't squish too much
                    }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                {['Product', 'Anime & Category', 'Price', 'Stock Status', 'Featured', 'Actions'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '1rem 1.5rem',
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: 'var(--text-muted)',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td colSpan={6} style={{ padding: '1.25rem 1.5rem' }}>
                                            <div className="skeleton" style={{ height: '32px', borderRadius: '8px' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : products.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '52px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                                <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.title}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {p._id.slice(-8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{p.anime}</span>
                                            <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>LKR {p.price.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {p.stock > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.stock} in stock</span>
                                            </div>
                                        ) : (
                                            <span className="badge badge-error">Sold Out</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div onClick={() => toggleFeatured(p)} style={{ cursor: 'pointer' }}>
                                            {p.featured ? <Star size={20} fill="#f59e0b" color="#f59e0b" /> : <Star size={20} color="var(--border)" />}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', position: 'relative' }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === p._id ? null : p._id); }}
                                            className="btn-ghost-admin"
                                            style={{ width: '40px', height: '40px', borderRadius: '12px', justifyContent: 'center' }}>
                                            <MoreHorizontal size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {openMenuId === p._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    onClick={e => e.stopPropagation()}
                                                    className="admin-actions-menu"
                                                    style={{
                                                        position: 'absolute',
                                                        right: window.innerWidth < 768 ? '40px' : '100%',
                                                        top: window.innerWidth < 768 ? '100%' : '50%',
                                                        transform: window.innerWidth < 768 ? 'none' : 'translateY(-50%)',
                                                        marginRight: window.innerWidth < 768 ? '0' : '0.75rem',
                                                        marginTop: window.innerWidth < 768 ? '0.5rem' : '0',
                                                        background: 'var(--surface)',
                                                        backdropFilter: 'blur(20px)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '20px',
                                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                                        zIndex: 2000,
                                                        minWidth: '200px',
                                                        overflow: 'hidden',
                                                        padding: '0.5rem'
                                                    } as any}
                                                >
                                                    <div style={{ padding: '0.5rem' }}>
                                                        <button onClick={() => setViewProduct(p)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.6rem 0.8rem' }}>
                                                            <Eye size={16} /> View Profile
                                                        </button>
                                                        <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.6rem 0.8rem' }}>
                                                            <Pencil size={16} /> Edit Attributes
                                                        </button>
                                                        <div style={{ borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />
                                                        <button onClick={() => handleDelete(p._id)} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.6rem 0.8rem', color: 'var(--error)' }}>
                                                            <Trash2 size={16} /> Delete Forever
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    {!loading && products.length > 0 && (
                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface-2)', }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show</span>
                                <select
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem 0.8rem', color: 'var(--text-primary)', fontWeight: 700, outline: 'none' }}
                                >
                                    {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} entries</option>)}
                                </select>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>of {totalProducts} items</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="btn-ghost-admin"
                                    style={{ width: '40px', height: '40px', borderRadius: '12px', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}
                                >
                                    <CloudLightning size={18} style={{ transform: 'rotate(90deg)' }} />
                                </button>

                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        // Simple logic to show current, first, last, and neighbors
                                        if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                                            if (p === 2 || p === totalPages - 1) return <span key={p} style={{ padding: '0 0.5rem', color: 'var(--text-muted)' }}>...</span>;
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                                                    background: page === p ? 'var(--primary)' : 'transparent',
                                                    color: page === p ? 'white' : 'var(--text-primary)',
                                                    fontWeight: 800, cursor: 'pointer', transition: '0.2s'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="btn-ghost-admin"
                                    style={{ width: '40px', height: '40px', borderRadius: '12px', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}
                                >
                                    <CloudLightning size={18} style={{ transform: 'rotate(-90deg)' }} />
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                            <Box size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>No products found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Get started by creating your first premium anime poster.</p>
                            <button onClick={openAdd} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Add First Product</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Redesigned Modal with Drag and Drop */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ background: 'var(--surface)', borderRadius: '32px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>

                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        {editId ? <Pencil size={20} /> : <Plus size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{editId ? 'Refine Product' : 'Create New Poster'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{editId ? `Editing: ${form.title}` : 'Adding to your masterpiece collection'}</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="theme-toggle" style={{ width: '36px', height: '36px' }}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', overflow: 'hidden', flex: 1 }}>

                                {/* Image Upload Sidebar */}
                                <div style={{ background: 'var(--surface-2)', padding: '2rem', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                                    <label className="input-label" style={{ marginBottom: '1rem', display: 'block' }}>Product Visualization</label>

                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            background: dragActive ? 'var(--primary-light)' : 'var(--surface)',
                                            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            padding: '1.5rem',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploadingImage ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>Uploading...</span>
                                            </div>
                                        ) : form.imageUrl ? (
                                            <>
                                                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '0.5rem' }}>
                                                        <Upload size={24} />
                                                        <span style={{ fontWeight: 700 }}>Replace Image</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                                    <ImageIcon size={28} />
                                                </div>
                                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Drag & Drop</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>or click to browse artwork</div>
                                            </>
                                        )}
                                        <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept="image/*" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} />
                                    </div>

                                    <div style={{ marginTop: '1.5rem' }}>
                                        <label className="input-label">Direct Asset URL</label>
                                        <input type="text" className="input" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }} />
                                    </div>

                                    <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            <Info size={16} /> Pro Tip
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            High-quality vertical posters (2:3 aspect ratio) look best in your gallery. PNG or WebP recommended.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Area */}
                                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                        {/* Basic Details Group */}
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                                <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }} />
                                                <h4 style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Information</h4>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                                                    <label className="input-label"><Tag size={12} style={{ marginRight: '4px' }} /> Product Title</label>
                                                    <input className="input" placeholder="e.g. Solo Leveling - Sung Jinwoo Shadow Monarch" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label"><CloudLightning size={12} style={{ marginRight: '4px' }} /> Anime/Series</label>
                                                    <input className="input" placeholder="e.g. Solo Leveling" value={form.anime} onChange={e => setForm(f => ({ ...f, anime: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Classification</label>
                                                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                                        {['Posters', 'Stickers', 'Wallpapers', 'Custom Art'].map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Pricing and Inventory */}
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                                <div style={{ width: '4px', height: '18px', background: 'var(--secondary)', borderRadius: '2px' }} />
                                                <h4 style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory & Pricing</h4>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                                                <div className="input-group">
                                                    <label className="input-label"><DollarSign size={12} style={{ marginRight: '4px' }} /> Sale Price</label>
                                                    <input type="number" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">MSRP (Strike)</label>
                                                    <input type="number" className="input" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Off %</label>
                                                    <input type="number" className="input" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label"><Box size={12} style={{ marginRight: '4px' }} /> Stock Units</label>
                                                    <input type="number" className="input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                                                </div>
                                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="input-label">Available Dimensions</label>
                                                    <input className="input" placeholder="A4, A3, A2, A1, Custom" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Description and Traits */}
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                                <div style={{ width: '4px', height: '18px', background: 'var(--accent)', borderRadius: '2px' }} />
                                                <h4 style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description & Highlights</h4>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                                <textarea className="input" placeholder="Tell the story behind this artwork..." rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: form.featured ? 'var(--primary-light)' : 'var(--surface-2)', borderRadius: '16px', border: `2px solid ${form.featured ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', transition: '0.2s' }}>
                                                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: form.featured ? 'var(--primary)' : 'inherit' }}>Feature this product</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pinned to homepage and top of discovery results</div>
                                                </div>
                                            </label>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: 'var(--surface)' }}>
                                <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ borderRadius: '14px', paddingInline: '2rem' }}>Discard Changes</button>
                                <button onClick={handleSave} disabled={saving || uploadingImage} className="btn btn-primary btn-lg" style={{ borderRadius: '14px', minWidth: '180px' }}>
                                    {saving ? 'Publishing...' : <><Save size={18} /> {editId ? 'Commit Updates' : 'Publish Product'}</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail View Modal */}
            <AnimatePresence>
                {viewProduct && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ background: 'var(--surface)', borderRadius: '32px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Eye size={22} className="text-primary" /> Master Data View
                                </div>
                                <button onClick={() => setViewProduct(null)} className="theme-toggle"><X size={20} /></button>
                            </div>

                            <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: '-1rem', background: 'var(--bg)', borderRadius: '32px', zIndex: -1 }} />
                                        <img src={viewProduct.imageUrl} alt={viewProduct.title} style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', background: 'white', padding: '1rem' }} />
                                    </div>
                                    <div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {viewProduct.anime} <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} /> {viewProduct.category}
                                            </div>
                                            <h3 style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>{viewProduct.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>LKR {viewProduct.price.toLocaleString()}</div>
                                                {viewProduct.originalPrice > viewProduct.price && (
                                                    <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>LKR {viewProduct.originalPrice.toLocaleString()}</div>
                                                )}
                                                {viewProduct.discount > 0 && <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>{viewProduct.discount}% REDUCTION</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                                            <div style={{ background: 'var(--surface-2)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Asset Integrity</div>
                                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: viewProduct.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                                                    {viewProduct.stock > 0 ? `${viewProduct.stock} Managed Units` : 'Stock Depleted'}
                                                </div>
                                            </div>
                                            <div style={{ background: 'var(--surface-2)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Storefront Status</div>
                                                <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{viewProduct.featured ? 'Priority Feature' : 'Standard Grid'}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Info size={16} className="text-primary" /> Editorial Description
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px' }}>
                                                {viewProduct.description || 'Our master curators are still crafting the perfect description for this epic piece.'}
                                            </p>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.75rem' }}>Available Dimensions</div>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {(viewProduct.sizes || []).map((s: string) => (
                                                    <span key={s} style={{ padding: '0.5rem 1.25rem', background: 'white', border: '2px solid var(--primary-light)', color: 'var(--primary)', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: 'var(--surface-2)' }}>
                                <button onClick={() => setViewProduct(null)} className="btn btn-ghost" style={{ border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)' }}>Close</button>
                                <button onClick={() => { setViewProduct(null); openEdit(viewProduct); }} className="btn btn-primary" style={{ borderRadius: '14px' }}><Pencil size={16} /> Edit Attributes</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
