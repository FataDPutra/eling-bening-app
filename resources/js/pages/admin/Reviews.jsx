import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Star, Eye, EyeOff, Search, MessageSquare,
    RefreshCw, X, Image, ChevronDown, Users, ThumbsUp, ThumbsDown, Sparkles, Info, Calendar, ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const StarRating = ({ rating, size = 14 }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={size}
                className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
        ))}
    </div>
);

function ReviewDetailPortal({ review, onClose, onToggle }) {
    if (!review) return null;
    return createPortal(
        <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            />
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative z-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-scale-up border border-white/20 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-admin-bg to-white px-8 py-6 border-b border-admin-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-admin-primary/10 flex items-center justify-center text-admin-primary font-black text-lg border border-admin-border">
                            {review.user_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <div className="font-black text-admin-text-main text-base uppercase tracking-tight">{review.user_name}</div>
                            <div className="text-[10px] text-admin-text-muted font-bold">{review.user_email}</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-8 space-y-6">
                    {/* Rating & Meta */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col items-center gap-2">
                            <StarRating rating={review.rating} size={18} />
                            <span className="text-2xl font-black text-amber-500">{review.rating}<span className="text-sm text-amber-400">/5</span></span>
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Rating</span>
                        </div>
                        <div className="p-5 bg-admin-bg border border-admin-border rounded-3xl flex flex-col items-center gap-2">
                            <ShoppingBag size={20} className="text-admin-primary" />
                            <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">{review.booking_type}</span>
                            <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest">Tipe Booking</span>
                        </div>
                        <div className="p-5 bg-admin-bg border border-admin-border rounded-3xl flex flex-col items-center gap-2">
                            <Calendar size={20} className="text-admin-primary" />
                            <span className="text-[11px] font-black text-admin-text-main text-center leading-tight">{review.created_at}</span>
                            <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest">Tanggal</span>
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="flex items-center gap-3 p-4 bg-admin-bg border border-admin-border rounded-2xl">
                        <Info size={16} className="text-admin-primary shrink-0" />
                        <div>
                            <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest">ID Transaksi</span>
                            <p className="text-sm font-black text-admin-text-main">{review.transaction_id}</p>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={12} /> Komentar
                        </h4>
                        <p className="text-sm text-admin-text-main leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl p-5 italic">
                            "{review.comment}"
                        </p>
                    </div>

                    {/* Media */}
                    {review.media?.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
                                <Image size={12} /> Media Ulasan ({review.media.length})
                            </h4>
                            <div className={`grid gap-4 ${review.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {review.media.map((src, i) => (
                                    src.match(/\.(mp4|mov)$/i)
                                        ? <video key={i} src={src} controls className="w-full rounded-2xl object-cover max-h-72" />
                                        : (
                                            <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={src} alt={`Media ${i + 1}`}
                                                    className="w-full rounded-2xl object-cover max-h-72 border border-admin-border hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                                                />
                                            </a>
                                        )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status & Action */}
                    <div className="pt-4 border-t border-admin-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                review.is_visible
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-rose-50 text-rose-500 border-rose-200'
                            }`}>
                                {review.is_visible ? '● Ditampilkan di Publik' : '● Disembunyikan'}
                            </span>
                        </div>
                        <button
                            onClick={() => { onToggle(review.id); onClose(); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                                review.is_visible
                                    ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                            }`}
                        >
                            {review.is_visible ? <><EyeOff size={14} /> Sembunyikan</> : <><Eye size={14} /> Tampilkan</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [filterVisible, setFilterVisible] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [bulkRating, setBulkRating] = useState('');
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/admin/reviews');
            setReviews(res.data);
        } catch {
            toast.error('Gagal memuat data ulasan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleToggle = async (id) => {
        try {
            const res = await axios.patch(`/api/admin/reviews/${id}/visibility`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, is_visible: res.data.is_visible } : r));
            if (selectedReview?.id === id) setSelectedReview(prev => ({ ...prev, is_visible: res.data.is_visible }));
            toast.success(res.data.is_visible ? 'Ulasan ditampilkan' : 'Ulasan disembunyikan');
        } catch {
            toast.error('Gagal mengubah visibilitas');
        }
    };

    const handleBulkVisibility = async (isVisible) => {
        if (!bulkRating) { toast.error('Pilih opsi bintang terlebih dahulu'); return; }
        
        const { rating, op } = JSON.parse(bulkRating);
        const ratingText = op === '>=' ? `${rating} ke atas` : rating;

        const result = await Swal.fire({
            title: `${isVisible ? 'Tampilkan' : 'Sembunyikan'} Bintang ${ratingText}?`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: isVisible ? '#16a34a' : '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: `Ya, lanjutkan!`, cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-[2rem]' }
        });
        if (!result.isConfirmed) return;
        setIsBulkLoading(true);
        try {
            const res = await axios.post('/api/admin/reviews/bulk-visibility', { rating, operator: op, is_visible: isVisible });
            toast.success(res.data.message);
            fetchReviews();
        } catch { toast.error('Gagal memperbarui ulasan'); }
        finally { setIsBulkLoading(false); }
    };

    const stats = useMemo(() => {
        const total = reviews.length;
        const visible = reviews.filter(r => r.is_visible).length;
        const avgRating = total ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : 0;
        const byRating = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length, visible: reviews.filter(r => r.rating === s && r.is_visible).length }));
        return { total, visible, hidden: total - visible, avgRating, byRating };
    }, [reviews]);

    const filtered = useMemo(() => reviews.filter(r => {
        const matchRating = filterRating ? r.rating === parseInt(filterRating) : true;
        const matchVisible = filterVisible !== '' ? (r.is_visible === (filterVisible === '1')) : true;
        const matchSearch = searchTerm ? r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        return matchRating && matchVisible && matchSearch;
    }), [reviews, filterRating, filterVisible, searchTerm]);

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            <div className="admin-page-header">
                <div>
                    <h1>Manajemen Ulasan</h1>
                    <p>Kelola ulasan tamu — pilih mana yang tampil di halaman publik secara manual atau massal.</p>
                </div>
                <button onClick={fetchReviews} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm">
                    <RefreshCw size={16} className="text-admin-primary" /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Ulasan', val: stats.total, icon: Users, color: 'indigo' },
                    { label: 'Ditampilkan', val: stats.visible, icon: Eye, color: 'emerald' },
                    { label: 'Disembunyikan', val: stats.hidden, icon: EyeOff, color: 'rose' },
                    { label: 'Rata-rata Rating', val: stats.avgRating, icon: Star, color: 'amber' },
                ].map(({ label, val, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-[1.5rem] border border-admin-border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-500`}><Icon size={20} /></div>
                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">{label}</span>
                        </div>
                        <div className={`text-3xl font-black text-${color}-${color === 'emerald' ? '600' : color === 'rose' ? '500' : color === 'amber' ? '500' : 'text-admin-text-main'}`}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Bulk Action */}
            <div className="bg-white rounded-[1.5rem] border border-admin-border p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary"><Sparkles size={18} /></div>
                        <div>
                            <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Aksi Massal per Rating</h3>
                            <p className="text-[10px] text-admin-text-muted font-bold mt-0.5">Tampilkan atau sembunyikan semua ulasan berdasarkan bintang sekaligus.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 ml-auto">
                        <div className="relative">
                            <select value={bulkRating} onChange={e => setBulkRating(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-black text-admin-text-main focus:outline-none focus:border-admin-primary appearance-none cursor-pointer">
                                <option value="">Pilih Filter Rating</option>
                                <option value='{"rating":5,"op":"="}'>⭐⭐⭐⭐⭐ — Hanya Bintang 5</option>
                                <option value='{"rating":4,"op":">="}'>⭐⭐⭐⭐ — Bintang 4 ke Atas</option>
                                <option value='{"rating":4,"op":"="}'>⭐⭐⭐⭐ — Hanya Bintang 4</option>
                                <option value='{"rating":3,"op":">="}'>⭐⭐⭐ — Bintang 3 ke Atas</option>
                                <option value='{"rating":3,"op":"="}'>⭐⭐⭐ — Hanya Bintang 3</option>
                                <option value='{"rating":2,"op":">="}'>⭐⭐ — Bintang 2 ke Atas</option>
                                <option value='{"rating":2,"op":"="}'>⭐⭐ — Hanya Bintang 2</option>
                                <option value='{"rating":1,"op":">="}'>⭐ — Semua Bintang (1 ke Atas)</option>
                                <option value='{"rating":1,"op":"="}'>⭐ — Hanya Bintang 1</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
                        </div>
                        <button onClick={() => handleBulkVisibility(true)} disabled={isBulkLoading || !bulkRating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                            <ThumbsUp size={14} /> Tampilkan Semua
                        </button>
                        <button onClick={() => handleBulkVisibility(false)} disabled={isBulkLoading || !bulkRating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                            <ThumbsDown size={14} /> Sembunyikan Semua
                        </button>
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-5 gap-2">
                    {stats.byRating.map(b => (
                        <div key={b.star} className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /><span className="text-[10px] font-black text-admin-text-muted">{b.star}</span></div>
                            <div className="w-full h-2 bg-admin-bg border border-admin-border rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: stats.total ? `${(b.count / stats.total) * 100}%` : '0%' }} />
                            </div>
                            <div className="text-[9px] font-black text-admin-text-muted">{b.visible}<span className="text-admin-text-light">/{b.count}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary"><MessageSquare size={18} /></div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Semua Ulasan</h3>
                        <span className="px-2 py-0.5 rounded-full bg-admin-bg border border-admin-border text-[10px] font-black text-admin-text-muted">{filtered.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={14} />
                            <input type="text" placeholder="Cari nama atau komentar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary w-52 transition-all" />
                        </div>
                        <div className="relative">
                            <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
                                className="pl-4 pr-8 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-black text-admin-text-main focus:outline-none focus:border-admin-primary appearance-none cursor-pointer">
                                <option value="">Semua Rating</option>
                                {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{'★'.repeat(s)}</option>)}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select value={filterVisible} onChange={e => setFilterVisible(e.target.value)}
                                className="pl-4 pr-8 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-black text-admin-text-main focus:outline-none focus:border-admin-primary appearance-none cursor-pointer">
                                <option value="">Semua Status</option>
                                <option value="1">Ditampilkan</option>
                                <option value="0">Disembunyikan</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table w-full">
                        <thead>
                            <tr>
                                <th className="py-5 px-4 text-left" style={{ width: '20%' }}>Pengguna</th>
                                <th className="py-5 px-4 text-left" style={{ width: '10%' }}>Rating</th>
                                <th className="py-5 px-4 text-left" style={{ width: '33%' }}>Komentar</th>
                                <th className="py-5 px-4 text-left" style={{ width: '9%' }}>Tipe</th>
                                <th className="py-5 px-4 text-center" style={{ width: '10%' }}>Status</th>
                                <th className="py-5 px-4 text-center" style={{ width: '18%' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="py-24 text-center text-admin-text-muted font-bold animate-pulse text-xs uppercase tracking-widest">Memuat ulasan...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-admin-bg rounded-[2rem] flex items-center justify-center text-admin-text-light/30"><MessageSquare size={32} /></div>
                                        <p className="text-xs font-black text-admin-text-muted uppercase tracking-widest">Tidak ada ulasan ditemukan</p>
                                    </div>
                                </td></tr>
                            ) : filtered.map(review => (
                                <tr key={review.id} className="group">
                                    <td className="px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-admin-primary/10 flex items-center justify-center text-admin-primary font-black text-sm shrink-0 border border-admin-border">
                                                {review.user_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-admin-text-main text-xs truncate">{review.user_name}</div>
                                                <div className="text-[9px] text-admin-text-muted font-bold truncate">{review.user_email}</div>
                                                <div className="text-[9px] text-admin-text-light font-bold">{review.created_at_diff}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4">
                                        <div className="flex flex-col gap-1">
                                            <StarRating rating={review.rating} />
                                            <span className="text-[9px] font-black text-amber-500">{review.rating}/5</span>
                                        </div>
                                    </td>
                                    <td className="px-4">
                                        <p className="text-xs text-admin-text-main line-clamp-2 leading-relaxed">{review.comment}</p>
                                        {review.media?.length > 0 && (
                                            <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-black text-admin-primary">
                                                <Image size={10} /> {review.media.length} Media
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4">
                                        <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            review.booking_type === 'RESORT' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            review.booking_type === 'EVENT'  ? 'bg-violet-50 text-violet-600 border-violet-200' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>{review.booking_type}</span>
                                    </td>
                                    <td className="px-4 text-center">
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            review.is_visible ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-500 border-rose-200'
                                        }`}>{review.is_visible ? 'Tampil' : 'Tersembunyi'}</span>
                                    </td>
                                    <td className="px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Detail Button */}
                                            <button
                                                onClick={() => setSelectedReview(review)}
                                                className="w-8 h-8 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {/* Toggle Button */}
                                            <button
                                                onClick={() => handleToggle(review.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                                                    review.is_visible
                                                        ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                                }`}
                                            >
                                                {review.is_visible ? <><EyeOff size={11} /> Sembunyikan</> : <><Eye size={11} /> Tampilkan</>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal via React Portal */}
            <ReviewDetailPortal
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
                onToggle={handleToggle}
            />
        </div>
    );
}
