import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ticket, Building, TrendingUp, Download, MoreVertical, Wallet, Calendar, Bell, Activity } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [stats, setStats] = useState({
        activeTickets: 0,
        totalRooms: 0,
        availableRooms: 0,
        todayRevenue: 0
    });
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [resortsRes, ticketsRes, transactionsRes] = await Promise.all([
                axios.get('/api/resorts'),
                axios.get('/api/tickets'),
                axios.get('/api/transactions')
            ]);

            const tickets = ticketsRes.data;
            const rooms = resortsRes.data;
            const allBookings = transactionsRes.data;
            setBookings(allBookings);

            const today = new Date().toISOString().split('T')[0];
            const todayRev = allBookings
                .filter(b => b.check_in_date && b.check_in_date.startsWith(today) && (b.status === 'success' || b.status === 'paid'))
                .reduce((sum, b) => sum + Number(b.total_price), 0);

            setStats({
                activeTickets: tickets.filter(t => t.is_active).length,
                totalRooms: rooms.length,
                availableRooms: rooms.filter(r => r.stock > 0).length,
                todayRevenue: todayRev
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Gagal sinkronisasi data dashboard");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const downloadReport = () => {
        const headers = ['Order ID', 'Pelanggan', 'Item', 'Tanggal', 'Total', 'Status'];
        const csvRows = [
            headers.join(','),
            ...bookings.map(b => [
                b.id,
                b.user?.name || 'Guest',
                `"${b.item?.name || 'Unknown Item'}"`,
                new Date(b.check_in_date).toLocaleDateString('id-ID'),
                b.total_price,
                b.status
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `laporan_eling_bening_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Laporan berhasil diunduh');
    };

    const statCards = [
        { title: 'Today Revenue', value: formatRupiah(stats.todayRevenue), icon: Wallet, color: '#C62828', sub: '+12.5%', trend: 'up' },
        { title: 'Kamar Tersedia', value: `${stats.availableRooms}/${stats.totalRooms}`, icon: Building, color: '#2E7D32', sub: 'Optimal', trend: 'up' },
        { title: 'Tiket Aktif', value: stats.activeTickets, icon: Ticket, color: '#F59E0B', sub: '-2.4%', trend: 'down' },
        { title: 'Pengunjung', value: '1,245', icon: Users, color: '#3B82F6', sub: '+5.2%', trend: 'up' }
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
            <div className="admin-page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Selamat datang kembali, Administrator. Berikut ringkasan operasional hari ini.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all">
                        <Calendar size={16} className="text-admin-primary" /> Maret 2024
                    </button>
                    <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20" onClick={downloadReport}>
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border border-admin-border hover:shadow-2xl hover:shadow-admin-primary/5 hover:border-admin-primary/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-admin-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-main group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all duration-500 shadow-sm">
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
                            <h3 className="text-4xl font-black text-admin-text-main tracking-tighter">
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analytics Chart */}
                <div className="lg:col-span-2 admin-table-container !p-10 space-y-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Traffic Visitors</h3>
                            <p className="text-xs text-admin-text-muted font-bold">Total pengunjung kawasan dalam 7 hari terakhir</p>
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

                    <div className="relative h-64 w-full translate-x-[-10px]">
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
                <div className="admin-table-container !p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Feeds</h3>
                        </div>
                        <button className="p-2 hover:bg-admin-bg rounded-lg text-admin-text-muted">
                            <Bell size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
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
                        ) : bookings.slice(0, 8).map((b, i) => (
                            <div key={i} className="flex gap-5 items-start">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-admin-bg border border-admin-border flex items-center justify-center text-admin-primary/40 font-black text-xs uppercase shadow-inner">
                                        {b.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${b.status === 'success' || b.status === 'paid' ? 'bg-success' : 'bg-warning'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-admin-text-main uppercase tracking-tight truncate">{b.user?.name || 'Guest User'}</h4>
                                    <p className="text-[11px] text-admin-text-muted font-bold leading-tight truncate">
                                        Pesan <span className="text-admin-text-main">{b.item?.name || 'Item'}</span>
                                    </p>
                                    <p className="text-[9px] text-admin-text-light font-black uppercase tracking-widest mt-1">
                                        {new Date(b.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • CLOUD SYNC
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-admin-primary">+{formatRupiah(b.total_price / 1000)}k</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/admin/bookings" className="mt-10 py-4 w-full rounded-2xl bg-admin-bg text-admin-text-main font-black text-[10px] uppercase tracking-[0.2em] border border-admin-border hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all text-center">
                        Lihat Semua Aktivitas
                    </Link>
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
