import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Loader2, ChevronDown, ChevronUp, Calendar, RefreshCcw, MoreVertical } from 'lucide-react';
import { formatRupiah } from '../../utils/data';

export default function FinanceResort() {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
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
            const data = res.data;
            setAllTransactions(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch resort finance", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getFilteredData = () => {
        return allTransactions.filter(t => {
            if (t.booking_type !== 'RESORT' || !['success', 'paid'].includes(t.status) || t.parent_id) return false;
            
            if (isAllTime) return true;
            
            const date = new Date(t.created_at);
            return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
        });
    };

    const calculatePeriodTotal = () => {
        return allTransactions
            .filter(t => {
                const date = new Date(t.created_at);
                const isMatch = isAllTime || ((date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear);
                return isMatch && t.booking_type === 'RESORT' && ['success', 'paid'].includes(t.status);
            })
            .reduce((sum, t) => sum + Number(t.total_price || 0), 0) +
            allTransactions.reduce((acc, t) => {
                const resc = (t.reschedules?.filter(r => {
                    const rDate = new Date(r.paid_at || r.created_at);
                    const rMatch = isAllTime || ((rDate.getMonth() + 1) === selectedMonth && rDate.getFullYear() === selectedYear);
                    return r.status === 'completed' && rMatch;
                }).reduce((rSum, r) => rSum + Number(r.final_charge || 0), 0) || 0);
                return acc + resc;
            }, 0);
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const filteredList = getFilteredData();

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div>
                    <h1>Pemasukan Resort</h1>
                    <p className="text-muted mt-1">Laporan pendapatan dari penyewaan kamar dan fasilitas resort.</p>
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
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                        <Building size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pendapatan Resort ({isAllTime ? 'Seluruh Waktu' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`})</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            {isLoading ? 'Loading...' : formatRupiah(calculatePeriodTotal())}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="w-10 text-center"></th>
                            <th className="w-32">Tanggal</th>
                            <th>ID Transaksi</th>
                            <th>Nama Customer</th>
                            <th>Keterangan</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <Loader2 className="animate-spin text-admin-primary" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Syncing data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-admin-text-muted font-bold">Tidak ada transaksi resort pada periode ini.</td>
                            </tr>
                        ) : filteredList.map((t) => {
                            const paidAddons = allTransactions.filter(child => child.parent_id === t.id && ['paid', 'success'].includes(child.status));
                            const completedResc = t.reschedules?.filter(r => r.status === 'completed') || [];
                            const hasChildren = paidAddons.length > 0 || completedResc.length > 0;
                            const isExpanded = expandedRow === t.id;

                            const totalNett = Number(t.total_price || 0) + 
                                paidAddons.reduce((sum, a) => sum + Number(a.total_price || 0), 0) + 
                                completedResc.reduce((sum, r) => sum + Number(r.final_charge || 0), 0);
                            
                            return (
                                <React.Fragment key={t.id}>
                                    <tr 
                                        className={`transition-colors ${hasChildren ? 'cursor-pointer hover:bg-admin-bg/50' : ''} ${isExpanded ? 'bg-admin-bg font-black' : ''}`}
                                        onClick={() => hasChildren && toggleRow(t.id)}
                                    >
                                        <td className="text-center">
                                            {hasChildren && (
                                                isExpanded ? <ChevronUp size={16} className="text-admin-primary mx-auto" /> : <ChevronDown size={16} className="text-admin-text-light mx-auto" />
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-[11px] font-bold text-admin-text-muted">{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                                        </td>
                                        <td className="font-bold text-admin-text-main uppercase tracking-tighter">#{t.id}</td>
                                        <td>{t.booker_name || t.user?.name || 'Guest'}</td>
                                        <td>{t.item_name || t.items?.[0]?.item?.name || 'Unit'}</td>
                                        <td className="text-right font-black text-admin-primary">{formatRupiah(totalNett)}</td>
                                    </tr>

                                    {isExpanded && (
                                        <>
                                            <tr className="bg-admin-bg/20 border-l-4 border-admin-primary animate-fade-in text-[11px]">
                                                <td className="text-center opacity-30">—</td>
                                                <td>
                                                    <span className="font-bold text-admin-text-muted">{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                                                </td>
                                                <td className="font-bold text-admin-primary uppercase tracking-tighter">BASE BOOKING</td>
                                                <td className="text-admin-text-light">{t.booker_name || t.user?.name || 'Guest'}</td>
                                                <td className="italic text-admin-text-muted">Pemesanan Awal: {t.item_name || t.items?.[0]?.item?.name}</td>
                                                <td className="text-right font-bold text-admin-primary">{formatRupiah(t.total_price)}</td>
                                            </tr>

                                            {paidAddons.map((addon) => (
                                                <tr key={addon.id} className="bg-admin-bg/20 border-l-4 border-success animate-fade-in text-[11px]">
                                                    <td className="text-center opacity-30">—</td>
                                                    <td>
                                                        <span className="font-bold text-admin-text-muted">{new Date(addon.created_at).toLocaleDateString('id-ID')}</span>
                                                    </td>
                                                    <td className="font-bold text-success uppercase tracking-tighter">#{addon.id}</td>
                                                    <td className="text-admin-text-light">{addon.booker_name || addon.user?.name || 'Guest'}</td>
                                                    <td className="italic text-admin-text-muted">{addon.item_name || addon.items?.[0]?.item?.name || 'Add-on'}</td>
                                                    <td className="text-right font-bold text-success">{formatRupiah(addon.total_price)}</td>
                                                </tr>
                                            ))}
                                            
                                            {completedResc.map((resc, idx) => (
                                                <tr key={`resc-${idx}`} className="bg-admin-bg/20 border-l-4 border-warning animate-fade-in text-[11px]">
                                                    <td className="text-center opacity-30">—</td>
                                                    <td>
                                                        <span className="font-bold text-admin-text-muted">{new Date(resc.paid_at || resc.created_at).toLocaleDateString('id-ID')}</span>
                                                    </td>
                                                    <td className="font-bold text-warning uppercase tracking-tighter flex items-center gap-1">
                                                        <RefreshCcw size={10} /> RESCHEDULE
                                                    </td>
                                                    <td className="text-admin-text-light">{t.booker_name || t.user?.name}</td>
                                                    <td className="italic text-admin-text-muted">Biaya Pindah Jadwal</td>
                                                    <td className="text-right font-bold text-warning">+{formatRupiah(resc.final_charge)}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
