import { useNavigate } from 'react-router-dom';
import { CircleDollarSign, TrendingUp, TrendingDown, FileText, ArrowRight, Wallet, Building, Ticket, Download, PieChart, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatRupiah } from '../../utils/data';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Finance() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
    const [allTransactions, setAllTransactions] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [transRes, expRes] = await Promise.all([
                axios.get('/api/transactions'),
                axios.get('/api/expenses')
            ]);

            const transactions = transRes.data;
            const expenses = expRes.data;
            setAllTransactions(transactions);
            setAllExpenses(expenses);

            const totalIncome = transactions
                .filter(b => ['success', 'paid'].includes(b.status))
                .reduce((sum, b) => {
                    const base = Number(b.total_price || 0);
                    const addons = (b.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0);
                    const resc = (b.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0);
                    return sum + base + addons + resc;
                }, 0);

            const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

            setStats({
                income: totalIncome,
                expense: totalExpense,
                balance: totalIncome - totalExpense
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch finance stats", error);
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (allTransactions.length === 0 && allExpenses.length === 0) {
            alert("Tidak ada data finansial untuk diekspor");
            return;
        }

        const exportDate = new Date().toLocaleString('id-ID');
        const combined = [
            ...allTransactions.filter(b => ['success', 'paid'].includes(b.status)).map(b => ({
                date: b.created_at,
                name: b.booking_type === 'RESORT' ? `Resort: ${b.booker_name || b.user?.name}` : `Ticket: ${b.booker_name || b.user?.name}`,
                type: 'INCOME',
                amount: Number(b.total_price || 0) + (b.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0)
            })),
            ...allExpenses.map(e => ({
                date: e.transaction_date,
                name: e.name,
                type: 'EXPENSE',
                amount: -Number(e.amount)
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        const csvRows = [
            [`"LAPORAN AUDIT FINANSIAL KESELURUHAN - ELING BENING"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['"RINGKASAN EKSEKUTIF"'],
            [`"TOTAL PENDAPATAN (BRUTO)",${stats.income}`],
            [`"TOTAL PENGELUARAN",${stats.expense}`],
            [`"PROFIT/LOSS (NET)",${stats.balance}`],
            [''],
            ['"DETAIL ARUS KAS KESELURUHAN"'],
            ['"Tanggal"', '"Keterangan / Aktivitas"', '"Kategori"', '"Jumlah (IDR)"'],
            ...combined.map(row => [
                new Date(row.date).toLocaleDateString('id-ID'),
                `"${row.name}"`,
                row.type,
                row.amount
            ].join(',')),
            [''],
            ['', '"FINAL AUDIT BALANCE:"', '', stats.balance]
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Audit_Finansial_Keseluruhan_Eling_Bening.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const menuItems = [
        {
            title: 'Rekapitulasi Keuangan',
            desc: 'Ringkasan arus kas masuk dan keluar secara keseluruhan.',
            icon: <CircleDollarSign size={24} />,
            link: '/admin/finance/recap',
            color: 'var(--primary)',
            tag: 'Utama'
        },
        {
            title: 'Pengeluaran Operasional',
            desc: 'Catat dan kelola biaya pemeliharaan, gaji, dan lainnya.',
            icon: <TrendingDown size={24} />,
            link: '/admin/finance/expenses',
            color: '#EF4444',
            tag: 'Cost'
        },
        {
            title: 'Pendapatan Tiket',
            desc: 'Detail transaksi harian dari penjualan tiket masuk.',
            icon: <Ticket size={24} />,
            link: '/admin/finance/tickets',
            color: '#F59E0B',
            tag: 'Revenue'
        },
        {
            title: 'Pendapatan Resort',
            desc: 'Analisis pendapatan dari pemesanan kamar dan villa.',
            icon: <Building size={24} />,
            link: '/admin/finance/resort',
            color: '#3B82F6',
            tag: 'Revenue'
        }
    ];

    return (
        <div className="animate-fade-in space-y-10">
            <div className="admin-page-header">
                <div>
                    <h1>Pusat Keuangan</h1>
                    <p>Sistem informasi akuntansi, pelaporan laba rugi, dan rekonsiliasi kas.</p>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 stat-card !p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-admin-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-text-muted mb-3 flex items-center gap-2">
                                <Landmark size={12} className="text-admin-primary" /> Net Profit Margin (All Time)
                            </p>
                            <h2 className="text-5xl font-black text-admin-text-main tracking-tight mb-6">
                                {isLoading ? '...' : formatRupiah(stats.balance)}
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-5 py-3 rounded-2xl bg-success/5 border border-success/10">
                                    <p className="text-[9px] font-black text-success uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <ArrowUpRight size={10} /> Total Income
                                    </p>
                                    <p className="text-lg font-black text-admin-text-main">{isLoading ? '...' : formatRupiah(stats.income)}</p>
                                </div>
                                <div className="px-5 py-3 rounded-2xl bg-danger/5 border border-danger/10">
                                    <p className="text-[9px] font-black text-danger uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <ArrowDownRight size={10} /> Total Expense
                                    </p>
                                    <p className="text-lg font-black text-admin-text-main">{isLoading ? '...' : formatRupiah(stats.expense)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem] bg-admin-primary text-white flex items-center justify-center shadow-2xl shadow-admin-primary/40 rotate-12 group-hover:rotate-0 transition-all duration-500">
                            <Wallet size={48} className="md:size-48" />
                        </div>
                    </div>
                </div>

                <div className="stat-card !p-10 flex flex-col justify-center items-center text-center space-y-6 bg-admin-text-main text-white border-none shadow-2xl shadow-slate-900/20">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <FileText size={32} className="text-admin-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-2">Audit Report</h3>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">Seluruh data finansial disinkronkan secara real-time dari database.</p>
                    </div>
                    <button className="btn-primary !bg-white !text-admin-text-main w-full py-3.5 justify-center shadow-xl shadow-white/5 hover:scale-105 transition-all" onClick={handleExport}>
                        <PieChart size={18} /> Print Financial Report
                    </button>
                </div>
            </div>

            {/* Sub-Modules Section */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-admin-primary rounded-full" />
                    <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Financial Modules</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-8 rounded-[2.5rem] border border-admin-border hover:border-admin-primary transition-all duration-500 hover:shadow-2xl hover:shadow-admin-primary/5 cursor-pointer group flex flex-col items-start"
                            onClick={() => navigate(item.link)}
                        >
                            <div className="flex justify-between items-start w-full mb-8">
                                <div className="p-4 rounded-2xl transition-all duration-500" 
                                     style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full`}
                                      style={{ backgroundColor: `${item.color}08`, color: item.color, border: `1px solid ${item.color}15` }}>
                                    {item.tag}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-admin-text-main mb-3 group-hover:text-admin-primary transition-colors">{item.title}</h4>
                            <p className="text-xs text-admin-text-muted font-bold leading-relaxed mb-8 flex-1">{item.desc}</p>
                            <div className="w-full h-px bg-admin-border mb-6 group-hover:bg-admin-primary/20 transition-colors" />
                            <div className="flex items-center gap-3 font-black text-[10px] text-admin-primary uppercase tracking-widest group-hover:gap-5 transition-all">
                                Open Module <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
