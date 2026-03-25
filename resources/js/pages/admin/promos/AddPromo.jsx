import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPromos, savePromos } from '../../../utils/data';
import toast from 'react-hot-toast';

export default function AddPromo() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ code: '', name: '', discount: '', type: 'percentage', minPurchase: 0, status: 'active', expiry: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const promos = getPromos();
        const newId = promos.length > 0 ? Math.max(...promos.map(p => p.id)) + 1 : 1;
        const updated = [...promos, { ...formData, id: newId, discount: Number(formData.discount), minPurchase: Number(formData.minPurchase) }];
        savePromos(updated);
        toast.success('Promo berhasil ditambahkan');
        navigate('/admin/promos');
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/promos')} className="flex items-center text-muted hover:text-main mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar Promo
                    </button>
                    <h1>Tambah Promo Baru</h1>
                </div>
            </div>

            <div className="admin-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">Kode Promo</label>
                            <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} type="text" className="admin-input" placeholder="EBNEW2026" />
                        </div>
                        <div>
                            <label className="admin-label">Nama Promo</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input" placeholder="Diskon Awal Tahun" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">Tipe Diskon</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="admin-input">
                                <option value="percentage">Persentase (%)</option>
                                <option value="fixed">Potongan Harga (Rp)</option>
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">Nilai Diskon</label>
                            <input required value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} type="number" className="admin-input" placeholder={formData.type === 'percentage' ? '10' : '20000'} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">Minimal Pembelian (Rp)</label>
                            <input required value={formData.minPurchase} onChange={e => setFormData({ ...formData, minPurchase: e.target.value })} type="number" className="admin-input" />
                        </div>
                        <div>
                            <label className="admin-label">Tanggal Berakhir</label>
                            <input required value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })} type="date" className="admin-input" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" onClick={() => navigate('/admin/promos')} className="btn-primary-outline" style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Simpan Promo</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
