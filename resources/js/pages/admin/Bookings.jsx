import { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Check, Calendar, User, CreditCard, ChevronRight, Info, ShoppingCart, Clock, ArrowUpRight, DollarSign, Users, LayoutGrid, FileText, Download } from 'lucide-react';
import { getBookings, formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setBookings(getBookings().reverse());
    }, []);

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'confirmed' && b.status === 'success') ||
            (statusFilter === 'pending' && b.status !== 'success');
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status) => {
        return status === 'success'
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-warning/10 text-warning border-warning/20';
    };

    const stats = [
        { label: 'Total Volume', value: bookings.length, icon: ShoppingCart, color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
        { label: 'Confirmed', value: bookings.filter(b => b.status === 'success').length, icon: Check, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Awaiting', value: bookings.filter(b => b.status !== 'success').length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Success Rate', value: bookings.length ? Math.round((bookings.filter(b => b.status === 'success').length / bookings.length) * 100) + '%' : '0%', icon: ArrowUpRight, color: 'text-admin-primary', bg: 'bg-admin-primary/5' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Registry Transaksi & Reservasi</h1>
                    <p>Monitoring arus kas masuk, verifikasi status pemesanan, dan audit log transaksi pelanggan secara real-time.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm">
                        <Download size={18} className="text-admin-primary" /> Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="admin-card group hover:scale-[1.02] transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-admin-text-main">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <ShoppingCart size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Transaction Records</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Search by ID or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-72"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Lead Customer</th>
                            <th>Entry Date</th>
                            <th>Net Total</th>
                            <th>Status</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => (
                            <tr key={booking.id} className="group">
                                <td>
                                    <div className="font-black text-admin-primary text-xs uppercase tracking-widest">#{booking.id}</div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-muted">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{booking.name}</div>
                                            <span className="text-[10px] text-admin-text-muted font-bold tracking-wider">{booking.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary">
                                            <Calendar size={14} />
                                        </div>
                                        {new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-admin-text-main">{formatRupiah(booking.total)}</span>
                                        <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Payment Final</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge-status ${getStatusStyles(booking.status)}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${booking.status === 'success' ? 'bg-success' : 'bg-warning'}`} />
                                        {booking.status === 'success' ? 'Confirmed' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex justify-start gap-2">
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Inspect Order" onClick={() => setSelectedBooking(booking)}><Eye size={16} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Download Invoice"><Download size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredBookings.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <LayoutGrid size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">No matching records found</h4>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative z-[1001] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-scale-up border border-white/20">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-8 right-8 z-20 w-12 h-12 rounded-2xl bg-admin-bg hover:bg-admin-primary hover:text-white text-admin-text-muted flex items-center justify-center transition-all shadow-sm border border-admin-border"
                        >
                            <X size={20} />
                        </button>

                        <div className="md:w-1/3 bg-admin-bg p-12 border-r border-admin-border flex flex-col">
                            <div className="w-20 h-20 rounded-[2rem] bg-admin-primary/10 text-admin-primary flex items-center justify-center mb-8 shadow-inner">
                                <ShoppingCart size={32} />
                            </div>
                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] mb-2">Order Reference</span>
                            <h2 className="text-3xl font-black text-admin-text-main tracking-tighter mb-8 leading-none">{selectedBooking.id}</h2>

                            <div className={`mt-auto p-6 rounded-3xl border ${getStatusStyles(selectedBooking.status)}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Order Progress</span>
                                </div>
                                <div className="text-sm font-black uppercase tracking-tight">{selectedBooking.status === 'success' ? 'Confirmed' : 'Pending Audit'}</div>
                            </div>
                        </div>

                        <div className="md:w-2/3 p-12 overflow-y-auto max-h-[85vh]">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-lg bg-admin-primary/10 text-admin-primary">
                                    <Info size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary">Intelligence Report</span>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Lead Personnel</h4>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-admin-bg border border-admin-border">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm">
                                                <User size={18} />
                                            </div>
                                            <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">{selectedBooking.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Mission Date</h4>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-admin-bg border border-admin-border">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">{new Date(selectedBooking.date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Settlement Total</h4>
                                        <div className="flex items-center gap-4 p-6 rounded-3xl bg-admin-primary text-white shadow-xl shadow-admin-primary/20">
                                            <DollarSign size={24} />
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black leading-none">{formatRupiah(selectedBooking.total)}</span>
                                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Net Valuation</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="mb-10">
                                <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                    Manifest Details
                                    <span className="w-12 h-px bg-admin-border" />
                                </h4>
                                <div className="bg-admin-bg border border-admin-border rounded-[2rem] p-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm hover:scale-110 transition-transform">
                                            <ShoppingCart size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block mb-1">Service Item</span>
                                            <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">{selectedBooking.itemName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm hover:scale-110 transition-transform">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block mb-1">Payment Method</span>
                                            <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">Virtual Account Transfer</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 btn-primary py-5 rounded-[2rem] shadow-2xl shadow-admin-primary/30 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] font-black underline-offset-4"
                                >
                                    Confirm Log Audit
                                </button>
                                <button
                                    className="w-20 h-20 rounded-[2rem] bg-admin-bg border border-admin-border text-admin-text-muted flex items-center justify-center hover:bg-white transition-all shadow-xl"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
