import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, Hash, User, ArrowLeft, CheckCircle2, Clock, Ticket, FileText, ShoppingBag, X, Info, ShieldCheck, MapPin, DollarSign, ChevronRight, QrCode, RotateCcw, Tag, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../../../utils/data';
import toast from 'react-hot-toast';
import { useAuth } from '../../../utils/AuthContext';

export default function TicketOrders() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); 
    const [assetFilter, setAssetFilter] = useState('all'); // Filter by specific ticket name
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isAllTime, setIsAllTime] = useState(false);

    const months = [
        { name: 'Januari', value: 1 }, { name: 'Februari', value: 2 }, { name: 'Maret', value: 3 },
        { name: 'April', value: 4 }, { name: 'Mei', value: 5 }, { name: 'Juni', value: 6 },
        { name: 'Juli', value: 7 }, { name: 'Agustus', value: 8 }, { name: 'September', value: 9 },
        { name: 'Oktober', value: 10 }, { name: 'November', value: 11 }, { name: 'Desember', value: 12 }
    ];

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const period = isAllTime ? 'all' : selectedMonth;
            const res = await axios.get(`/api/transactions?month=${period}&year=${selectedYear}`);
            
            // Revert to ONLY TICKET (Resort)
            const ticketOrders = (res.data || []).filter(b => 
                String(b.booking_type).toUpperCase() === 'TICKET'
            );
            
            setOrders(ticketOrders);
            setIsLoading(false);
        } catch (error) {
            console.error("Critical: Failed to sync ticket records", error);
            toast.error("Gagal sinkronisasi data pesanan");
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/api/transactions/${orderId}`, { status: newStatus });
            toast.success(`Status pesanan diperbarui ke ${newStatus}`);
            
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...res.data } : o));
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
            
            setOrders(prev => prev.map(o => {
                if (o.tickets && o.tickets.some(t => t.ticket_id === ticketUid)) {
                    return {
                        ...o,
                        tickets: o.tickets.map(t => 
                            t.ticket_id === ticketUid ? { ...t, is_used: res.data.is_used } : t
                        )
                    };
                }
                return o;
            }));

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
    }, [selectedMonth, selectedYear, isAllTime]);

    // Get unique ticket names from orders to build the asset filter
    const uniqueTicketNames = Array.from(new Set(
        orders.map(o => o.items?.[0]?.item?.name).filter(Boolean)
    ));

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items?.some(item => item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filter === 'all' 
            ? true 
            : (filter === 'success' ? (o.status === 'success' || o.status === 'paid') : (o.status === 'pending'));
        
        const matchesAsset = assetFilter === 'all'
            ? true
            : o.items?.some(item => item.item?.name === assetFilter);

        return matchesSearch && matchesStatus && matchesAsset;
    });

    const stats = {
        total: filteredOrders.length,
        revenue: filteredOrders.filter(o => o.status === 'success' || o.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.total_price), 0),
        pending: filteredOrders.filter(o => o.status === 'pending').length
    };

    const getStatusStyles = (status) => {
        if (status === 'paid' || status === 'success') return 'bg-success/10 text-success border-success/20';
        if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-danger/10 text-danger border-danger/20';
    };

    const handleExport = () => {
        if (filteredOrders.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const periodTitle = isAllTime ? 'SEMUA PERIODE' : `${months.find(m => m.value === selectedMonth).name.toUpperCase()} ${selectedYear}`;
        const exportDate = new Date().toLocaleString('id-ID');
        const totalSales = filteredOrders.filter(o => o.status === 'success' || o.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);

        const csvRows = [
            [`"LAPORAN PENJUALAN TIKET - ELING BENING"`],
            [`"PERIODE: ${periodTitle}"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['Order ID', 'Customer Name', 'Email', 'Ticket Item', 'Total Qty', 'Total Price (IDR)', 'Visit Date', 'Status'],
            ...filteredOrders.map(o => [
                o.id,
                `"${o.booker_name || o.user?.name || 'Guest'}"`,
                o.user?.email || '-',
                `"${o.items?.[0]?.item?.name || 'Ticket'}"`,
                o.total_qty,
                o.total_price,
                new Date(o.check_in_date).toLocaleDateString('id-ID'),
                o.status.toUpperCase()
            ].join(',')),
            [''],
            ['', '', '', '', 'TOTAL PENJUALAN:', totalSales, '', '']
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        const fileName = isAllTime ? 'Laporan_Tiket_Semua_Periode.csv' : `Laporan_Tiket_${months.find(m => m.value === selectedMonth).name}_${selectedYear}.csv`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Data laporan berhasil diekspor');
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/tickets')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-3 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Aset Tiket
                    </button>
                    <h1>Registry Pesanan Tiket</h1>
                    <p>Audit rincian transaksi tiket wisata (Tiket Kolam Renang / Masuk) secara eksklusif.</p>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="px-3 py-1 bg-admin-primary/10 rounded-full border border-admin-primary/20 flex items-center gap-2">
                            <User size={12} className="text-admin-primary" />
                            <span className="text-[10px] font-bold text-admin-primary uppercase tracking-widest">Masuk sebagai: {currentUser?.name} ({currentUser?.role})</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-admin-border text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm min-w-[200px]"
                        >
                            <Calendar size={16} className="text-admin-primary" /> {isAllTime ? 'Total Semua' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`}
                        </button>

                        {showMonthPicker && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)}></div>
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-admin-border p-5 z-50 animate-scale-up">
                                    <button 
                                        onClick={() => {
                                            setIsAllTime(true);
                                            setShowMonthPicker(false);
                                        }}
                                        className={`w-full py-3 mb-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isAllTime 
                                            ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                            : 'bg-admin-bg text-admin-text-muted hover:bg-admin-border'
                                        }`}
                                    >
                                        Lihat Total Semua
                                    </button>
                                    
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-admin-border">
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map(m => (
                                            <button 
                                                key={m.value}
                                                onClick={() => {
                                                    setSelectedMonth(m.value);
                                                    setIsAllTime(false);
                                                    setShowMonthPicker(false);
                                                }}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                    !isAllTime && selectedMonth === m.value 
                                                    ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                                    : 'hover:bg-admin-bg text-admin-text-muted'
                                                }`}
                                            >
                                                {m.name.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-admin-bg border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm h-full">
                        <Download size={18} className="text-admin-primary" /> Ekspor Data
                    </button>
                </div>
            </div>

            {/* Quick Intelligence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-inner">
                            <ShoppingBag size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Pesanan Tiket</p>
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
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Pendapatan Tiket</p>
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
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Menunggu Pembayaran</p>
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
                            { id: 'success', label: 'Selesai' },
                            { id: 'pending', label: 'Perlu Audit' }
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

                    {/* Asset Filter (Filter berdasarkan Nama Tiket) */}
                    <div className="flex-1 max-w-[300px]">
                        <select 
                            value={assetFilter}
                            onChange={(e) => setAssetFilter(e.target.value)}
                            className="w-full bg-admin-bg border border-admin-border rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary shadow-sm"
                        >
                            <option value="all">Semua Jenis Tiket (Asset)</option>
                            {uniqueTicketNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-admin-text-light" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID atau Nama Customer..."
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
                                <th>ID Registrasi</th>
                                <th>Pengunjung Utama</th>
                                <th>Item Tiket</th>
                                <th>Check-in</th>
                                <th>Pembayaran</th>
                                <th>Status</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-admin-primary/20 border-t-admin-primary rounded-full animate-spin mb-4" />
                                            <span className="text-xs font-black text-admin-text-muted uppercase tracking-widest animate-pulse">Sinkronisasi Data...</span>
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
                                    className="group hover:bg-admin-primary/10 cursor-pointer transition-all active:scale-[0.99] border-b border-admin-border/50 last:border-0"
                                >
                                    <td>
                                        <div className="flex items-center gap-2 font-black text-admin-primary text-xs tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform">
                                            <Hash size={14} className="text-admin-text-light not-italic" /> {order.id}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-muted shadow-inner group-hover:border-admin-primary/30 group-hover:text-admin-primary transition-all">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-admin-text-main text-sm uppercase tracking-tight leading-none mb-1 group-hover:text-admin-primary transition-colors truncate">{order.booker_name || 'Anonymous Guest'}</span>
                                                <span className="text-[10px] text-admin-text-light font-bold truncate max-w-[120px] uppercase tracking-widest">{order.user?.email || 'Walk-in Customer'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-xs font-bold text-admin-text-main">
                                                <MapPin size={14} className="text-eling-green" /> 
                                                <span className="uppercase truncate max-w-[150px]">{order.items?.[0]?.item?.name || 'Multiple Items'}</span>
                                            </div>
                                            <div className="text-[9px] font-black text-admin-text-muted mt-1 uppercase tracking-[0.1em]">
                                                {order.total_qty} units • {new Date(order.check_in_date).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center">
                                            <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${isFullyUsed ? 'bg-success/10 text-success border-success/20' : (usedTickets > 0 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-gray-100 text-gray-400 border-gray-200')}`}>
                                                <QrCode size={12} />
                                                {usedTickets}/{totalTickets} <span className="text-[8px] opacity-60 ml-0.5">Scanned</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-black text-admin-text-main text-sm tabular-nums">{formatRupiah(order.total_price)}</span>
                                            <span className="text-[9px] text-admin-text-light font-bold uppercase tracking-widest">{order.payment_method || 'Midtrans'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${getStatusStyles(order.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyles(order.status).includes('success') ? 'bg-success' : 'bg-warning'}`} />
                                            <span className="uppercase">{order.status}</span>
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all shadow-sm flex items-center justify-center ml-auto">
                                            <ChevronRight size={18} />
                                        </div>
                                    </td>
                                </tr>
                                )})}
                            {!isLoading && filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20 shadow-inner">
                                            <Ticket size={40} />
                                        </div>
                                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">Tidak ada data tiket ditemukan</h4>
                                        <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className="text-admin-primary text-[10px] font-black uppercase tracking-widest mt-4 hover:underline">Reset Pencarian</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative z-[1001] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-scale-up border border-white/20">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-8 right-8 z-20 w-12 h-12 rounded-2xl bg-white hover:bg-red-800 hover:text-white text-admin-text-muted flex items-center justify-center transition-all shadow-lg border border-admin-border active:scale-90 group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="md:w-[35%] bg-admin-bg p-12 border-r border-admin-border flex flex-col">
                            <div className="w-20 h-20 rounded-[2rem] bg-admin-primary/10 text-admin-primary flex items-center justify-center mb-10 shadow-inner">
                                <Ticket size={40} />
                            </div>
                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.4em] mb-3">Kode Pesanan</span>
                            <h2 className="text-4xl font-black text-admin-text-main tracking-tighter mb-10 leading-none tabular-nums italic">{selectedOrder.id}</h2>

                            <div className={`mt-auto p-8 rounded-[2.5rem] border-2 border-dashed ${getStatusStyles(selectedOrder.status)}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <ShieldCheck size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Keamanan Data</span>
                                </div>
                                <div className="text-lg font-black uppercase tracking-tight">{selectedOrder.status === 'success' || selectedOrder.status === 'paid' ? 'Terverifikasi' : 'Audit Tertunda'}</div>
                            </div>
                        </div>

                        <div className="md:w-[65%] p-14 overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-1 h-12 bg-admin-primary rounded-full" />
                                <div>
                                    <h3 className="text-2xl font-black text-admin-text-main uppercase tracking-tight">Rincian Data Tiket</h3>
                                    <p className="text-xs text-admin-text-muted font-bold uppercase tracking-widest mt-1 italic">Diverifikasi pada {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 mb-12">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><User size={12}/> Info Pelanggan</h4>
                                        <div className="p-6 rounded-[2rem] bg-admin-bg border border-admin-border shadow-inner">
                                            <p className="text-sm font-black text-admin-text-main uppercase mb-1">{selectedOrder.booker_name}</p>
                                            <p className="text-[10px] text-admin-text-light font-bold uppercase tracking-widest">{selectedOrder.user?.email || 'Pelanggan Tamu'}</p>
                                            {selectedOrder.booker_phone && (
                                                <div className="mt-3 pt-3 border-t border-admin-border flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-admin-primary uppercase tracking-widest">Telp: {selectedOrder.booker_phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={12}/> Jadwal Kunjungan</h4>
                                        <div className="p-6 rounded-[2rem] bg-admin-bg border border-admin-border shadow-inner">
                                            <p className="text-sm font-black text-admin-text-main uppercase">{new Date(selectedOrder.check_in_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    {selectedOrder.note && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={12}/> Catatan Khusus</h4>
                                            <div className="p-6 rounded-[2rem] bg-warning/5 border border-warning/10 shadow-inner">
                                                <p className="text-[11px] font-bold text-admin-text-main italic">"{selectedOrder.note}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={12}/> Ringkasan Pembayaran</h4>
                                        <div className="p-8 rounded-[2.5rem] bg-admin-primary text-white shadow-2xl shadow-admin-primary/30 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                                            
                                            <div className="space-y-2 mb-6 opacity-70">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                    <span>Subtotal Kotor</span>
                                                    <span>{formatRupiah(Number(selectedOrder.total_price || 0) + Number(selectedOrder.discount_amount || 0) - (Number(selectedOrder.total_price || 0) * 0.1))}</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                    <span>Pajak (10%)</span>
                                                    <span>{formatRupiah(Number(selectedOrder.total_price || 0) * 0.1)}</span>
                                                </div>
                                                {selectedOrder.discount_amount > 0 && (
                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-eling-red">
                                                        <span>Potongan Promo</span>
                                                        <span>-{formatRupiah(selectedOrder.discount_amount)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block font-serif leading-none">Net Valuasi</span>
                                            <div className="text-3xl font-black tracking-tighter tabular-nums mb-1">{formatRupiah(selectedOrder.total_price)}</div>
                                            <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Total Akhir Pesanan</div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            <section className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-[0.2em]">Daftar Pengunjung ({selectedOrder.total_qty})</h4>
                                    <div className="h-px flex-1 mx-6 bg-admin-border opacity-50" />
                                </div>
                                <div className="space-y-4">
                                    {(selectedOrder.tickets || []).map((ticket, idx) => (
                                        <div key={idx} className="bg-admin-bg border border-admin-border rounded-2xl p-5 flex items-center justify-between group hover:bg-admin-primary/5 transition-all shadow-sm">
                                            <div className="flex items-center gap-4 group/v">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-admin-border flex items-center justify-center overflow-hidden transition-all group-hover/v:border-admin-primary/30 group-hover/v:shadow-lg shadow-inner">
                                                        <QRCodeCanvas 
                                                            value={ticket.ticket_id} 
                                                            size={48}
                                                            level="L"
                                                            includeMargin={false}
                                                            className="opacity-40 group-hover/v:opacity-100 transition-all grayscale group-hover/v:grayscale-0 p-1"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white border border-admin-border flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-300">
                                                        <QrCode size={12} className="text-admin-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-admin-text-main uppercase tracking-tight">{ticket.guest_name}</span>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <span className="text-[9px] font-black bg-admin-primary/10 text-admin-primary px-2 py-0.5 rounded uppercase tracking-widest leading-none shadow-sm border border-admin-primary/10">
                                                            {ticket.transaction_item?.item?.name || 'Item Tiket'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-admin-text-light font-mono bg-admin-bg px-2 py-0.5 rounded flex items-center gap-1 border border-admin-border/30 group-hover/v:border-admin-primary/30 group-hover/v:text-admin-text-main transition-all">
                                                            {ticket.ticket_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleTicketCheckIn(ticket.ticket_id); }}
                                                    className={`badge-status transition-all active:scale-95 flex items-center gap-2 group/check ${ticket.is_used 
                                                        ? 'bg-success/10 text-success border-success/20 hover:bg-danger hover:text-white hover:border-danger' 
                                                        : 'bg-admin-bg text-admin-text-light border-admin-border hover:bg-admin-primary hover:text-white hover:border-admin-primary'}`}
                                                    title={ticket.is_used ? 'Batalkan Check-in' : 'Proses Masuk'}
                                                >
                                                    {ticket.is_used ? (
                                                        <CheckCircle2 size={12} className="group-hover/check:hidden" />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-admin-text-light/30 group-hover/check:bg-white" />
                                                    )}
                                                    {ticket.is_used && <X size={12} className="hidden group-hover/check:block animate-in fade-in" />}
                                                    <span className="text-[9px] uppercase font-black">{ticket.is_used ? 'Otorisasi' : 'Validasi'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedOrder.tickets || selectedOrder.tickets.length === 0) && (
                                        <div className="py-10 text-center border-2 border-dashed border-admin-border rounded-[2rem] bg-admin-bg/50">
                                            <div className="w-10 h-10 border-2 border-admin-primary/20 border-t-admin-primary rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-xs font-bold text-admin-text-muted uppercase tracking-widest italic">Sinkronisasi rincian pengunjung...</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {selectedOrder.promo && (
                                <section className="mb-10 p-8 bg-admin-primary/5 border-2 border-dashed border-admin-primary/20 rounded-[2.5rem] flex items-center justify-between animate-pulse-subtle">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white border border-admin-primary/20 flex items-center justify-center text-admin-primary shadow-xl group-hover:scale-110 transition-all">
                                            <Tag size={32} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] block mb-1">Promo Terverifikasi</span>
                                            <span className="text-xl font-black text-admin-primary uppercase tracking-widest leading-none italic shadow-sm">
                                                {selectedOrder.promo.promo_code}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block mb-2 font-serif">Potongan Harga</span>
                                        <div className="text-2xl font-black text-admin-primary tabular-nums">-{formatRupiah(selectedOrder.discount_amount)}</div>
                                    </div>
                                </section>
                            )}

                            <div className="flex flex-col gap-4 pt-6 border-t border-admin-border">
                                {selectedOrder.status === 'pending' ? (
                                    <div className="space-y-4">
                                        <button 
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'success')}
                                            className="group relative w-full h-24 rounded-[2rem] bg-eling-green hover:bg-green-700 transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            
                                            <div className="relative flex flex-col items-center justify-center h-full text-white">
                                                <div className="p-2 rounded-full bg-white/20 mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/10">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div className="flex flex-col items-center leading-none">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Konfirmasi</span>
                                                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Pembayaran Tiket</span>
                                                </div>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'failed')}
                                            className="w-full py-4 rounded-2xl border-2 border-eling-red/20 text-eling-red font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-800 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                        >
                                            <X size={16} /> Batalkan Transaksi
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')}
                                            className="py-3 rounded-xl bg-admin-bg border border-admin-border text-admin-text-light hover:text-warning hover:border-warning/30 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Setel Tertunda</span>
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                                            className="py-3 rounded-xl bg-admin-bg border border-admin-border text-admin-text-light hover:text-danger hover:border-danger/30 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <X size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Batalkan Pesanan</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="py-3 rounded-xl bg-admin-primary/10 text-admin-primary border border-admin-primary/20 hover:bg-admin-primary hover:text-white transition-all flex flex-col items-center justify-center gap-1"
                                        >
                                            <CheckCircle2 size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Tutup Audit</span>
                                        </button>
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
