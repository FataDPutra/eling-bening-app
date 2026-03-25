import { Building, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../utils/data';

export default function FinanceResort() {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div>
                    <h1>Pemasukan Resort</h1>
                    <p className="text-muted mt-1">Laporan pendapatan dari penyewaan kamar dan fasilitas resort.</p>
                </div>
            </header>

            <div className="admin-card mb-8">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                        <Building size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pendapatan Resort (Bulan Ini)</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{formatRupiah(217500000)}</h2>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Pesanan</th>
                            <th>Nama Tamu</th>
                            <th>Tipe Kamar</th>
                            <th>Total Bayar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td>EB-RS-772{i}</td>
                                <td>Customer {i + 1}</td>
                                <td>Executive Lake Suite</td>
                                <td style={{ fontWeight: 600 }}>{formatRupiah(1850000)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
