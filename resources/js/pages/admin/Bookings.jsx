import { useState, useEffect } from 'react';
import { Search, Eye, X, Check, Calendar, User, CreditCard, ChevronRight, Info, ShoppingCart, Clock, ArrowUpRight, DollarSign, LayoutGrid, Download, MessageSquare, Quote, Star, CheckCircle2, Ticket, DoorOpen, DoorClosed } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/transactions');
            // Filter only resort bookings
            const resortBookings = (res.data || []).filter(b => b.booking_type === 'RESORT');
            setBookings(resortBookings);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error("Gagal memuat data transaksi");
            setIsLoading(false);
        }
    };

    const handleCheckAction = async (action) => {
        try {
            const res = await axios.post(`/api/transactions/${selectedBooking.id}/${action}`);
            toast.success(`Berhasil ${action}!`);
            setSelectedBooking(res.data.data);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || `Gagal ${action}`);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.user && b.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status) => {
        if (status === 'paid' || status === 'success') return 'bg-success/10 text-success border-success/20';
        if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-danger/10 text-danger border-danger/20';
    };

    const stats = [
        { label: 'Total Volume', value: bookings.length, icon: ShoppingCart, color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
        { label: 'Confirmed', value: bookings.filter(b => b.status === 'success' || b.status === 'paid').length, icon: Check, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Awaiting', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Revenue', value: formatRupiah(bookings.filter(b => b.status === 'success' || b.status === 'paid').reduce((acc, curr) => acc + Number(curr.total_price), 0)), icon: DollarSign, color: 'text-admin-primary', bg: 'bg-admin-primary/5' },
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
                            <option value="success">Confirmed</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed/Cancelled</option>
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
                            <th>Promo Tracking</th>
                            <th>Status</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Auditing registry records...
                                </td>
                            </tr>
                        ) : filteredBookings.map(booking => (
                            <tr key={booking.id} className="group">
                                <td>
                                    <div className="font-black text-admin-primary text-[10px] uppercase tracking-widest">#{booking.id}</div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-muted">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{booking.user?.name || 'Guest User'}</div>
                                            <span className="text-[10px] text-admin-text-muted font-bold tracking-wider">{booking.user?.email || 'No Email'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary">
                                            <Calendar size={14} />
                                        </div>
                                        {new Date(booking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-admin-text-main">{formatRupiah(booking.total_price)}</span>
                                        <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Payment Final</span>
                                    </div>
                                </td>
                                <td>
                                    {booking.promo ? (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-admin-primary uppercase tracking-widest">{booking.promo.promo_code}</span>
                                            <span className="text-[9px] font-bold text-danger uppercase tracking-tighter">-{formatRupiah(booking.discount_amount)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-admin-text-muted/30 uppercase tracking-widest italic">— No Voucher</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        <span className={`badge-status ${getStatusStyles(booking.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyles(booking.status).includes('success') ? 'bg-success' : 'bg-warning'}`} />
                                            <span className="uppercase">{booking.status}</span>
                                        </span>
                                        {booking.stay_status && booking.stay_status !== 'pending' && (
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border self-start uppercase tracking-widest ${booking.stay_status === 'checked_in' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {booking.stay_status === 'checked_in' ? 'Resident' : 'Checked Out'}
                                            </span>
                                        )}
                                    </div>
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
                                        <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-admin-bg border border-admin-border shadow-sm group hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm">
                                                <User size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-admin-text-main uppercase tracking-tight leading-none mb-1">{selectedBooking.booker_name || selectedBooking.user?.name || 'Guest User'}</span>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-admin-text-muted font-bold tracking-tight">{selectedBooking.booker_email || selectedBooking.user?.email || 'No email provided'}</span>
                                                    {selectedBooking.booker_phone && <span className="text-[10px] text-admin-primary font-black tracking-widest">{selectedBooking.booker_phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Mission Timing</h4>
                                        <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-admin-bg border border-admin-border shadow-sm group hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-admin-text-main uppercase tracking-tight leading-none mb-1">
                                                    {new Date(selectedBooking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-admin-text-muted font-bold tracking-widest uppercase">
                                                    ETA: {selectedBooking.arrival_time || 'Standard (14:00)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Settlement Total</h4>
                                        <div className="flex items-center gap-5 p-8 rounded-[2rem] bg-admin-primary text-white shadow-xl shadow-admin-primary/30 relative overflow-hidden group">
                                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full -z-0 group-hover:scale-110 transition-transform duration-1000" />
                                            <DollarSign size={32} className="relative z-10" />
                                            <div className="flex flex-col relative z-10">
                                                <span className="text-2xl font-black leading-none tracking-tighter">{formatRupiah(selectedBooking.total_price)}</span>
                                                <span className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-2">Net Valuation</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedBooking.additional_facilities && selectedBooking.additional_facilities.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Stay Preferences</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedBooking.additional_facilities.map((fac, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest">
                                                        {fac}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedBooking.special_requests && (
                                <section className="mb-12">
                                    <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MessageSquare size={12} className="text-admin-primary" />
                                        Bespoke Guest Requests
                                    </h4>
                                    <div className="bg-admin-bg p-8 rounded-[2rem] border-2 border-dashed border-admin-border relative group hover:border-admin-primary/30 transition-all">
                                        <div className="absolute top-4 right-6 opacity-5 select-none">
                                            <Quote size={48} className="text-admin-text-main" />
                                        </div>
                                        <p className="text-sm font-bold text-admin-text-main leading-relaxed italic relative z-10">
                                            "{selectedBooking.special_requests}"
                                        </p>
                                    </div>
                                </section>
                            )}

                            <section className="mb-10">
                                <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                    Manifest Items
                                    <span className="w-12 h-px bg-admin-border" />
                                </h4>
                                <div className="space-y-4">
                                    {(selectedBooking.items || []).map((tItem, idx) => (
                                        <div key={idx} className="bg-admin-bg border border-admin-border rounded-2xl p-6 flex flex-col gap-4 group hover:bg-white transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm group-hover:scale-110 transition-transform">
                                                        <ShoppingCart size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-admin-text-main uppercase">{tItem.item?.name || 'Unknown Item'}</span>
                                                        <div className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                                            <span>{tItem.item_type.split('\\').pop()}</span>
                                                            <span className="w-1 h-1 bg-admin-border rounded-full" />
                                                            <span>{formatRupiah(tItem.price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-admin-text-main">x{tItem.quantity}</div>
                                                    <div className="text-[10px] font-bold text-admin-text-muted">{formatRupiah(tItem.subtotal)}</div>
                                                </div>
                                            </div>

                                            {/* Show individual tickets if TICKET type */}
                                            {selectedBooking.booking_type === 'TICKET' && selectedBooking.tickets?.filter(t => t.transaction_item_id === tItem.id).length > 0 && (
                                                <div className="pt-4 border-t border-admin-border/50 grid grid-cols-1 gap-2">
                                                    {selectedBooking.tickets.filter(t => t.transaction_item_id === tItem.id).map((ticket, tIdx) => (
                                                        <div key={tIdx} className="flex justify-between items-center bg-admin-bg/50 px-4 py-2 rounded-xl text-[10px] font-bold">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-admin-text-muted">#{tIdx+1}</span>
                                                                <span className="text-admin-text-main uppercase">{ticket.guest_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-admin-text-light">{ticket.ticket_id}</span>
                                                                {ticket.is_used ? (
                                                                    <CheckCircle2 size={12} className="text-success" />
                                                                ) : (
                                                                    <div className="w-2 h-2 rounded-full bg-admin-text-light/20" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {selectedBooking.promo && (
                                <section className="mb-10 p-6 bg-admin-primary/5 border-2 border-dashed border-admin-primary/20 rounded-[2rem] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-admin-primary/20 flex items-center justify-center text-admin-primary shadow-sm hover:scale-110 transition-transform">
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block mb-0.5">Voucher Verified</span>
                                            <span className="text-sm font-black text-admin-primary uppercase tracking-widest leading-none">
                                                {selectedBooking.promo.promo_code}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block mb-1 font-serif">Valuation Savings</span>
                                        <div className="text-lg font-black text-admin-primary">-{formatRupiah(selectedBooking.discount_amount)}</div>
                                    </div>
                                </section>
                            )}

                            <div className="flex gap-4">
                                {selectedBooking.status === 'success' || selectedBooking.status === 'paid' ? (
                                    <>
                                        {selectedBooking.stay_status === 'pending' && (
                                            <button
                                                onClick={() => handleCheckAction('check-in')}
                                                className="flex-1 bg-eling-green text-white py-5 rounded-[2rem] shadow-xl shadow-green-900/10 active:scale-95 transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                            >
                                                <DoorOpen size={18} />
                                                Confirm Check-In
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_in' && (
                                            <button
                                                onClick={() => handleCheckAction('check-out')}
                                                className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] shadow-xl shadow-slate-900/10 active:scale-95 transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                            >
                                                <DoorClosed size={18} />
                                                Process Check-Out
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_out' && (
                                            <div className="flex-1 bg-slate-50 border border-slate-200 text-slate-400 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                                <Check size={18} />
                                                Stay Completed
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        disabled
                                        className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed"
                                    >
                                        Payment Required
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedBooking(null)}
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
