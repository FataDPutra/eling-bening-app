import { useState, useEffect } from 'react';
import { Search, Eye, X, Check, Calendar, User, CreditCard, ChevronRight, Info, ShoppingCart, Clock, ArrowUpRight, ArrowRight, DollarSign, LayoutGrid, Download, MessageSquare, Quote, Star, CheckCircle2, Ticket, DoorOpen, DoorClosed, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isAllTime, setIsAllTime] = useState(false);
    const [resortFilter, setResortFilter] = useState('all');
    
    // Addon states
    const [isAddingAddon, setIsAddingAddon] = useState(false);
    const [addonFacilities, setAddonFacilities] = useState([]);
    const [addonQuantities, setAddonQuantities] = useState({});
    const [isSubmittingAddon, setIsSubmittingAddon] = useState(false);

    const months = [
        { name: 'Januari', value: 1 }, { name: 'Februari', value: 2 }, { name: 'Maret', value: 3 },
        { name: 'April', value: 4 }, { name: 'Mei', value: 5 }, { name: 'Juni', value: 6 },
        { name: 'Juli', value: 7 }, { name: 'Agustus', value: 8 }, { name: 'September', value: 9 },
        { name: 'Oktober', value: 10 }, { name: 'November', value: 11 }, { name: 'Desember', value: 12 }
    ];

    const fetchBookings = async () => {
        try {
            const period = isAllTime ? 'all' : selectedMonth;
            const res = await axios.get(`/api/transactions?month=${period}&year=${selectedYear}`);
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

    const fetchAddonFacilities = async () => {
        try {
            const res = await axios.get('/api/addon-facilities');
            setAddonFacilities(res.data);
            const initialQuantities = {};
            res.data.forEach(f => initialQuantities[f.id] = 0);
            setAddonQuantities(initialQuantities);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAddon = async () => {
        const orderItems = Object.entries(addonQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ item_id: parseInt(id), quantity: qty }));

        if (orderItems.length === 0) {
            toast.error('Pilih minimal 1 fasilitas.');
            return;
        }

        setIsSubmittingAddon(true);
        try {
            await axios.post(`/api/transactions/${selectedBooking.id}/addons`, {
                items: orderItems,
                payment_method: 'Manual/Admin'
            });
            toast.success('Fasilitas tambahan berhasil ditambahkan.');
            setIsAddingAddon(false);
            // Refresh detail
            const res = await axios.get(`/api/transactions/${selectedBooking.id}`);
            setSelectedBooking(res.data);
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan fasilitas.');
        } finally {
            setIsSubmittingAddon(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [selectedMonth, selectedYear, isAllTime]);

    const uniqueResortNames = Array.from(new Set(
        bookings.map(b => b.items?.[0]?.item?.name).filter(Boolean)
    ));

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.user && b.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

        const matchesResort = resortFilter === 'all'
            ? true
            : b.items?.some(item => item.item?.name === resortFilter);

        return matchesSearch && matchesStatus && matchesResort;
    });

    const getStatusStyles = (status) => {
        if (status === 'paid' || status === 'success') return 'bg-success/10 text-success border-success/20';
        if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-danger/10 text-danger border-danger/20';
    };

    const getGrandTotal = (booking) => {
        const basePr = Number(booking.total_price || 0);
        const addPr = (booking.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0);
        const rescPr = (booking.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0);
        return basePr + addPr + rescPr;
    };

    const handleExport = () => {
        if (filteredBookings.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const periodTitle = isAllTime ? 'TOTAL SEMUA PERIODE' : `${months.find(m => m.value === selectedMonth).name.toUpperCase()} ${selectedYear}`;
        const exportDate = new Date().toLocaleString('id-ID');
        const totalRevenue = filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').reduce((acc, curr) => acc + getGrandTotal(curr), 0);

        const csvRows = [
            [`"LAPORAN PESANAN RESORT - ELING BENING"`],
            [`"PERIODE: ${periodTitle}"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['Order ID', 'Customer Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Total (IDR)', 'Status'],
            ...filteredBookings.map(b => [
                b.id,
                `"${b.booker_name || b.user?.name || 'Guest'}"`,
                b.booker_email || b.user?.email || '-',
                `'${b.booker_phone || '-'}`, // Use ' to force string in Excel
                new Date(b.check_in_date).toLocaleDateString('id-ID'),
                b.check_out_date ? new Date(b.check_out_date).toLocaleDateString('id-ID') : '-',
                getGrandTotal(b),
                b.status.toUpperCase()
            ].join(',')),
            [''],
            ['', '', '', '', '', 'TOTAL OMSET:', totalRevenue, '']
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        const fileName = isAllTime ? 'Laporan_Resort_Semua_Periode.csv' : `Laporan_Resort_${months.find(m => m.value === selectedMonth).name}_${selectedYear}.csv`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Data laporan berhasil diekspor');
    };

    const stats = [
        { label: 'Total Transaksi', value: filteredBookings.length, icon: ShoppingCart, color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
        { label: 'Dikonfirmasi', value: filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').length, icon: Check, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Menunggu', value: filteredBookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Pendapatan', value: formatRupiah(filteredBookings.filter(b => b.status === 'success' || b.status === 'paid').reduce((acc, curr) => acc + getGrandTotal(curr), 0)), icon: DollarSign, color: 'text-admin-primary', bg: 'bg-admin-primary/5' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tight">Registry Transaksi & Reservasi</h1>
                    <p className="text-xs md:text-sm text-admin-text-muted font-bold">Monitoring arus kas masuk, verifikasi status pemesanan, dan audit log transaksi pelanggan secara real-time.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center md:justify-end gap-3 w-full md:w-auto shrink-0">
                    <div className="relative w-full sm:w-auto">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm w-full sm:min-w-[200px] h-[45px]"
                        >
                            <Calendar size={16} className="text-admin-primary" /> {isAllTime ? 'Total Semua' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`}
                        </button>

                        {showMonthPicker && (
                            <>
                                <div className="fixed inset-0 z-[1000]" onClick={() => setShowMonthPicker(false)}></div>
                                <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-admin-border p-5 z-[1001] animate-scale-up">
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
                    <button onClick={handleExport} className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20 h-[45px] w-full sm:w-auto">
                        <Download size={18} /> Export Data
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
                <div className="table-header-actions mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <ShoppingCart size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Riwayat Transaksi</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                            <select 
                                value={resortFilter}
                                onChange={(e) => setResortFilter(e.target.value)}
                                className="w-full bg-admin-bg border border-admin-border rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary shadow-sm"
                            >
                                <option value="all">Semua Resort</option>
                                {uniqueResortNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Cari ID atau pelanggan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all cursor-pointer shadow-sm uppercase"
                            >
                                <option value="all">Semua Status</option>
                                <option value="success">Berhasil</option>
                                <option value="paid">Dibayar</option>
                                <option value="pending">Menunggu</option>
                                <option value="failed">Gagal/Batal</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Pelanggan Utama</th>
                                <th>Tanggal Inap</th>
                                <th>Total Bersih</th>
                                <th>Info Kedatangan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
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
                                                <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{booking.booker_name || booking.user?.name || 'Guest User'}</div>
                                                <span className="text-[10px] text-admin-text-muted font-bold tracking-wider">{booking.booker_email || booking.user?.email || 'No Email'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2.5 text-xs font-bold text-admin-text-muted">
                                            <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="leading-none">{new Date(booking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                {booking.booking_type === 'RESORT' && booking.check_out_date && (
                                                    <div className="text-[9px] opacity-50 font-black mt-1 uppercase tracking-tighter">s/d {new Date(booking.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                )}
                                                {booking.booking_type !== 'RESORT' && (
                                                    <div className="text-[9px] opacity-50 font-black mt-1 uppercase tracking-tighter whitespace-nowrap">{booking.booking_type} PASS</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-admin-text-main">{formatRupiah(getGrandTotal(booking))}</span>
                                            <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Payment Final</span>
                                        </div>
                                    </td>
                                    <td>
                                        {booking.stay_status === 'checked_in' ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded-xl border border-blue-100 animate-pulse-slow">
                                                <DoorOpen size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sudah Check-in</span>
                                            </div>
                                        ) : booking.stay_status === 'checked_out' ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
                                                <Check size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Selesai</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest italic opacity-30">Belum Datang</span>
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
                </div>

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
                <div className="fixed inset-0 z-[1000] overflow-y-auto p-4 sm:p-6 md:p-12 flex justify-center items-start md:items-center animate-fade-in">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row relative z-[1001] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-scale-up border border-white/20 my-auto">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 md:top-8 md:right-8 z-30 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white hover:bg-red-800 hover:text-white text-admin-text-muted flex items-center justify-center transition-all shadow-lg border border-admin-border active:scale-90 group"
                        >
                            <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="md:w-1/3 bg-admin-bg p-8 md:p-12 border-b md:border-b-0 md:border-r border-admin-border flex flex-col">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-admin-primary/10 text-admin-primary flex items-center justify-center mb-6 md:mb-8 shadow-inner">
                                <ShoppingCart size={28} className="md:w-8 md:h-8" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] mb-2">ID Transaksi</span>
                            <h2 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tighter mb-6 md:mb-8 leading-none">{selectedBooking.id}</h2>

                            <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border ${getStatusStyles(selectedBooking.status)}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock size={14} className="md:w-4 md:h-4" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Progres Pesanan</span>
                                </div>
                                <div className="text-xs md:text-sm font-black uppercase tracking-tight">{selectedBooking.status === 'success' || selectedBooking.status === 'paid' ? 'Terkonfirmasi' : 'Antrean Audit'}</div>
                            </div>
                        </div>

                        <div className="md:w-2/3 p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                <div className="p-2 rounded-lg bg-admin-primary/10 text-admin-primary">
                                    <Info size={14} className="md:w-4 md:h-4" />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary">Laporan Data Pesanan</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Informasi Pemesan</h4>
                                        <div className="flex items-center gap-4 p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] bg-admin-bg border border-admin-border shadow-sm group hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm shrink-0">
                                                <User size={16} className="md:w-[18px] md:h-[18px]" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] md:text-sm font-black text-admin-text-main uppercase tracking-tight leading-none mb-1 truncate">{selectedBooking.booker_name || selectedBooking.user?.name || 'Guest User'}</span>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] md:text-[10px] text-admin-text-muted font-bold tracking-tight truncate">{selectedBooking.booker_email || selectedBooking.user?.email || 'No email provided'}</span>
                                                    {selectedBooking.booker_phone && <span className="text-[9px] md:text-[10px] text-admin-primary font-black tracking-widest">{selectedBooking.booker_phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Waktu & Lokasi Kunjungan</h4>
                                        <div className="flex items-center gap-4 p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] bg-admin-bg border border-admin-border shadow-sm group hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-sm shrink-0">
                                                <Calendar size={16} className="md:w-[18px] md:h-[18px]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] md:text-sm font-black text-admin-text-main uppercase tracking-tight leading-none mb-1">
                                                    {new Date(selectedBooking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {selectedBooking.check_out_date && (
                                                        <span className="text-admin-text-muted block sm:inline mt-1 sm:mt-0"> - Check-out {new Date(selectedBooking.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                    )}
                                                </span>
                                                <span className="text-[9px] md:text-[10px] text-admin-text-muted font-bold tracking-widest uppercase mt-1">
                                                    {selectedBooking.booking_type === 'RESORT' 
                                                        ? `Tiba: ${selectedBooking.arrival_time && selectedBooking.arrival_time !== 'Pilih waktu kedatangan' ? selectedBooking.arrival_time : '-'}` 
                                                        : `TIPE: ${selectedBooking.booking_type}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ADMIN ADDON BUTTON */}
                                    {selectedBooking.booking_type === 'RESORT' && selectedBooking.stay_status !== 'checked_out' && (
                                        <div className="pt-2 md:pt-4">
                                            <button 
                                                onClick={() => {
                                                    fetchAddonFacilities();
                                                    setIsAddingAddon(true);
                                                }}
                                                className="w-full py-3 bg-admin-primary/10 text-admin-primary rounded-xl border border-admin-primary/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-admin-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={12} className="md:w-3.5 md:h-3.5" /> Admin: Tambah Fasilitas
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Total Pembayaran</h4>
                                        <div className="flex items-center gap-5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-admin-primary text-white shadow-xl shadow-admin-primary/30 relative overflow-hidden group">
                                            <div className="absolute top-[-20%] right-[-10%] w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -z-0 group-hover:scale-110 transition-transform duration-1000" />
                                            <DollarSign size={28} className="md:w-8 md:h-8 relative z-10 shrink-0" />
                                            <div className="flex flex-col relative z-10">
                                                <span className="text-xl md:text-2xl font-black leading-none tracking-tighter">{formatRupiah(selectedBooking.total_price)}</span>
                                                <span className="text-[9px] md:text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-2">Valuasi Bersih</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="mb-10">
                                <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                    Detail Item Pesanan
                                    <span className="w-12 h-px bg-admin-border" />
                                </h4>
                                <div className="space-y-4">
                                    {(selectedBooking.items || []).map((tItem, idx) => (
                                        <div key={idx} className="bg-admin-bg border border-admin-border rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-4 group hover:bg-white transition-all">
                                            <div 
                                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${selectedBooking.booking_type === 'RESORT' ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                onClick={() => {
                                                    if (selectedBooking.booking_type === 'RESORT' && tItem.item?.id) {
                                                        window.location.href = `/rooms/${tItem.item.id}`;
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="w-14 h-11 md:w-16 md:h-12 rounded-xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm overflow-hidden shrink-0">
                                                        {selectedBooking.booking_type === 'RESORT' && tItem.item?.gallery?.[0] ? (
                                                            <img src={tItem.item.gallery[0]} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <ShoppingCart size={16} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[11px] md:text-xs font-black text-admin-text-main uppercase truncate block">{tItem.item?.name || 'Unknown Item'}</span>
                                                        
                                                        {selectedBooking.booking_type === 'RESORT' && tItem.item && (
                                                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 opacity-70">
                                                                {tItem.item.bed_type && (
                                                                    <span className="text-[8px] text-admin-text-muted font-bold whitespace-nowrap">
                                                                        {tItem.item.bed_type}
                                                                    </span>
                                                                )}
                                                                <span className="text-[8px] text-admin-text-muted font-bold whitespace-nowrap">
                                                                    • {tItem.item.capacity || 2} Tamu
                                                                </span>
                                                                {tItem.item.room_size && (
                                                                    <span className="text-[8px] text-admin-text-muted font-bold whitespace-nowrap">
                                                                        • {tItem.item.room_size} m&sup2;
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="text-[8px] md:text-[9px] font-bold text-admin-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                                            <span className="truncate">{tItem.item_type.split('\\').pop()}</span>
                                                            <span className="w-1 h-1 bg-admin-border rounded-full" />
                                                            <span>{formatRupiah(tItem.price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-admin-border/50">
                                                    <div className="text-[13px] md:text-sm font-black text-admin-text-main">x{tItem.quantity}</div>
                                                    <div className="text-[9px] md:text-[10px] font-bold text-admin-text-muted">{formatRupiah(tItem.subtotal)}</div>
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

                            {/* Linked Addons Summary */}
                            {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                                <section className="mb-10">
                                    <h4 className="text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                        Bill Tagihan Tambahan (Add-ons)
                                        <span className="w-12 h-px bg-admin-border" />
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedBooking.addons.map((addon) => (
                                            <div key={addon.id} className="p-6 bg-admin-bg border border-admin-border rounded-2xl group hover:border-admin-primary/30 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest leading-none mb-1.5">{addon.id}</p>
                                                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border inline-block ${addon.status === 'paid' || addon.status === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                            {addon.status}
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-admin-text-main">{formatRupiah(addon.total_price)}</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {addon.items.map((it, i) => (
                                                        <div key={i} className="flex justify-between text-xs font-bold text-admin-text-muted">
                                                            <span>{it.item?.name} x{it.quantity}</span>
                                                            <span className="text-admin-text-light">{formatRupiah(it.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {addon.status === 'pending' && (
                                                    <div className="mt-4 pt-4 border-t border-admin-border border-dashed flex justify-end">
                                                        <button 
                                                            className="text-[9px] font-black text-admin-primary uppercase tracking-widest hover:underline"
                                                            onClick={() => {
                                                                axios.post(`/api/transactions/${addon.id}/success`).then(() => {
                                                                    toast.success("Addon ditandai Lunas");
                                                                    fetchBookings();
                                                                    setSelectedBooking(null);
                                                                });
                                                            }}
                                                        >
                                                            Tandai Lunas (Manual)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Special Requests */}
                            {selectedBooking.special_requests && (
                                <section className="mb-12">
                                    <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MessageSquare size={12} className="text-admin-primary" />
                                        Permintaan Khusus Tamu
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

                            {/* Final Financial Summary Breakdown */}
                            <section className="mb-10">
                                <h4 className="text-[9px] md:text-[10px] font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                    Laporan Rekapitulasi Keuangan
                                    <span className="w-8 md:w-12 h-px bg-admin-border" />
                                </h4>
                                
                                <div className="space-y-6 md:space-y-8">
                                    {/* 1. PEMBAYARAN UTAMA */}
                                    <div className="p-5 md:p-6 bg-admin-bg rounded-2xl md:rounded-3xl border border-admin-border group hover:bg-white transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1 h-4 bg-admin-primary rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-main">1. Reservasi Utama (Awal)</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[11px] md:text-xs font-bold text-admin-text-muted">
                                                <span>Subtotal Unit/Item</span>
                                                <span>{formatRupiah(selectedBooking.items?.reduce((acc, curr) => acc + Number(curr.subtotal), 0) || 0)}</span>
                                            </div>
                                            {selectedBooking.additional_facilities?.length > 0 && (
                                                <div className="flex justify-between text-[11px] md:text-xs font-bold text-admin-text-muted">
                                                    <span>Fasilitas Pre-Checkin</span>
                                                    <span>{formatRupiah(selectedBooking.additional_facilities.reduce((acc, curr) => acc + (typeof curr === 'object' ? Number(curr.price) : 0), 0))}</span>
                                                </div>
                                            )}
                                            {selectedBooking.discount_amount > 0 && (
                                                <div className="flex justify-between text-[11px] md:text-xs font-bold text-danger">
                                                    <span>Potongan Promo</span>
                                                    <span>-{formatRupiah(selectedBooking.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-3 border-t border-admin-border/50 font-black text-admin-text-main">
                                                <span className="text-[11px] md:text-xs">Total Lunas (Awal)</span>
                                                <span className="text-admin-primary text-[13px] md:text-sm">{formatRupiah(selectedBooking.total_price)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. LAYANAN SAAT MENGINAP (ADDONS) */}
                                    {selectedBooking.addons?.some(a => ['paid', 'success'].includes(a.status)) && (
                                        <div className="p-6 bg-blue-50/10 rounded-3xl border border-blue-100 group hover:bg-white transition-all">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">2. Layanan Saat Menginap (Extra)</span>
                                            </div>
                                            <div className="space-y-4">
                                                {selectedBooking.addons?.filter(a => ['paid', 'success'].includes(a.status)).map(addon => (
                                                    <div key={addon.id} className="pb-3 border-b border-blue-50 last:border-0 last:pb-0">
                                                        <div className="flex justify-between text-[11px] font-black text-admin-text-main mb-1">
                                                            <span>Tagihan #{addon.id}</span>
                                                            <span className="text-blue-600">{formatRupiah(addon.total_price)}</span>
                                                        </div>
                                                        <div className="pl-3 space-y-1">
                                                            {addon.items?.map(it => (
                                                                <div key={it.id} className="flex justify-between text-[10px] font-bold text-admin-text-muted">
                                                                    <span>• {it.item?.name} x{it.quantity}</span>
                                                                    <span>{formatRupiah(it.subtotal)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. RIWAYAT RESCHEDULE */}
                                    {selectedBooking.reschedules?.some(r => r.status === 'completed') && (
                                        <div className="p-6 bg-orange-50/10 rounded-3xl border border-orange-100 group hover:bg-white transition-all">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">3. Biaya Perubahan Jadwal</span>
                                            </div>
                                            <div className="space-y-4">
                                                {selectedBooking.reschedules?.filter(r => r.status === 'completed').map((r, i) => (
                                                    <div key={i} className="pb-3 border-b border-orange-50 last:border-0 last:pb-0">
                                                        <div className="flex justify-between text-[11px] font-black text-admin-text-main mb-2">
                                                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[9px]">LUNAS</span>
                                                            <span className="text-orange-600">{formatRupiah(r.final_charge)}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {r.price_diff > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Selisih Harga</span><span>{formatRupiah(r.price_diff)}</span></div>}
                                                            {r.admin_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Biaya Admin</span><span>{formatRupiah(r.admin_fee)}</span></div>}
                                                            {r.penalty_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-admin-text-muted"><span>Denda Dibatalkan</span><span>{formatRupiah(r.penalty_fee)}</span></div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* GRAND TOTAL COMPONENT */}
                                    <div className="bg-admin-text-main p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl flex justify-between items-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform duration-1000"></div>
                                        <div>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Total Tagihan</p>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <span className="text-xl md:text-3xl font-black tracking-tighter">{formatRupiah(
                                                Number(selectedBooking.total_price || 0) +
                                                (selectedBooking.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0) +
                                                (selectedBooking.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0)
                                            )}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex gap-4">
                                {selectedBooking.status === 'success' || selectedBooking.status === 'paid' ? (
                                    <div className="w-full space-y-4">
                                        {selectedBooking.stay_status === 'pending' && (
                                            <button
                                                onClick={() => handleCheckAction('check-in')}
                                                className="group relative w-full h-24 rounded-[2.5rem] bg-eling-green hover:bg-green-700 transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                                
                                                <div className="relative flex flex-col items-center justify-center h-full text-white">
                                                    <div className="p-2 rounded-full bg-white/20 mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/10">
                                                        <DoorOpen size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-center leading-none text-center">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Konfirmasi Kedatangan</span>
                                                        <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1 text-center">Proses Check-In Tamu</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_in' && (
                                            <button
                                                onClick={() => handleCheckAction('check-out')}
                                                className="group relative w-full h-24 rounded-[2.5rem] bg-slate-900 hover:bg-black transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                                
                                                <div className="relative flex flex-col items-center justify-center h-full text-white">
                                                    <div className="p-2 rounded-full bg-white/10 mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/5">
                                                        <DoorClosed size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-center leading-none text-center">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Check-Out Tamu</span>
                                                        <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-1">Selesaikan Sesi Menginap</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )}
                                        {selectedBooking.stay_status === 'checked_out' && (
                                            <button
                                                onClick={() => setSelectedBooking(null)}
                                                className="w-full py-6 rounded-[2.5rem] bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 group hover:border-eling-green/30 hover:text-eling-green transition-all duration-300 active:scale-95"
                                            >
                                                <span>Kunjungan Selesai</span>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-eling-green group-hover:text-white transition-all">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        disabled
                                        className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed"
                                    >
                                        Menunggu Pembayaran
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Addon Order Modal */}
            {isAddingAddon && (
                <div className="fixed inset-0 z-[10001] overflow-y-auto bg-slate-950/60 backdrop-blur-md animate-fade-in">
                    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 md:p-12">
                        <div className="fixed inset-0" onClick={() => setIsAddingAddon(false)}></div>
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 relative z-[10002] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col border border-white/20 animate-scale-up">
                        <button onClick={() => setIsAddingAddon(false)} className="absolute top-8 right-8 text-admin-text-muted hover:text-admin-text-main transition-colors"><X size={20} /></button>

                        <div className="mb-8">
                            <div className="w-14 h-14 bg-admin-primary/10 text-admin-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <ShoppingCart size={24} />
                            </div>
                            <h3 className="text-xl font-black text-admin-text-main uppercase tracking-tight">Manual Add-on Order</h3>
                            <p className="text-xs font-bold text-admin-text-muted mt-2">Pilih fasilitas tambahan untuk dimasukkan ke bill tamu.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {addonFacilities.map(f => (
                                <div key={f.id} className="p-4 bg-admin-bg rounded-2xl border border-admin-border flex items-center justify-between group hover:bg-white hover:border-admin-primary/20 transition-all shadow-sm">
                                    <div className="flex-1">
                                        <h5 className="font-black text-admin-text-main text-xs uppercase tracking-tight">{f.name}</h5>
                                        <p className="text-[10px] font-black text-admin-primary mt-1">{formatRupiah(f.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-admin-border">
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: Math.max(0, addonQuantities[f.id] - 1)})}
                                            className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center text-admin-text-muted hover:bg-danger/10 hover:text-danger transition"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-5 text-center font-black text-xs text-admin-text-main">{addonQuantities[f.id]}</span>
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: addonQuantities[f.id] + 1})}
                                            className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center text-admin-text-muted hover:bg-success/10 hover:text-success transition"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-admin-border">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Estimasi Tagihan</span>
                                <span className="text-xl font-black text-admin-text-main">
                                    {formatRupiah(addonFacilities.reduce((acc, f) => acc + (f.price * (addonQuantities[f.id] || 0)), 0))}
                                </span>
                            </div>
                            <button 
                                onClick={handleAddAddon}
                                disabled={isSubmittingAddon}
                                className="w-full py-4 bg-admin-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-admin-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 text-xs uppercase tracking-widest"
                            >
                                {isSubmittingAddon ? 'Memproses...' : 'Tambahkan Ke Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
