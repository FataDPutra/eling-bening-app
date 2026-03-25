import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Ticket, CalendarDays, ShoppingBag, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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
                                        <div className="p-3.5 rounded-2xl bg-admin-bg border border-admin-border text-admin-primary group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all shadow-sm">
                                            <Ticket size={22} />
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
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-admin-primary">{formatRupiah(ticket.price)}</span>
                                        <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Fixed Rate</span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatus(ticket.id)}
                                        className={`badge-status cursor-pointer transition-all hover:scale-105 ${ticket.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${ticket.is_active ? 'bg-success' : 'bg-warning'}`} />
                                        {ticket.is_active ? 'Online' : 'Disabled'}
                                    </button>
                                </td>
                                <td>
                                    <div className="flex justify-start gap-2">
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Modify" onClick={() => navigate(`/admin/tickets/edit/${ticket.id}`)}><Edit size={16} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-danger flex items-center justify-center hover:bg-danger hover:text-white hover:border-danger transition-all shadow-sm" title="Delete" onClick={() => handleDelete(ticket.id)}><Trash2 size={16} /></button>
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
        </div>
    );
}
