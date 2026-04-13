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

    const handleExport = () => {
        if (combined.length === 0) {
            alert("Tidak ada data untuk periode ini");
            return;
        }

        const periodTitle = isAllTime ? 'TOTAL SEMUA PERIODE' : `${months.find(m => m.value === selectedMonth).name.toUpperCase()} ${selectedYear}`;
        const exportDate = new Date().toLocaleString('id-ID');

        const csvRows = [
            [`"LAPORAN REKAPITULASI KEUANGAN - ELING BENING"`],
            [`"PERIODE: ${periodTitle}"`],
            [`"TANGGAL EKSPOR: ${exportDate}"`],
            [''],
            ['"RINGKASAN"'],
            [`"TOTAL PEMASUKAN",${income}`],
            [`"TOTAL PENGELUARAN",${expense}`],
            [`"SALDO BERSIH",${income - expense}`],
            [''],
            ['"DETAIL ARUS KAS"'],
            ['"Tanggal"', '"Keterangan / Item"', '"Jenis"', '"Jumlah (IDR)"', '"Status"'],
            ...combined.map(tr => [
                new Date(tr.date).toLocaleDateString('id-ID'),
                `"${tr.itemName}"`,
                tr.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN',
                tr.type === 'income' ? tr.total : -tr.total,
                tr.status.toUpperCase()
            ].join(',')),
            [''],
            ['', '"FINAL BALANCE:"', '', income - expense, '']
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        const fileName = isAllTime ? 'Rekap_Keuangan_Semua_Periode.csv' : `Rekap_Keuangan_${months.find(m => m.value === selectedMonth).name}_${selectedYear}.csv`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tight uppercase">Rekapitulasi Keuangan</h1>
                    <p className="text-xs md:text-sm text-admin-text-muted font-bold">Ringkasan arus kas masuk dan keluar kawasan (Cash Flow Analysis).</p>
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
                    <button 
                        onClick={handleExport}
                        className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20 h-[45px] w-full sm:w-auto"
                    >
                        <Download size={18} /> Cetak Laporan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="admin-card !border-l-4 !border-emerald-500 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-admin-text-muted">Total Pemasukan</span>
                        <div className="p-2 bg-emerald-50 rounded-full text-emerald-500"><TrendingUp size={18} /></div>
                    </div>
                    <h2 className="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(income)}</h2>
                </div>
                <div className="admin-card !border-l-4 !border-rose-500 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-admin-text-muted">Total Pengeluaran</span>
                        <div className="p-2 bg-rose-50 rounded-full text-rose-500"><TrendingDown size={18} /></div>
                    </div>
                    <h2 className="text-3xl font-black text-rose-600 tracking-tight">{formatRupiah(expense)}</h2>
                </div>
                <div className="admin-card !border-l-4 !border-admin-primary bg-admin-primary/5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-admin-primary">Laba / Rugi Bersih</span>
                        <div className="p-2 bg-white rounded-full text-admin-primary shadow-sm"><DollarSign size={18} /></div>
                    </div>
                    <h2 className="text-3xl font-black text-admin-text-main tracking-tight">{formatRupiah(income - expense)}</h2>
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
                                <th className="px-6 whitespace-nowrap">Tanggal</th>
                                <th className="px-6 whitespace-nowrap">Keterangan / Item</th>
                                <th className="px-6 whitespace-nowrap">Jenis</th>
                                <th className="px-6 whitespace-nowrap !text-right">Jumlah</th>
                                <th className="px-6 whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center uppercase tracking-[0.2em] text-[10px] font-black text-admin-text-muted animate-pulse">Sinkronisasi Data Audit...</td></tr>
                            ) : combined.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-admin-text-muted font-bold">Tidak ada transaksi ditemukan pada periode ini.</td></tr>
                            ) : combined.map((tr, i) => (
                                <tr key={i} className="hover:bg-admin-bg/50 transition-colors">
                                    <td className="px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-admin-text-light opacity-30"></span>
                                            <span className="text-[11px] font-bold text-admin-text-muted">{new Date(tr.date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 font-bold text-admin-text-main text-sm">{tr.itemName}</td>
                                    <td className="px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            tr.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            {tr.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </td>
                                    <td className={`px-6 !text-right font-black ${tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tr.type === 'income' ? '+' : '-'} {formatRupiah(tr.total)}
                                    </td>
                                    <td className="px-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            tr.status === 'success' || tr.status === 'paid' || tr.status === 'completed' 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            {tr.status === 'success' || tr.status === 'paid' || tr.status === 'completed' ? 'Berhasil' : 'Menunggu'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
