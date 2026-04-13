import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Calendar, Tag, Search, Info, ExternalLink, Filter, MoreHorizontal, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/events');
            setEvents(data);
        } catch (error) {
            toast.error('Gagal mengambil data event');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Agenda?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // rose-600
            cancelButtonColor: '#64748b', // slate-500
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#ffffff',
            borderRadius: '1.5rem',
            customClass: {
                title: 'text-sm font-black uppercase tracking-widest text-admin-text-main',
                htmlContainer: 'text-xs font-bold text-admin-text-muted',
                confirmButton: 'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest',
                cancelButton: 'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest'
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/events/${id}`);
                setEvents(events.filter(e => e.id !== id));
                toast.success('Agenda berhasil dihapus');
            } catch (error) {
                toast.error('Gagal menghapus agenda');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' || currentStatus === 1 ? false : true;
        try {
            await axios.put(`/api/events/${id}`, { is_active: newStatus });
            setEvents(events.map(e => e.id === id ? { ...e, is_active: newStatus } : e));
            toast.success(`Event dipindahkan ke ${newStatus ? 'Publish' : 'Draft'}`);
        } catch (error) {
            toast.error('Gagal mengubah status event');
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Manajemen Konten Event</h1>
                    <p>Kelola publikasi agenda kegiatan, pameran, dan penawaran spesial di platform.</p>
                </div>
                <button className="btn-primary py-3 px-6 shadow-xl shadow-admin-primary/20" onClick={() => navigate('/admin/events/add')}>
                    <Plus size={20} /> Buat Agenda Baru
                </button>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <Calendar size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Agenda Aktif</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Cari event atau kategori..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-72"
                            />
                        </div>
                        <button className="p-2.5 rounded-xl bg-admin-bg border border-admin-border text-admin-text-light hover:text-admin-main transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Detail Event</th>
                            <th>Waktu Pelaksanaan</th>
                            <th>Harga</th>
                            <th>Status</th>
                            <th className="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="py-4">
                                        <div className="h-10 bg-admin-bg rounded-xl w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredEvents.map(event => (
                            <tr key={event.id} className="group">
                                <td className="w-28">
                                    <div className="relative w-20 h-14 rounded-2xl overflow-hidden border-2 border-admin-border group-hover:border-admin-primary transition-all shadow-sm">
                                        <img
                                            src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image) || '/images/generated/event.png'}
                                            alt={event.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{event.name}</div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="px-2 py-0.5 rounded-md bg-admin-primary/5 text-admin-primary text-[10px] font-black uppercase tracking-widest border border-admin-primary/10">
                                            {event.category}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary">
                                            <Calendar size={14} />
                                        </div>
                                        {event.date_info}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1">Tarif</span>
                                        <span className="text-sm font-black text-admin-text-main">
                                            {event.price > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(event.price) : 'Gratis / Info'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(event.id, event.is_active)}
                                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 w-fit hover:scale-105 active:scale-95 ${event.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{event.is_active ? 'Publish' : 'Draf'}</span>
                                    </button>
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Modify" onClick={() => navigate(`/admin/events/edit/${event.id}`)}><Edit size={16} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm group/del active:scale-95" title="Hapus" onClick={() => handleDelete(event.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!isLoading && filteredEvents.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <LayoutGrid size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">Agenda tidak ditemukan</h4>
                    </div>
                )}
            </div>
        </div>
    );
}
