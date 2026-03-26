import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Ticket, CalendarDays, ShoppingBag, LayoutGrid, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    const fetchTickets = async () => {
        try {
            const res = await axios.get('/api/tickets');
            setTickets(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            toast.error("Gagal memuat data tiket");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus tiket ini?')) {
            try {
                await axios.delete(`/api/tickets/${id}`);
                setTickets(tickets.filter(t => t.id !== id));
                toast.success('Tiket berhasil dihapus');
            } catch (error) {
                console.error("Failed to delete ticket", error);
                toast.error("Gagal menghapus tiket");
            }
        }
    };

    const toggleStatus = async (id) => {
        const ticket = tickets.find(t => t.id === id);
        const newStatus = !ticket.is_active;
        try {
            const res = await axios.put(`/api/tickets/${id}`, { is_active: newStatus });
            setTickets(tickets.map(t => t.id === id ? res.data : t));
            toast.success(`Tiket ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (error) {
            console.error("Failed to toggle status", error);
            toast.error("Gagal mengubah status tiket");
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Katalog Tiket Wisata</h1>
                    <p>Konfigurasi parameter akses kawasan, struktur harga, dan pengelolaan kuota reservasi harian.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm" onClick={() => navigate('/admin/tickets/orders')}>
                        <ShoppingBag size={18} className="text-admin-primary" /> Order History
                    </button>
                    <button className="btn-primary py-3 px-6 shadow-xl shadow-admin-primary/20" onClick={() => navigate('/admin/tickets/add')}>
                        <Plus size={20} /> Create Ticket
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <Ticket size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Pricing Categories</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Search ticket type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-72"
                            />
                        </div>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ticket Classification</th>
                            <th>Active Validity</th>
                            <th>Entry Rate</th>
                            <th>System Status</th>
                            <th className="text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Syncing ticket catalog...
                                </td>
                            </tr>
                        ) : filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="group">
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="relative group/img w-14 h-14 rounded-2xl bg-admin-bg border border-admin-border overflow-hidden text-admin-primary group-hover:border-admin-primary transition-all shadow-sm flex items-center justify-center flex-shrink-0 cursor-zoom-in"
                                            onClick={() => ticket.image && setPreviewImage(ticket.image)}
                                        >
                                            {ticket.image ? (
                                                <>
                                                    <img src={ticket.image} alt={ticket.name} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                                    <div className="absolute inset-0 bg-admin-primary/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <Eye size={16} />
                                                    </div>
                                                </>
                                            ) : (
                                                <Ticket size={22} />
                                            )}
                                        </div>
                                        <div className="max-w-[280px]">
                                            <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{ticket.name}</div>
                                            <p className="text-[10px] text-admin-text-muted font-bold mt-1 line-clamp-1 italic">"{ticket.description}"</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary text-xs uppercase">
                                            {ticket.validity_day === 'all_days' ? 'ALL' : ticket.validity_day === 'weekend' ? 'WND' : 'WKD'}
                                        </div>
                                        <span className="uppercase tracking-wider">
                                            {ticket.validity_day.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-sm font-black text-admin-primary">{formatRupiah(ticket.price)}</span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(ticket.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            ticket.is_active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                : 'bg-rose-50 text-rose-600 border-rose-200'
                                        }`}
                                    >
                                        {ticket.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2.5 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted hover:text-admin-primary hover:border-admin-primary transition-all shadow-sm" onClick={() => navigate(`/admin/tickets/edit/${ticket.id}`)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2.5 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm" onClick={() => handleDelete(ticket.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!isLoading && filteredTickets.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <LayoutGrid size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">No matching ticket types found</h4>
                    </div>
                )}
            </div>

            {/* Premium Image Lightbox Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
                    <div 
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out"
                        onClick={() => setPreviewImage(null)}
                    />
                    
                    <div className="relative max-w-5xl w-full max-h-[85vh] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl animate-scale-up border-[8px] border-white/20 text-left">
                        <button 
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/20"
                        >
                            <X size={20} />
                        </button>
                        
                        <img src={previewImage} alt="Ticket Preview" className="w-full h-full object-contain bg-slate-100" />
                        
                        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">High Resolution Media</p>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tight">Ticket Category Preview</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
