import { Receipt, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../utils/data';

export default function FinanceTickets() {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div>
                    <h1>Pemasukan Tiket</h1>
                    <p className="text-muted mt-1">Detail rincian pendapatan dari penjualan tiket masuk.</p>
                </div>
            </header>

            <div className="admin-card mb-8">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pendapatan Tiket (Bulan Ini)</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatRupiah(124500000)}</h2>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Item Tiket</th>
                            <th>Jumlah Terjual</th>
                            <th>Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td>0{i + 1} Maret 2026</td>
                                <td>Tiket Masuk Dewasa</td>
                                <td>432</td>
                                <td style={{ fontWeight: 600 }}>{formatRupiah(21600000)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
