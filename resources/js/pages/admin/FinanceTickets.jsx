import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Loader2, Calendar, MoreVertical } from 'lucide-react';
import { formatRupiah } from '../../utils/data';

export default function FinanceTickets() {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
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
            const res = await axios.get('/api/transactions');
            setAllTransactions(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch ticket finance", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getFilteredData = () => {
        return allTransactions.filter(t => {
            if (t.booking_type !== 'TICKET' || !['success', 'paid'].includes(t.status)) return false;
            if (isAllTime) return true;
            const date = new Date(t.created_at);
            return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
        });
    };

    const calculatePeriodTotal = () => {
        return getFilteredData().reduce((sum, t) => sum + Number(t.total_price || 0), 0);
    };

    const filteredList = getFilteredData();

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div>
                    <h1>Pemasukan Tiket</h1>
                    <p className="text-muted mt-1">Detail rincian pendapatan dari penjualan tiket masuk.</p>
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
                </div>
            </header>

            <div className="admin-card mb-8">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pendapatan Tiket ({isAllTime ? 'Seluruh Waktu' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`})</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {isLoading ? 'Loading...' : formatRupiah(calculatePeriodTotal())}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>ID Pesanan</th>
                            <th>Item Tiket</th>
                            <th>Jumlah Beli</th>
                            <th className="text-right">Total Bayar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <Loader2 className="animate-spin text-admin-primary" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Syncing data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-admin-text-muted font-bold">Tidak ada transaksi tiket pada periode ini.</td>
                            </tr>
                        ) : filteredList.map((t, i) => (
                            <tr key={i} className="hover:bg-admin-bg/50 transition-colors">
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-admin-text-light" />
                                        <span>{new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </td>
                                <td className="font-bold text-admin-text-main">#{t.id}</td>
                                <td>{t.item_name || t.items?.[0]?.item?.name || 'Tiket'}</td>
                                <td className="font-black text-admin-primary">{t.total_qty} <span className="text-[10px] text-admin-text-muted">PAX</span></td>
                                <td className="text-right font-bold text-admin-primary">{formatRupiah(t.total_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
