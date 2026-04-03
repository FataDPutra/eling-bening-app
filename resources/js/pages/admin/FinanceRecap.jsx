import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import { TrendingUp, TrendingDown, DollarSign, Download, Calendar, PieChart, Loader2, MoreVertical, Search } from 'lucide-react';

export default function FinanceRecap() {
    const [allTransactions, setAllTransactions] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [transRes, expRes] = await Promise.all([
                axios.get('/api/transactions'),
                axios.get('/api/expenses')
            ]);
            setAllTransactions(transRes.data);
            setAllExpenses(expRes.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch finance data", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getFilteredSummary = () => {
        const filteredTrans = allTransactions.filter(b => {
            if (!['success', 'paid'].includes(b.status)) return false;
            if (isAllTime) return true;
            const date = new Date(b.created_at);
            return (date.getMonth() + 1) === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
        });

        const filteredExp = allExpenses.filter(e => {
            if (isAllTime) return true;
            const date = new Date(e.transaction_date);
            return (date.getMonth() + 1) === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
        });

        const income = filteredTrans.reduce((sum, b) => {
            const basePr = Number(b.total_price || 0);
            const addPr = (b.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0);
            const rescPr = (b.reschedules?.filter(r => {
                if (r.status !== 'completed') return false;
                if (isAllTime) return true;
                const rDate = new Date(r.paid_at || r.created_at);
                return (rDate.getMonth() + 1) === Number(selectedMonth) && rDate.getFullYear() === Number(selectedYear);
            }).reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0);
            return sum + basePr + addPr + rescPr;
        }, 0);

        const expense = filteredExp.reduce((sum, e) => sum + Number(e.amount), 0);

        const combined = [
            ...filteredTrans.map(b => ({
                id: b.id,
                date: b.created_at,
                itemName: b.booking_type === 'RESORT' ? `Resort: ${b.item_name || b.items?.[0]?.item?.name || 'Unit'}` : `Ticket: ${b.item_name || b.items?.[0]?.item?.name || 'Pass'}`,
                total: Number(b.total_price || 0) + (b.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0), // Not including resc in simple item view for brevity
                type: 'income',
                status: b.status
            })),
            ...filteredExp.map(e => ({
                id: e.id,
                date: e.transaction_date,
                itemName: e.name,
                total: Number(e.amount),
                type: 'expense',
                status: 'paid'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return { income, expense, combined };
    };

    const { income, expense, combined } = getFilteredSummary();

    return (
        <div className="animate-fade-in font-sans">
            <header className="admin-page-header">
                <div>
                    <h1>Rekapitulasi Keuangan</h1>
                    <p className="text-muted mt-1">Ringkasan arus kas masuk dan keluar kawasan.</p>
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
                                                className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                                                    !isAllTime && selectedMonth === m.value 
                                                    ? 'bg-admin-primary text-white' 
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
                    <button className="btn-primary-outline" onClick={() => window.print()}>
                        <Download size={18} /> Cetak Laporan
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="admin-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Pemasukan Bruto</span>
                        <div style={{ padding: '0.5rem', backgroundColor: '#ECFDF5', borderRadius: '50%', color: '#10B981' }}><TrendingUp size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{formatRupiah(income)}</h2>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Pengeluaran</span>
                        <div style={{ padding: '0.5rem', backgroundColor: '#FEF2F2', borderRadius: '50%', color: '#EF4444' }}><TrendingDown size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444' }}>{formatRupiah(expense)}</h2>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Saldo Bersih (Periodik)</span>
                        <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><DollarSign size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{formatRupiah(income - expense)}</h2>
                </div>
            </div>

            <div className="admin-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} className="text-primary" /> Histori Transaksi Gabungan ({isAllTime ? 'Seluruh Waktu' : `${months.find(m => m.value == selectedMonth).name} ${selectedYear}`})
                </h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Keterangan / Item</th>
                                <th>Jenis</th>
                                <th className="text-right">Jumlah</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center uppercase tracking-widest text-[10px] font-black text-admin-text-muted animate-pulse">Syncing audit logs...</td></tr>
                            ) : combined.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-admin-text-muted font-bold">Tidak ada transaksi ditemukan pada periode ini.</td></tr>
                            ) : combined.map((tr, i) => (
                                <tr key={i} className="hover:bg-admin-bg/50 transition-colors">
                                    <td>{new Date(tr.date).toLocaleDateString('id-ID')}</td>
                                    <td style={{ fontWeight: 600 }}>{tr.itemName}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            backgroundColor: tr.type === 'income' ? '#ECFDF5' : '#FFF7ED',
                                            color: tr.type === 'income' ? '#10B981' : '#F97316'
                                        }}>
                                            {tr.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </td>
                                    <td className="text-right" style={{ fontWeight: 700, color: tr.type === 'income' ? '#10B981' : '#EF4444' }}>
                                        {tr.type === 'income' ? '+' : '-'} {formatRupiah(tr.total)}
                                    </td>
                                    <td><span className={`badge ${tr.status === 'success' || tr.status === 'paid' || tr.status === 'completed' ? 'active' : 'pending'}`}>
                                        {tr.status === 'success' || tr.status === 'paid' || tr.status === 'completed' ? 'Completed' : tr.status}
                                    </span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
