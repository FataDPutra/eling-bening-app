import { useState, useEffect } from 'react';
import { getBookings, saveBookings, formatRupiah } from '../../../utils/data';
import { Search, Filter, Calendar, Hash, User, Tag, ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Ticket, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TicketOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Filter only ticket-related bookings (ID starts with EB-TICK)
        const allBookings = getBookings();
        setOrders(allBookings.filter(b => b.id.includes('TICK')));
    }, []);

    const toggleCheckIn = (id) => {
        const allBookings = getBookings();
        const updatedBookings = allBookings.map(b => {
            if (b.id === id) {
                const newStatus = !b.checkedIn;
                toast.success(newStatus ? 'Pengunjung berhasil check-in' : 'Check-in dibatalkan');
                return { ...b, checkedIn: newStatus };
            }
            return b;
        });

        saveBookings(updatedBookings);
        setOrders(updatedBookings.filter(b => b.id.includes('TICK')));
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.itemName && o.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filter === 'all') return matchesSearch;
        if (filter === 'checked-in') return matchesSearch && o.checkedIn;
        if (filter === 'pending') return matchesSearch && !o.checkedIn;
        return matchesSearch;
    });

    // Stats
    const stats = {
        total: orders.length,
        checkedIn: orders.filter(o => o.checkedIn).length,
        pending: orders.filter(o => !o.checkedIn).length
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/tickets')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Manajemen Tiket
                    </button>
                    <h1>Riwayat Pesanan Tiket</h1>
                    <p>Monitor dan verifikasi tiket masuk pengunjung secara real-time.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border text-admin-text-main font-bold text-sm hover:bg-admin-bg transition-all">
                        <FileText size={18} className="text-admin-primary" /> Eksport Laporan
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card !p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-admin-primary-light text-admin-primary flex items-center justify-center">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Total Pesanan</p>
                        <p className="text-xl font-black text-admin-text-main leading-tight">{stats.total}</p>
                    </div>
                </div>
                <div className="admin-card !p-4 flex items-center gap-4 border-l-4 border-l-success">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-success flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Telah Check-in</p>
                        <p className="text-xl font-black text-admin-text-main leading-tight text-success">{stats.checkedIn}</p>
                    </div>
                </div>
                <div className="admin-card !p-4 flex items-center gap-4 border-l-4 border-l-warning">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-warning flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Menunggu</p>
                        <p className="text-xl font-black text-admin-text-main leading-tight text-warning">{stats.pending}</p>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions !flex-col md:!flex-row gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-admin-primary text-white' : 'bg-admin-bg text-admin-text-muted hover:text-admin-main'}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilter('checked-in')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'checked-in' ? 'bg-success text-white' : 'bg-admin-bg text-admin-text-muted hover:text-admin-main'}`}
                        >
                            Sudah Check-in
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'pending' ? 'bg-warning text-white' : 'bg-admin-bg text-admin-text-muted hover:text-admin-main'}`}
                        >
                            Belum
                        </button>
                    </div>
                    <div className="topbar-search !w-full md:!w-80">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Cari Order ID, Nama, atau Jenis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order Details</th>
                            <th>Pengunjung</th>
                            <th>Jadwal Kunjungan</th>
                            <th>Status Pembayaran</th>
                            <th className="text-center">Check-In</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className={order.checkedIn ? 'bg-admin-bg/30' : ''}>
                                <td>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-black text-admin-primary text-sm">
                                            <Hash size={14} className="text-admin-text-light" /> {order.id}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-admin-text-muted mt-1 font-bold">
                                            <Ticket size={12} /> {order.itemName}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary font-black text-xs">
                                            {order.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-admin-text-main text-sm">{order.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-bold text-admin-text-muted">
                                        <Calendar size={14} className="text-admin-primary" /> {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="font-black text-admin-text-main">{formatRupiah(order.total)}</span>
                                        <span className={`text-[10px] uppercase tracking-widest font-black mt-0.5 ${order.status === 'success' ? 'text-success' : 'text-danger'}`}>
                                            {order.status === 'success' ? 'Lunas' : 'Gagal'}
                                        </span>
                                    </div>
                                </td>
                                <td className="flex justify-start">
                                    <button
                                        onClick={() => toggleCheckIn(order.id)}
                                        className={`transition-all ${order.checkedIn ? 'text-success' : 'text-admin-text-light hover:text-admin-primary opacity-40 hover:opacity-100'}`}
                                    >
                                        <CheckCircle2 size={24} strokeWidth={order.checkedIn ? 3 : 2} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-admin-bg flex items-center justify-center mb-4">
                                        <ShoppingBag size={32} className="text-admin-text-light opacity-20" />
                                    </div>
                                    <p className="text-admin-text-muted font-black uppercase tracking-widest text-xs">Tidak ditemukan data pesanan</p>
                                    <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className="text-admin-primary text-xs font-bold mt-2 hover:underline">Reset Semua Filter</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Fixed missing import in my thought process, adding it here
import { ShoppingBag as ShoppingBagIcon } from 'lucide-react';
const ShoppingBag = ShoppingBagIcon;
