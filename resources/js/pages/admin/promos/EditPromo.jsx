import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPromos, savePromos } from '../../../utils/data';
import toast from 'react-hot-toast';

export default function EditPromo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const promos = getPromos();
        const promo = promos.find(p => p.id === Number(id));
        if (promo) {
            setFormData(promo);
        } else {
            toast.error('Promo tidak ditemukan');
            navigate('/admin/promos');
        }
    }, [id, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const promos = getPromos();
        const updated = promos.map(p => p.id === Number(id) ? { ...formData, discount: Number(formData.discount), minPurchase: Number(formData.minPurchase) } : p);
        savePromos(updated);
        toast.success('Perubahan berhasil disimpan');
        navigate('/admin/promos');
    };

    if (!formData) return <div className="p-8 text-center text-muted">Loading...</div>;

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/promos')} className="flex items-center text-muted hover:text-main mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar Promo
                    </button>
                    <h1>Edit Promo</h1>
                </div>
            </div>

            <div className="admin-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">Kode Promo</label>
                            <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} type="text" className="admin-input" />
                        </div>
                        <div>
                            <label className="admin-label">Nama Promo</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input" />
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
                            <input required value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} type="number" className="admin-input" />
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
                        <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
