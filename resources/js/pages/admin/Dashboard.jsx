import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ticket, Building, TrendingUp, Download, MoreVertical, Wallet, Calendar, Bell, Activity } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVolume: 0,
        confirmedCount: 0,
        awaitingCount: 0,
        periodRevenue: 0,
        todayRevenue: 0
    });
    const [bookings, setBookings] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isAllTime, setIsAllTime] = useState(false);
    const [showAllFeeds, setShowAllFeeds] = useState(false);

    const months = [
        { name: 'Januari', value: 1 }, { name: 'Februari', value: 2 }, { name: 'Maret', value: 3 },
        { name: 'April', value: 4 }, { name: 'Mei', value: 5 }, { name: 'Juni', value: 6 },
        { name: 'Juli', value: 7 }, { name: 'Agustus', value: 8 }, { name: 'September', value: 9 },
        { name: 'Oktober', value: 10 }, { name: 'November', value: 11 }, { name: 'Desember', value: 12 }
    ];

    const fetchData = async () => {
        try {
            const [resortsRes, ticketsRes, transactionsRes] = await Promise.all([
                axios.get('/api/resorts'),
                axios.get('/api/tickets'),
                axios.get('/api/transactions')
            ]);

            setAllRooms(resortsRes.data);
            setAllTickets(ticketsRes.data);
            setAllTransactions(transactionsRes.data);
            
            updateDashboardStats(transactionsRes.data, isAllTime ? 'all' : `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`, resortsRes.data, ticketsRes.data);
            
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Gagal sinkronisasi data dashboard");
            setIsLoading(false);
        }
    };

    const updateDashboardStats = (transactions, period, rooms, tickets) => {
        const today = new Date().toISOString().split('T')[0];
        
        const filtered = period === 'all' 
            ? transactions 
            : transactions.filter(t => t.created_at && t.created_at.startsWith(period));

        const calculateGrandTotal = (b) => {
            const base = Number(b.total_price || 0);
            const addons = (b.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0);
            const resc = (b.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0);
            return base + addons + resc;
        };

        const periodRev = filtered
            .filter(b => (b.status === 'success' || b.status === 'paid'))
            .reduce((sum, b) => sum + calculateGrandTotal(b), 0);

        const todayRev = transactions
            .filter(b => b.created_at && b.created_at.startsWith(today) && (b.status === 'success' || b.status === 'paid'))
            .reduce((sum, b) => sum + calculateGrandTotal(b), 0);

        setBookings(filtered);
        setStats({
            totalVolume: filtered.length,
            confirmedCount: filtered.filter(b => b.status === 'success' || b.status === 'paid').length,
            awaitingCount: filtered.filter(b => b.status === 'pending').length,
            periodRevenue: periodRev,
            todayRevenue: todayRev
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (allTransactions.length > 0) {
            updateDashboardStats(allTransactions, isAllTime ? 'all' : `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`, allRooms, allTickets);
        }
    }, [selectedMonth, selectedYear, isAllTime]);

    const downloadReport = () => {
        if (bookings.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const periodTitle = isAllTime ? 'TOTAL SEMUA PERIODE' : `${months.find(m => m.value === selectedMonth).name.toUpperCase()} ${selectedYear}`;
        const exportDate = new Date().toLocaleString('id-ID');
        const totalRevenue = stats.periodRevenue;

        const csvRows = [
            [`"LAPORAN AUDIT KEUANGAN - ELING BENING OVERVIEW"`],
            [`"PERIODE: ${periodTitle}"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['Order ID', 'Pelanggan', 'Item / Layanan', 'Tanggal Transaksi', 'Total (IDR)', 'Status'],
            ...bookings.map(b => [
                b.id,
                `"${b.booker_name || b.user?.name || 'Guest'}"`,
                `"${b.items?.[0]?.item?.name || 'Unknown Item'}"`,
                new Date(b.created_at).toLocaleDateString('id-ID'),
                b.total_price,
                b.status.toUpperCase()
            ].join(',')),
            [''],
            ['', '', '', '', 'TOTAL OMSET PERIODE:', totalRevenue, '']
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        const fileName = isAllTime ? 'Audit_Keuangan_Semua_Periode.csv' : `Audit_Keuangan_${months.find(m => m.value === selectedMonth).name}_${selectedYear}.csv`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Audit laporan berhasil diunduh');
    };

    const statCards = [
        { title: 'TOTAL TRANSAKSI', value: stats.totalVolume, icon: Wallet, color: '#C62828', sub: 'Volume', trend: 'up' },
        { title: 'DIKONFIRMASI', value: stats.confirmedCount, icon: TrendingUp, color: '#2E7D32', sub: 'Sukses', trend: 'up' },
        { title: 'MENUNGGU', value: stats.awaitingCount, icon: Activity, color: '#F59E0B', sub: 'Pending', trend: 'down' },
        { title: 'TOTAL PENDAPATAN', value: formatRupiah(stats.periodRevenue), icon: TrendingUp, color: '#3B82F6', sub: isAllTime ? 'Total' : months.find(m => m.value === selectedMonth).name, trend: 'up' }
    ];

    const weeklyData = [
        { day: 'Sen', val: 450 }, { day: 'Sel', val: 380 }, { day: 'Rab', val: 420 },
        { day: 'Kam', val: 390 }, { day: 'Jum', val: 580 }, { day: 'Sab', val: 850 }, { day: 'Min', val: 920 }
    ];

    const maxVal = Math.max(...weeklyData.map(d => d.val));
    const chartHeight = 180;
    const chartWidth = 500;

    return (
        <div className="animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tight">Ringkasan Dashboard</h1>
                    <p className="text-xs md:text-sm text-admin-text-muted font-bold">Selamat datang kembali, Administrator. Berikut ringkasan operasional berdasarkan periode.</p>
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
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreVertical size={14} className="rotate-90" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreVertical size={14} className="-rotate-90" /></button>
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
                    <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20 h-[45px] w-full sm:w-auto" onClick={downloadReport}>
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] border border-admin-border hover:shadow-2xl hover:shadow-admin-primary/5 hover:border-admin-primary/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-admin-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-main group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all duration-500 shadow-sm">
                                <card.icon size={24} strokeWidth={2} />
                            </div>
                            <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-transform group-hover:scale-105 ${
                                card.trend === 'up' 
                                ? 'text-success bg-success/5 border border-success/10' 
                                : 'text-danger bg-danger/5 border border-danger/10'
                            }`}>
                                {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                                {card.sub}
                            </div>
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-admin-text-muted group-hover:text-admin-primary transition-colors">
                                {card.title}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tighter whitespace-nowrap">
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analytics Chart */}
                <div className="lg:col-span-2 admin-table-container p-6 md:p-10 space-y-8 md:space-y-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-admin-text-main uppercase tracking-widest">Trafik Pengunjung</h3>
                            <p className="text-[10px] md:text-xs text-admin-text-muted font-bold">Total pengunjung kawasan dalam 7 hari terakhir</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-admin-primary shadow-lg shadow-admin-primary/40" />
                                <span className="text-[10px] font-black text-admin-text-muted uppercase">Visitors</span>
                            </div>
                            <button className="p-2.5 hover:bg-admin-bg rounded-xl text-admin-text-muted transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="relative h-48 md:h-64 w-full translate-x-[-10px]">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Detailed Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                                <line
                                    key={i}
                                    x1="0" y1={chartHeight * (1 - p)}
                                    x2={chartWidth} y2={chartHeight * (1 - p)}
                                    stroke="var(--admin-border)" strokeWidth="0.5" strokeDasharray="6"
                                />
                            ))}

                            {/* Smooth Area */}
                            <path
                                d={`M 0 ${chartHeight} ${weeklyData.map((d, i) =>
                                    `L ${(i * chartWidth) / (weeklyData.length - 1)} ${chartHeight - (d.val / maxVal) * chartHeight}`
                                ).join(' ')} L ${chartWidth} ${chartHeight} Z`}
                                fill="url(#gradient)"
                            />

                            {/* Smooth Line */}
                            <path
                                d={`M 0 ${chartHeight - (weeklyData[0].val / maxVal) * chartHeight} ${weeklyData.map((d, i) =>
                                    `L ${(i * chartWidth) / (weeklyData.length - 1)} ${chartHeight - (d.val / maxVal) * chartHeight}`
                                ).join(' ')}`}
                                fill="none" stroke="var(--admin-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                            />

                            {/* Interaction Points */}
                            {weeklyData.map((d, i) => (
                                <g key={i} className="group/dot">
                                    <circle
                                        cx={(i * chartWidth) / (weeklyData.length - 1)}
                                        cy={chartHeight - (d.val / maxVal) * chartHeight}
                                        r="6" fill="white" stroke="var(--admin-primary)" strokeWidth="3"
                                        className="cursor-pointer hover:r-8 transition-all"
                                    />
                                    <text
                                        x={(i * chartWidth) / (weeklyData.length - 1)}
                                        y={chartHeight + 35}
                                        className="text-[10px] font-black fill-admin-text-muted uppercase tracking-widest"
                                        textAnchor="middle"
                                    >
                                        {d.day}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Refined Activity Feed */}
                <div className="admin-table-container p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8 md:mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-admin-text-main uppercase tracking-widest">Hari Ini</h3>
                        </div>
                        <button className="p-2 hover:bg-admin-bg rounded-lg text-admin-text-muted">
                            <Bell size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-6 md:space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-5 animate-pulse">
                                        <div className="w-12 h-12 rounded-[1.25rem] bg-admin-bg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-admin-bg rounded w-3/4" />
                                            <div className="h-3 bg-admin-bg rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : allTransactions.filter(b => b.created_at?.startsWith(new Date().toISOString().split('T')[0])).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <Activity size={32} className="mb-2" />
                                <p className="text-[10px] font-black uppercase text-center">Belum ada aktivitas hari ini</p>
                            </div>
                        ) : allTransactions.filter(b => b.created_at?.startsWith(new Date().toISOString().split('T')[0])).slice(0, showAllFeeds ? 20 : 6).map((b, i) => (
                            <div key={i} className="flex gap-4 md:gap-5 items-start animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary/40 font-black text-xs uppercase shadow-inner">
                                        {b.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${b.status === 'success' || b.status === 'paid' ? 'bg-success' : 'bg-warning'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-black text-admin-text-main uppercase tracking-tight truncate">{b.booker_name || b.user?.name || 'Guest User'}</h4>
                                    <p className="text-[10px] md:text-[11px] text-admin-text-muted font-bold leading-tight truncate">
                                        Pesan <span className="text-admin-text-main">{b.items?.[0]?.item?.name || 'Item'}</span>
                                    </p>
                                    <p className="text-[9px] text-admin-text-light font-black uppercase tracking-widest mt-1">
                                        {new Date(b.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {b.booking_type || 'TRANSACTION'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs md:text-sm font-black text-admin-primary">+{formatRupiah(b.total_price / 1000)}k</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setShowAllFeeds(!showAllFeeds)}
                        className="mt-8 md:mt-10 py-3 md:py-4 w-full rounded-2xl bg-admin-bg text-admin-text-main font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] border border-admin-border hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all text-center"
                    >
                        {showAllFeeds ? 'Sembunyikan' : `Lihat Aktivitas Lainnya`}
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--admin-border); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--admin-text-light); }
            `}</style>
        </div>
    );
}
