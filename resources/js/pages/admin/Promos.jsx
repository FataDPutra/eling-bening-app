import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Ticket, Calendar, Percent, CheckCircle, ShoppingBag, LayoutGrid, Tag, Info, X, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { formatRupiah } from '../../utils/data';

export default function Promos() {
    const navigate = useNavigate();
    const [promos, setPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showStatsModal, setShowStatsModal] = useState(false);

    const fetchPromos = async () => {
        try {
            const res = await axios.get('/api/promos');
            setPromos(res.data);
            setIsLoading(false);
        } catch (error) {
            toast.error('Gagal memuat data promo');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const stats = useMemo(() => {
        if (!promos.length) return null;
        return {
            totalRedemptions: promos.reduce((acc, p) => acc + (p.used_count || 0), 0),
            totalDiscountGiven: promos.reduce((acc, p) => acc + Number(p.transactions_sum_discount_amount || 0), 0),
            activePromos: promos.filter(p => p.is_active).length,
            topPromos: [...promos].sort((a, b) => (b.used_count || 0) - (a.used_count || 0)).slice(0, 3)
        };
    }, [promos]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Promo?',
            text: 'Data promo yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-[2rem]' }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/promos/${id}`);
                toast.success('Promo berhasil dihapus');
                fetchPromos();
            } catch (error) {
                toast.error('Gagal menghapus promo');
            }
        }
    };

    const toggleStatus = async (id) => {
        const promo = promos.find(p => p.id === id);
        const newStatus = !promo.is_active;
        try {
            const res = await axios.put(`/api/promos/${id}`, { is_active: newStatus });
            setPromos(promos.map(p => p.id === id ? res.data : p));
            toast.success(`Promo ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (error) {
            toast.error("Gagal mengubah status promo");
        }
    };

    const filteredPromos = promos.filter(p => 
        p.promo_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            <div className="admin-page-header">
                <div>
                    <h1>Registry Kampanye & Promo</h1>
                    <p>Manajemen kupon diskon, strategi penetapan harga dinamis, dan kontrol validasi reservasi.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowStatsModal(true)}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                    >
                        <ShoppingBag size={18} className="text-admin-primary" /> Campaign Stats
                    </button>
                    <button className="btn-primary py-3 px-6 shadow-xl shadow-admin-primary/20" onClick={() => navigate('/admin/promos/add')}>
                        <Plus size={20} /> Create Voucher
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <Tag size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Pricing Incentives</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Search by code/name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-72"
                            />
                        </div>
                    </div>
                </div>

                <table className="admin-table w-full">
                    <thead>
                        <tr>
                            <th className="py-5 px-6 whitespace-nowrap text-left" style={{ width: '22%' }}>Voucher Identity</th>
                            <th className="py-5 px-6 whitespace-nowrap text-left" style={{ width: '12%' }}>Market Scope</th>
                            <th className="py-5 px-6 whitespace-nowrap text-left" style={{ width: '14%' }}>Benefit Value</th>
                            <th className="py-5 px-6 whitespace-nowrap text-left" style={{ width: '18%' }}>Active Timeline</th>
                            <th className="py-5 px-6 whitespace-nowrap text-center" style={{ width: '12%' }}>System Status</th>
                            <th className="py-5 px-6 whitespace-nowrap text-left" style={{ width: '15%' }}>Usage Quota</th>
                            <th className="py-5 px-6 whitespace-nowrap text-right" style={{ width: '7%' }}>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Auditing promotional registry...
                                </td>
                            </tr>
                        ) : filteredPromos.map(promo => (
                            <tr key={promo.id} className="group">
                                <td className="px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary group-hover:border-admin-primary transition-all shadow-sm shrink-0">
                                            <Ticket size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-admin-text-main text-sm uppercase tracking-tight truncate">{promo.promo_code}</div>
                                            <div className="text-[10px] text-admin-text-muted font-bold mt-0.5 line-clamp-1 italic">"{promo.name}"</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6">
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                        <div className={`w-7 h-7 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-[10px] font-black ${
                                            promo.applicable_to === 'ALL' ? 'text-indigo-500' : 
                                            promo.applicable_to === 'RESORT' ? 'text-amber-500' : 
                                            'text-emerald-500'
                                        }`}>
                                            {promo.applicable_to === 'ALL' ? 'UNV' : promo.applicable_to === 'RESORT' ? 'RST' : 'TCK'}
                                        </div>
                                        <span className="uppercase tracking-wider text-[10px]">
                                            {promo.applicable_to === 'ALL' ? 'Universal' : promo.applicable_to}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-admin-primary">
                                            {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `-${(Number(promo.discount_value) / 1000).toFixed(0)}K IDR`}
                                        </span>
                                        <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest">Min: {Number(promo.min_purchase).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-admin-text-muted uppercase tracking-tighter">
                                        <span className="text-admin-text-light">{new Date(promo.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                        <span className="text-admin-primary/30">/</span>
                                        <span>{new Date(promo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </td>
                                <td className="px-6 text-center">
                                    <button
                                        onClick={() => toggleStatus(promo.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                            promo.is_active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-200'
                                        }`}
                                    >
                                        {promo.is_active ? 'Active' : 'Paused'}
                                    </button>
                                </td>
                                <td className="px-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col text-[8px] font-black uppercase tracking-[0.15em] leading-tight space-y-0.5">
                                            <span className="text-admin-text-muted">{promo.used_count || 0} REDEEMED</span>
                                            <span className="text-admin-primary">{promo.usage_limit ? `LIMIT: ${promo.usage_limit}` : 'UNLIMITED'}</span>
                                        </div>
                                        {promo.usage_limit && (
                                            <div className="w-full h-1.5 bg-admin-bg border border-admin-border rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${
                                                        (promo.used_count / promo.usage_limit) > 0.9 ? 'bg-rose-500' : 
                                                        (promo.used_count / promo.usage_limit) > 0.7 ? 'bg-amber-500' : 'bg-admin-primary'
                                                    }`}
                                                    style={{ width: `${Math.min(100, (promo.used_count / promo.usage_limit) * 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <button className="p-2 rounded-lg bg-admin-bg border border-admin-border text-admin-text-muted hover:text-admin-primary hover:border-admin-primary transition-all shadow-sm" onClick={() => navigate(`/admin/promos/edit/${promo.id}`)}>
                                            <Edit size={14} />
                                        </button>
                                        <button className="p-2 rounded-lg bg-admin-bg border border-admin-border text-admin-text-muted hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm" onClick={() => handleDelete(promo.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPromos.length === 0 && !isLoading && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <LayoutGrid size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">No matching campaigns found</h4>
                    </div>
                )}
            </div>

            {/* Campaign Stats Modal */}
            {showStatsModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowStatsModal(false)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-scale-up overflow-hidden border border-white" onClick={e => e.stopPropagation()}>
                        <div className="bg-admin-bg p-8 border-b border-admin-border flex justify-between items-center bg-gradient-to-br from-admin-bg to-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-admin-primary text-white rounded-2xl shadow-lg shadow-admin-primary/20">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-admin-text-main uppercase tracking-tight">Campaign Analytics</h2>
                                    <p className="text-xs text-admin-text-muted font-bold uppercase tracking-widest">Performance Dashboard</p>
                                </div>
                            </div>
                            <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-admin-bg rounded-xl transition-colors"><X /></button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4"><Users size={20}/></div>
                                    <div className="text-2xl font-black text-indigo-600">{stats?.totalRedemptions}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Usage</div>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4"><DollarSign size={20}/></div>
                                    <div className="text-xl font-black text-emerald-600 leading-tight tracking-tighter">{formatRupiah(stats?.totalDiscountGiven)}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Discount Given</div>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4"><Award size={20}/></div>
                                    <div className="text-2xl font-black text-amber-600">{stats?.activePromos}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live Campaigns</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Most Redeemed Vouchers</h3>
                                <div className="space-y-3">
                                    {stats?.topPromos.map((p, idx) => (
                                        <div key={p.id} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-admin-bg flex items-center justify-center font-black text-sm text-admin-primary group-hover:bg-admin-primary group-hover:text-white transition-colors border border-admin-border group-hover:border-admin-primary">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{p.promo_code}</div>
                                                    <div className="text-[10px] text-admin-text-muted font-bold">{p.name}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-admin-text-main">{p.used_count || 0}</div>
                                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Redemptions</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-admin-primary/5 rounded-[2rem] border border-admin-primary/10 flex items-start gap-4">
                                <Info className="text-admin-primary shrink-0" size={18} />
                                <p className="text-[11px] text-admin-text-muted leading-relaxed font-bold italic shadow-sm">
                                    Analytics ini diupdate setiap kali transaksi diselesaikan. Gunakan data ini untuk mengevaluasi strategi kampanye Anda bulan depan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 bg-white/50 border border-admin-border rounded-[2.5rem] flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-admin-primary/10 text-admin-primary">
                    <Info size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-admin-text-main uppercase tracking-widest mb-2">Campaign Protocol</h4>
                    <p className="text-xs text-admin-text-muted leading-relaxed font-medium">
                        Pastikan tanggal kedaluwarsa selalu terpantau. Promo yang sudah melewati batas waktu akan otomatis tidak valid pada sistem checkout guest meskipun statusnya masih 'Active'. Gunakan tombol status untuk memberhentikan kampanye secara manual.
                    </p>
                </div>
            </div>
        </div>
    );
}
