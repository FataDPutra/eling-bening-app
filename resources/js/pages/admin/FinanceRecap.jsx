import { useState, useEffect } from 'react';
import { getBookings, getExpenses, formatRupiah } from '../../utils/data';
import { TrendingUp, TrendingDown, DollarSign, Download, Calendar, PieChart } from 'lucide-react';

export default function FinanceRecap() {
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [recentTrans, setRecentTrans] = useState([]);

    useEffect(() => {
        const bookings = getBookings();
        const expenses = getExpenses();

        const totalIncome = bookings.filter(b => b.status === 'success').reduce((sum, b) => sum + b.total, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

        setSummary({
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        });

        const combined = [
            ...bookings.map(b => ({ ...b, type: 'income' })),
            ...expenses.map(e => ({ ...e, itemName: e.title, total: e.amount, type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setRecentTrans(combined.slice(0, 10));
    }, []);

    return (
        <div className="animate-fade-in font-sans">
            <div className="admin-page-header">
                <div>
                    <h1>Rekapitulasi Keuangan</h1>
                    <p className="text-muted mt-1">Ringkasan arus kas masuk dan keluar kawasan.</p>
                </div>
                <button className="btn-primary-outline" onClick={() => window.print()}>
                    <Download size={18} /> Cetak Laporan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="admin-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Pemasukan</span>
                        <div style={{ padding: '0.5rem', backgroundColor: '#ECFDF5', borderRadius: '50%', color: '#10B981' }}><TrendingUp size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{formatRupiah(summary.income)}</h2>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Pengeluaran</span>
                        <div style={{ padding: '0.5rem', backgroundColor: '#FEF2F2', borderRadius: '50%', color: '#EF4444' }}><TrendingDown size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444' }}>{formatRupiah(summary.expense)}</h2>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Saldo Akhir (Profit)</span>
                        <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><DollarSign size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{formatRupiah(summary.balance)}</h2>
                </div>
            </div>

            <div className="admin-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} className="text-primary" /> Histori Transaksi Gabungan
                </h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Keterangan / Item</th>
                                <th>Jenis</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrans.map((tr, i) => (
                                <tr key={i}>
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
                                    <td style={{ fontWeight: 700, color: tr.type === 'income' ? '#10B981' : '#EF4444' }}>
                                        {tr.type === 'income' ? '+' : '-'} {formatRupiah(tr.total)}
                                    </td>
                                    <td><span className="badge active">Completed</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
