import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Ticket, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Promos() {
    const [promos, setPromos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPromos = async () => {
        try {
            const res = await axios.get('/api/promos');
            setPromos(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch promos", error);
            toast.error("Gagal memuat data promo");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus promo ini?')) {
            try {
                await axios.delete(`/api/promos/${id}`);
                setPromos(promos.filter(p => p.id !== id));
                toast.success('Promo berhasil dihapus');
            } catch (error) {
                console.error("Failed to delete promo", error);
                toast.error("Gagal menghapus promo");
            }
        }
    };

    const toggleStatus = async (id) => {
        const promo = promos.find(p => p.id === id);
        const newStatus = !promo.is_active;
        try {
            const res = await axios.put(`/api/promos/${id}`, { is_active: newStatus });
            setPromos(promos.map(p => p.id === id ? res.data : p));
            toast.success('Status promo diperbarui');
        } catch (error) {
            console.error("Failed to toggle status", error);
            toast.error("Gagal mengubah status promo");
        }
    };

    const filteredPromos = promos.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <input
                            type="text"
                            placeholder="Cari promo atau kode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Fetching active campaigns...
                                </td>
                            </tr>
                        ) : filteredPromos.map(promo => (
                            <tr key={promo.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-admin-primary/5 flex items-center justify-center text-admin-primary">
                                            <Ticket size={24} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-admin-primary font-mono text-sm tracking-widest uppercase">{promo.promo_code}</span>
                                            <span className="text-[11px] font-bold text-admin-text-muted uppercase tracking-tight">{promo.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-black text-admin-text-main text-base">
                                        {promo.discount_type === 'percentage' ? (
                                            <span className="flex items-center gap-1">
                                                {promo.discount_value}% <span className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">Off</span>
                                            </span>
                                        ) : formatRupiah(promo.discount_value)}
                                    </div>
                                </td>
                                <td>
                                    <span className="text-xs font-bold text-admin-text-muted">{formatRupiah(promo.min_purchase)}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-bold text-admin-text-muted">
                                        <Calendar size={14} className="text-admin-text-light" />
                                        {new Date(promo.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(promo.id)}
                                        className={`badge-status group cursor-pointer transition-all ${promo.is_active
                                            ? 'bg-success/5 text-success border-success/10 hover:bg-success/10'
                                            : 'bg-danger/5 text-danger border-danger/10 hover:bg-danger/10'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${promo.is_active ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                                        {promo.is_active ? 'Active' : 'Paused'}
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
                        {!isLoading && filteredPromos.length === 0 && (
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
