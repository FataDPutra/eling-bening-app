import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart as BarIcon, TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, Calendar, Download, MoreHorizontal, Loader2 } from 'lucide-react';
import { formatRupiah } from '../../utils/data';

export default function Stats() {
    const [isLoading, setIsLoading] = useState(true);
    const [realStats, setRealStats] = useState(null);
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

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const period = isAllTime ? 'all' : selectedMonth;
            const { data } = await axios.get(`/api/admin/stats?month=${period}&year=${selectedYear}`);
            setRealStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear, isAllTime]);

    if (isLoading && !realStats) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-admin-primary" size={48} />
        </div>
    );

    const statsConfig = [
        { label: 'Tiket Terjual', key: 'tickets', icon: <TrendingUp size={20} /> },
        { label: 'Reservasi Kamar', key: 'reservations', icon: <Users size={20} /> },
        { label: 'Occupancy Rate', key: 'occupancy', icon: <BarIcon size={20} /> },
        { label: 'Revenue/Month', key: 'revenue', icon: <Wallet size={20} />, highlight: true }
    ];

    const dailyTickets = realStats?.daily_tickets || [];
    const maxTicket = dailyTickets.length > 0 ? Math.max(...dailyTickets.map(d => d.val)) : 100;

    const bookingTypes = realStats?.booking_types || [];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Statistik & Analytics</h1>
                    <p>Pantau performa bisnis dan tren operasional secara real-time.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm min-w-[200px] h-[45px]"
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
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreHorizontal size={14} className="rotate-90" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreHorizontal size={14} className="-rotate-90" /></button>
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
                    <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20">
                        <Download size={18} /> Export Laporan
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((config, i) => {
                    const data = realStats.stats[config.key];
                    return (
                        <div key={i} className={`p-8 bg-white rounded-[2rem] border border-admin-border group hover:scale-[1.03] hover:shadow-2xl hover:shadow-admin-primary/5 transition-all duration-500 cursor-default relative overflow-hidden ${config.highlight ? 'bg-gradient-to-br from-white to-admin-primary/5 border-admin-primary/20' : ''}`}>
                            {config.highlight && <div className="absolute top-0 right-0 w-24 h-24 bg-admin-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>}
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 rounded-[1.5rem] bg-admin-bg shadow-inner border border-admin-border text-admin-text-main group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary group-hover:rotate-6 transition-all duration-500">
                                    {config.icon}
                                </div>
                                <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm ${data.trend === 'up' ? 'text-success bg-white border border-success/20' : 'text-danger bg-white border border-danger/20'}`}>
                                    {data.trend === 'up' ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                                    {data.sub}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-admin-text-muted mb-2">{config.label}</p>
                                <h2 className="text-3xl font-black text-admin-text-main tracking-tight group-hover:text-admin-primary transition-colors duration-500">
                                    {config.key === 'revenue' ? formatRupiah(data.value, false) : data.value}
                                </h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart Column */}
                <div className="lg:col-span-2 admin-table-container !p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black text-admin-text-main">Tren Tiket Harian</h3>
                            <p className="text-xs text-admin-text-muted font-bold">Data penjualan tiket masuk (30 hari terakhir)</p>
                        </div>
                        <button className="p-2 hover:bg-admin-bg rounded-lg text-admin-text-muted">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    
                    <div className="h-[320px] flex items-end gap-3 md:gap-5 px-2">
                        {dailyTickets.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="relative w-full flex flex-col items-center">
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-admin-text-main text-white text-[10px] font-black px-2 py-1.5 rounded-lg pointer-events-none z-10">
                                        {d.val} Tiket
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-admin-text-main rotate-45" />
                                    </div>
                                    <div
                                        className={`w-full max-w-[40px] rounded-2xl transition-all duration-1000 group-hover:scale-x-110 ${
                                            i === 5 ? 'bg-admin-primary shadow-lg shadow-admin-primary/40' : 'bg-admin-primary/20'
                                        }`}
                                        style={{ height: `${(d.val / maxTicket) * 240}px` }}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-wider group-hover:text-admin-primary transition-colors">Tgl {d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Composition Chart Column */}
                <div className="admin-table-container !p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-admin-text-main">Market Share</h3>
                        <div className="p-2 bg-admin-bg rounded-lg">
                            <BarIcon size={16} className="text-admin-text-muted" />
                        </div>
                    </div>

                    <div className="relative h-48 flex items-center justify-center translate-y-4">
                        <svg width="200" height="200" viewBox="0 0 42 42" className="transform -rotate-90">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="4"></circle>
                            
                            {/* Tiket Wisata */}
                            <circle 
                                cx="21" cy="21" r="15.915" fill="transparent" stroke="#C62828" strokeWidth="5.5" 
                                strokeDasharray={`${bookingTypes[0]?.val || 0} ${100 - (bookingTypes[0]?.val || 0)}`} 
                                strokeDashoffset="25" className="transition-all duration-1000"
                            ></circle>

                            {/* Resort Booking */}
                            <circle 
                                cx="21" cy="21" r="15.915" fill="transparent" stroke="#2E7D32" strokeWidth="5.5" 
                                strokeDasharray={`${bookingTypes[1]?.val || 0} ${100 - (bookingTypes[1]?.val || 0)}`} 
                                strokeDashoffset={25 - (bookingTypes[0]?.val || 0)} className="transition-all duration-1000"
                            ></circle>

                            {/* Event / Konser */}
                            <circle 
                                cx="21" cy="21" r="15.915" fill="transparent" stroke="#0284c7" strokeWidth="5.5" 
                                strokeDasharray={`${bookingTypes[2]?.val || 0} ${100 - (bookingTypes[2]?.val || 0)}`} 
                                strokeDashoffset={25 - (bookingTypes[0]?.val || 0) - (bookingTypes[1]?.val || 0)} className="transition-all duration-1000"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-black text-admin-text-muted uppercase">Total</span>
                            <span className="text-2xl font-black text-admin-text-main">100%</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        {bookingTypes.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-admin-bg/50 border border-admin-border hover:border-admin-primary/20 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                                    <span className="text-xs font-bold text-admin-text-muted group-hover:text-admin-text-main transition-colors">{t.label}</span>
                                </div>
                                <span className="text-sm font-black text-admin-text-main">{t.val}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
