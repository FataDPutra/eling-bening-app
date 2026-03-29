import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, Hash, User, ArrowLeft, CheckCircle2, Clock, Ticket, FileText, ShoppingBag, X, Info, ShieldCheck, MapPin, DollarSign, ChevronRight, QrCode, RotateCcw, Tag } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../../../utils/data';
import toast from 'react-hot-toast';
import { useAuth } from '../../../utils/AuthContext';

export default function EventOrders() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'success' | 'pending'
    const [eventFilter, setEventFilter] = useState('all'); // Filter by specific event name
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/api/transactions');
            
            // FILTER ONLY EVENT
            const eventOrders = (res.data || []).filter(b => 
                String(b.booking_type).toUpperCase() === 'EVENT'
            );
            
            setOrders(eventOrders);
            setIsLoading(false);
        } catch (error) {
            console.error("Critical: Failed to sync event records", error);
            toast.error("Gagal sinkronisasi data pesanan event");
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/api/transactions/${orderId}`, { status: newStatus });
            toast.success(`Status pesanan diperbarui ke ${newStatus}`);
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, ...res.data });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error(error.response?.data?.message || "Gagal memperbarui status");
        }
    };

    const handleTicketCheckIn = async (ticketUid) => {
        try {
            const res = await axios.patch(`/api/tickets/${ticketUid}/check-in`);
            toast.success(res.data.message);
            fetchOrders();
            if (selectedOrder) {
                setSelectedOrder(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t => 
                        t.ticket_id === ticketUid ? { ...t, is_used: res.data.is_used } : t
                    )
                }));
            }
        } catch (error) {
            console.error("Check-in failed", error);
            toast.error(error.response?.data?.message || "Gagal melakukan check-in");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const uniqueEventNames = Array.from(new Set(
        orders.map(o => o.items?.[0]?.item?.name).filter(Boolean)
    ));

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items?.some(item => item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filter === 'all' 
            ? true 
            : (filter === 'success' ? (o.status === 'success' || o.status === 'paid') : (o.status === 'pending'));
        
        const matchesEvent = eventFilter === 'all'
            ? true
            : o.items?.some(item => item.item?.name === eventFilter);

        return matchesSearch && matchesStatus && matchesEvent;
    });

    const stats = {
        total: orders.length,
        revenue: orders.filter(o => o.status === 'success' || o.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.total_price), 0),
        pending: orders.filter(o => o.status === 'pending').length
    };

    const getStatusStyles = (status) => {
        if (status === 'paid' || status === 'success') return 'bg-success/10 text-success border-success/20';
        if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-danger/10 text-danger border-danger/20';
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/events')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-3 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
                        <ArrowLeft size={14} className="mr-2" /> Back to Event Management
                    </button>
                    <h1>Registry Pesanan Event</h1>
                    <p>Audit rincian transaksi tiket event, verifikasi peserta, dan kelola status pembayaran.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchOrders}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95"
                    >
                        <Clock size={18} className={isLoading ? 'animate-spin text-admin-primary' : 'text-success'} /> 
                        {isLoading ? 'Synchronizing...' : 'Manual Sync'}
                    </button>
                </div>
            </div>

            {/* Event Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-eling-red/10 text-eling-red flex items-center justify-center shadow-inner">
                            <Ticket size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Tiket Terjual</p>
                            <p className="text-3xl font-black text-admin-text-main leading-none tabular-nums">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card group hover:scale-[1.02] transition-all border-l-4 border-l-success">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center shadow-inner">
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Omset Event</p>
                            <p className="text-3xl font-black text-success leading-none tabular-nums">{formatRupiah(stats.revenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card group hover:scale-[1.02] transition-all border-l-4 border-l-warning">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shadow-inner">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Menunggu Validasi</p>
                            <p className="text-3xl font-black text-warning leading-none tabular-nums">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-table-container overflow-visible">
                <div className="table-header-actions mb-8 flex flex-col xl:flex-row items-stretch xl:items-center gap-6">
                    {/* Status Filter */}
                    <div className="flex bg-admin-bg p-1 rounded-2xl border border-admin-border w-fit whitespace-nowrap">
                        {[
                            { id: 'all', label: 'Semua Status' },
                            { id: 'success', label: 'Lunas' },
                            { id: 'pending', label: 'Pending' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t.id ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' : 'text-admin-text-muted hover:text-admin-text-main'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Specific Event Filter */}
                    <div className="flex-1 max-w-[300px]">
                        <select 
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                            className="w-full bg-admin-bg border border-admin-border rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary shadow-sm"
                        >
                            <option value="all">Filter Berdasarkan Event</option>
                            {uniqueEventNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-admin-text-light" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID atau Nama Peserta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto -mx-8 px-8">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Registry ID</th>
                                <th>Participant</th>
                                <th>Event Manifest</th>
                                <th>Scanned</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center shadow-inner">
                                            <div className="w-10 h-10 border-4 border-admin-primary/20 border-t-admin-primary rounded-full animate-spin mb-4" />
                                            <span className="text-xs font-black text-admin-text-muted uppercase tracking-widest animate-pulse">Syncing Event Records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.map(order => {
                                const totalTickets = order.tickets?.length || 0;
                                const usedTickets = order.tickets?.filter(t => t.is_used)?.length || 0;
                                const isFullyUsed = totalTickets > 0 && totalTickets === usedTickets;

                                return (
                                <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className="group hover:bg-admin-primary/5 cursor-pointer transition-all active:scale-[0.99]"
                                >
                                    <td>
                                        <div className="flex items-center gap-2 font-black text-admin-primary text-xs tracking-tighter uppercase italic">
                                            <Hash size={14} className="text-admin-text-light not-italic" /> {order.id}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-muted shadow-inner">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-admin-text-main text-sm uppercase tracking-tight leading-none mb-1 truncate">{order.booker_name || 'Anonymous'}</span>
                                                <span className="text-[10px] text-admin-text-light font-bold truncate max-w-[120px] uppercase">{order.user?.email || 'Guest'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-xs font-bold text-admin-text-main">
                                                <Ticket size={14} className="text-eling-red" /> 
                                                <span className="uppercase truncate max-w-[150px]">{order.items?.[0]?.item?.name || 'Multiple Events'}</span>
                                            </div>
                                            <div className="text-[9px] font-black text-admin-text-muted mt-1 uppercase tracking-[0.1em]">
                                                {order.total_qty} tickets • {new Date(order.check_in_date).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center">
                                            <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${isFullyUsed ? 'bg-success/10 text-success border-success/20' : (usedTickets > 0 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-gray-100 text-gray-400 border-gray-200')}`}>
                                                <QrCode size={12} />
                                                {usedTickets}/{totalTickets} <span className="text-[8px] opacity-60 ml-0.5">Checked-in</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-black text-admin-text-main text-sm tabular-nums">{formatRupiah(order.total_price)}</span>
                                            <span className="text-[9px] text-admin-text-light font-bold uppercase tracking-widest">{order.payment_method || 'Gateway'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${getStatusStyles(order.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyles(order.status).includes('success') ? 'bg-success' : 'bg-warning'}`} />
                                            <span className="uppercase">{order.status}</span>
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted group-hover:bg-admin-primary group-hover:text-white transition-all shadow-sm flex items-center justify-center ml-auto">
                                            <ChevronRight size={18} />
                                        </div>
                                    </td>
                                </tr>
                                )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Pesanan Event (High-Fidelity) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row relative z-[1001] shadow-2xl animate-scale-up border border-white/20 max-h-[90vh]">
                        
                        {/* Status Sidebar */}
                        <div className="lg:w-[32%] bg-admin-bg p-8 lg:p-12 border-r border-admin-border flex flex-col">
                            <div className="w-16 h-16 rounded-2xl bg-eling-red/10 text-eling-red flex items-center justify-center mb-8 shadow-inner ring-1 ring-eling-red/20">
                                <Ticket size={32} />
                            </div>
                            
                            <div className="mb-8">
                                <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] mb-2 block">Booking Identifier</span>
                                <h2 className="text-2xl font-black text-admin-text-main tracking-tighter italic uppercase">{selectedOrder.id}</h2>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="p-5 rounded-2xl bg-white border border-admin-border shadow-sm">
                                    <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-3 block">Transaction Status</span>
                                    <div className={`px-4 py-3 rounded-xl border-2 border-dashed font-black uppercase text-center text-xs tracking-widest ${getStatusStyles(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-admin-border shadow-sm">
                                    <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-2 block">Payment Method</span>
                                    <div className="flex items-center gap-3 text-admin-text-main font-bold">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center border border-admin-border">
                                            <DollarSign size={16} />
                                        </div>
                                        <span className="uppercase text-xs">{selectedOrder.payment_method || 'Midtrans Gateway'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-dashed border-admin-border">
                                <button 
                                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status === 'pending' ? 'success' : 'pending')}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${selectedOrder.status === 'pending' ? 'bg-success text-white' : 'bg-warning text-white'}`}
                                >
                                    {selectedOrder.status === 'pending' ? <CheckCircle2 size={18} /> : <RotateCcw size={18} />}
                                    {selectedOrder.status === 'pending' ? 'Verify Payment' : 'Rollback to Pending'}
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(selectedOrder.id, 'failed')}
                                    className="w-full mt-3 py-4 rounded-xl font-black uppercase tracking-widest text-danger hover:bg-danger/5 transition-all text-xs"
                                >
                                    Cancel Transaction
                                </button>
                            </div>
                        </div>

                        {/* Order Details Content */}
                        <div className="lg:w-[68%] p-8 lg:p-14 overflow-y-auto bg-white custom-scrollbar">
                            <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 z-20 w-10 h-10 rounded-xl bg-admin-bg hover:bg-danger hover:text-white text-admin-text-muted flex items-center justify-center transition-all shadow-sm">
                                <X size={20} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1 h-6 bg-eling-red rounded-full" />
                                        <h3 className="text-base font-black text-admin-text-main uppercase tracking-tight">Data Pemesan</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-admin-border border-dashed">
                                            <span className="text-[10px] font-bold text-admin-text-muted uppercase">Nama Lengkap</span>
                                            <span className="text-xs font-black text-admin-text-main uppercase">{selectedOrder.booker_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-admin-border border-dashed">
                                            <span className="text-[10px] font-bold text-admin-text-muted uppercase">Phone / WA</span>
                                            <span className="text-xs font-black text-admin-text-main uppercase">{selectedOrder.booker_phone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-admin-border border-dashed">
                                            <span className="text-[10px] font-bold text-admin-text-muted uppercase">Email Address</span>
                                            <span className="text-xs font-black text-admin-text-main">{selectedOrder.user?.email || 'Guest Member'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1 h-6 bg-warning rounded-full" />
                                            <h3 className="text-base font-black text-admin-text-main uppercase tracking-tight">Ringkasan Biaya</h3>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-admin-bg border border-admin-border space-y-4">
                                            {selectedOrder.items?.map((item, idx) => {
                                                const displayPrice = Number(item.price) || Number(item.item?.price) || 0;
                                                const displayQty = Number(item.quantity) || 1;
                                                return (
                                                    <div key={idx} className="flex justify-between text-xs font-medium">
                                                        <span className="text-admin-text-muted">{displayQty}x {item.item?.name}</span>
                                                        <span className="text-admin-text-main tabular-nums">{formatRupiah(displayPrice * displayQty)}</span>
                                                    </div>
                                                );
                                            })}
                                            
                                            <div className="pt-4 border-t border-admin-border border-dashed space-y-2">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-admin-text-muted">
                                                    <span>Subtotal Gross</span>
                                                    <span>{formatRupiah(Number(selectedOrder.total_price || 0) + Number(selectedOrder.discount_amount || 0) - (Number(selectedOrder.total_price || 0) * 0.1))}</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-admin-text-muted">
                                                    <span>Fiscal Tax 10%</span>
                                                    <span>{formatRupiah(Number(selectedOrder.total_price || 0) * 0.1)}</span>
                                                </div>
                                                {selectedOrder.discount_amount > 0 && (
                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-eling-red">
                                                        <span>Promo Audit</span>
                                                        <span>-{formatRupiah(selectedOrder.discount_amount)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-admin-border flex justify-between items-center">
                                                <span className="text-[10px] font-black text-admin-text-main uppercase tracking-widest">Grand Total</span>
                                                <span className="text-xl font-black text-admin-primary tabular-nums italic">
                                                    {formatRupiah(Number(selectedOrder.total_price || 0))}
                                                </span>
                                            </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-6 bg-success rounded-full" />
                                <h3 className="text-base font-black text-admin-text-main uppercase tracking-tight text-success flex items-center gap-2">
                                    Peserta Manifest ({selectedOrder.tickets?.length || 0})
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(selectedOrder.tickets || []).map((t, idx) => (
                                    <div key={idx} className={`relative overflow-hidden group p-5 rounded-2xl border transition-all ${t.is_used ? 'bg-success/5 border-success/20' : 'bg-white border-admin-border hover:border-admin-primary/40'}`}>
                                        {t.is_used && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-success text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-success/20">
                                                <CheckCircle2 size={10} /> Scanned
                                            </div>
                                        )}
                                        <div className="flex items-center gap-5">
                                            <div className="relative group/qr">
                                                <div className="w-16 h-16 rounded-xl bg-white border border-admin-border flex items-center justify-center overflow-hidden p-1 shadow-sm transition-transform group-hover:scale-105">
                                                    <QRCodeCanvas value={t.ticket_id} size={56} />
                                                </div>
                                                <div className="absolute inset-0 bg-admin-primary/90 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-all rounded-xl cursor-help">
                                                    <QrCode size={24} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-admin-text-main uppercase truncate tracking-tight">{t.guest_name}</h4>
                                                <p className="text-[10px] font-bold text-admin-text-light mt-1 tracking-tighter italic uppercase truncate">{t.ticket_id}</p>
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleTicketCheckIn(t.ticket_id); }}
                                                    className={`mt-3 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${t.is_used ? 'bg-white border border-success text-success' : 'bg-admin-bg border border-admin-border text-admin-text-muted hover:bg-admin-primary hover:text-white hover:border-admin-primary hover:shadow-lg hover:shadow-admin-primary/20'}`}
                                                >
                                                    {t.is_used ? 'Batal Check-in' : 'Validate QR'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedOrder.tickets || selectedOrder.tickets.length === 0) && (
                                    <div className="col-span-2 py-10 border-2 border-dashed border-admin-border rounded-3xl flex flex-col items-center justify-center text-admin-text-light bg-admin-bg/50">
                                        <Info size={32} className="mb-3 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Peserta Belum Terdaftar</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
