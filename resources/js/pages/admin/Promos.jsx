import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Ticket, Calendar, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPromos, savePromos, formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Promos() {
    const [promos, setPromos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setPromos(getPromos());
    }, []);

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus promo ini?')) {
            const updated = promos.filter(p => p.id !== id);
            setPromos(updated);
            savePromos(updated);
            toast.success('Promo berhasil dihapus');
        }
    };

    const toggleStatus = (id) => {
        const updated = promos.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p);
        setPromos(updated);
        savePromos(updated);
        toast.success('Status promo diperbarui');
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Promo & Diskon</h1>
                    <p>Kelola kampanye pemasaran, kode kupon, dan strategi diskon operasional.</p>
                </div>
                <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20" onClick={() => navigate('/admin/promos/add')}>
                    <Plus size={18} /> Buat Promo Baru
                </button>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions">
                    <div className="topbar-search !w-full md:!w-96">
                        <Search className="search-icon" size={16} />
                        <input type="text" placeholder="Cari promo atau kode..." />
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Identitas Promo</th>
                            <th>Value Diskon</th>
                            <th>Min. Transaksi</th>
                            <th>Masa Berlaku</th>
                            <th>Status</th>
                            <th>Aksi</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map(promo => (
                            <tr key={promo.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-admin-primary/5 flex items-center justify-center text-admin-primary">
                                            <Ticket size={24} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-admin-primary font-mono text-sm tracking-widest uppercase">{promo.code}</span>
                                            <span className="text-[11px] font-bold text-admin-text-muted uppercase tracking-tight">{promo.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-black text-admin-text-main text-base">
                                        {promo.type === 'percentage' ? (
                                            <span className="flex items-center gap-1">
                                                {promo.discount}% <span className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">Off</span>
                                            </span>
                                        ) : formatRupiah(promo.discount)}
                                    </div>
                                </td>
                                <td>
                                    <span className="text-xs font-bold text-admin-text-muted">{formatRupiah(promo.minPurchase)}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-bold text-admin-text-muted">
                                        <Calendar size={14} className="text-admin-text-light" />
                                        {new Date(promo.expiry).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(promo.id)}
                                        className={`badge-status group cursor-pointer transition-all ${promo.status === 'active'
                                            ? 'bg-success/5 text-success border-success/10 hover:bg-success/10'
                                            : 'bg-danger/5 text-danger border-danger/10 hover:bg-danger/10'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${promo.status === 'active' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                                        {promo.status === 'active' ? 'Active' : 'Paused'}
                                    </button>
                                </td>
                                <td>
                                    <div className="flex justify-start gap-2">
                                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/admin/promos/edit/${promo.id}`)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="btn-icon !text-danger hover:!bg-danger/10" title="Hapus" onClick={() => handleDelete(promo.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promos.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-24 text-center">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-admin-bg flex items-center justify-center mb-6 text-admin-text-light opacity-30">
                                        <Ticket size={40} />
                                    </div>
                                    <p className="text-admin-text-muted font-black uppercase tracking-[0.2em] text-xs">Belum ada promo aktif</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
