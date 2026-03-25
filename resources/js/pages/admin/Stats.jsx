import { BarChart as BarIcon, TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, Calendar, Download, MoreHorizontal } from 'lucide-react';

export default function Stats() {
    const stats = [
        { label: 'Tiket Terjual', value: '8.420', sub: '+12.5%', trend: 'up', icon: <TrendingUp size={20} className="text-admin-primary" /> },
        { label: 'Reservasi Kamar', value: '213', sub: '+5.2%', trend: 'up', icon: <Users size={20} className="text-admin-primary" /> },
        { label: 'Occupancy Rate', value: '76%', sub: '-2.1%', trend: 'down', icon: <BarIcon size={20} className="text-info" /> },
        { label: 'Revenue/Month', value: 'Rp 342M', sub: '+18.4%', trend: 'up', icon: <Wallet size={20} className="text-admin-primary" />, highlight: true }
    ];

    // Mock data for Bar Chart
    const dailyTickets = [
        { day: '01', val: 240 }, { day: '05', val: 320 }, { day: '10', val: 580 },
        { day: '15', val: 410 }, { day: '20', val: 650 }, { day: '25', val: 890 },
        { day: '30', val: 720 }
    ];
    const maxTicket = Math.max(...dailyTickets.map(d => d.val));

    // Mock data for Doughnut
    const bookingTypes = [
        { label: 'Tiket Reguler', val: 65, color: '#C62828' },
        { label: 'Resort Booking', val: 25, color: '#2E7D32' },
        { label: 'Paket Rombongan', val: 10, color: '#F59E0B' }
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Statistik & Analytics</h1>
                    <p>Pantau performa bisnis dan tren operasional secara real-time.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-bold text-sm hover:bg-admin-bg transition-all shadow-sm">
                            <Calendar size={16} className="text-admin-primary" /> Maret 2024
                        </button>
                    </div>
                    <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20">
                        <Download size={18} /> Export Laporan
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className={`stat-card group hover:scale-[1.02] transition-all duration-300 ${s.highlight ? 'bg-admin-primary/5 border-admin-primary/10' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-white shadow-sm border border-admin-border group-hover:bg-admin-primary group-hover:text-white transition-colors">
                                {s.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${s.trend === 'up' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                                {s.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {s.sub}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted mb-1">{s.label}</p>
                        <h2 className="text-3xl font-black text-admin-text-main">{s.value}</h2>
                    </div>
                ))}
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
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#C62828" strokeWidth="5.5" strokeDasharray="65 35" strokeDashoffset="25" className="transition-all duration-1000"></circle>
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2E7D32" strokeWidth="5.5" strokeDasharray="25 75" strokeDashoffset="60" className="transition-all duration-1000"></circle>
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="5.5" strokeDasharray="10 90" strokeDashoffset="35" className="transition-all duration-1000"></circle>
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
