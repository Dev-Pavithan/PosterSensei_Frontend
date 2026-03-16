import React, { useEffect, useState } from 'react';
import { Mail, Search, RefreshCw, Trash2, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import { showConfirm, showError, showSuccess } from '../utils/alerts';

const AdminContact = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/contact');
            setMessages(data);
        } catch (err) {
            console.error('Failed to fetch contact messages', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchMessages(); 

        // Listen for real-time "instant" refresh signal from AdminLayout
        const handleRefresh = (e: any) => {
            if (e.detail?.type === 'contact' || !e.detail?.type) {
                fetchMessages();
            }
        };

        window.addEventListener('admin-data-refresh', handleRefresh);
        return () => window.removeEventListener('admin-data-refresh', handleRefresh);
    }, []);

    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    // Deep-linking logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hId = params.get('highlight');
        if (hId) {
            setHighlightedId(hId);
            // Wait for render, then scroll
            setTimeout(() => {
                const el = document.getElementById(`msg-${hId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [window.location.search, messages]);

    const deleteMessage = async (id: string) => {
        const result = await showConfirm('Delete Message?', 'Are you sure you want to delete this inquiry? This action cannot be undone.', 'Delete Forever');
        if (!result.isConfirmed) return;
        
        try {
            await axios.delete(`/api/contact/${id}`);
            setMessages(m => m.filter(msg => msg._id !== id));
            showSuccess('Eliminated', 'The message has been removed from your inbox.');
        } catch (err) {
            showError('Deletion Failed', 'We encountered an error while trying to remove the message.');
        }
    };

    const filteredMessages = messages.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                        Contact Inquiries
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.4rem' }}>
                        {!loading ? `Reviewing ${messages.length} messages` : 'Loading messages...'}
                    </p>
                </div>
                <button onClick={fetchMessages} className="btn-ghost-admin" style={{
                    border: '1px solid var(--border)', width: 'auto', paddingInline: '1.5rem', borderRadius: '16px', background: 'var(--surface)'
                }}>
                    <RefreshCw size={18} /> Refresh Messages
                </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div className="input-icon-wrap" style={{ maxWidth: '400px' }}>
                    <Search size={16} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email or Content"
                        className="input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem', borderRadius: '16px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '24px' }} />
                    ))
                ) : filteredMessages.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <Mail size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No messages found.</p>
                        <p style={{ fontSize: '0.9rem' }}>The inbox is perfectly clean.</p>
                    </div>
                ) : (
                    filteredMessages.map(msg => (
                        <div key={msg._id} id={`msg-${msg._id}`} style={{
                            background: highlightedId === msg._id ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)',
                            border: highlightedId === msg._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            borderRadius: '24px', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: highlightedId === msg._id ? '0 20px 40px -10px rgba(var(--primary-rgb), 0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                            transform: highlightedId === msg._id ? 'scale(1.02)' : 'none'
                        }}
                        onMouseEnter={e => !highlightedId && (e.currentTarget.style.transform = 'translateY(-4px)')}
                        onMouseLeave={e => !highlightedId && (e.currentTarget.style.transform = 'translateY(0)')}>
                            {highlightedId === msg._id && (
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Message Highlighted
                                </div>
                            )}
                            
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>{msg.name}</h3>
                                        <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>{msg.email}</a>
                                    </div>
                                    <button onClick={() => deleteMessage(msg._id)} style={{
                                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex'
                                    }} title="Delete Message">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ padding: '1.5rem', flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    <FileText size={16} /> Message:
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-muted)' }}>{msg.message}</p>
                            </div>

                            <div style={{ background: 'var(--bg)', padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border)' }}>
                                <Calendar size={14} /> Received: {new Date(msg.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminContact;
