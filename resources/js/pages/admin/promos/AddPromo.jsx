import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Ticket, CalendarDays, Coins, Type, Fingerprint, Loader2, Tag, Percent, ShoppingCart, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPromo() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        promo_code: '',
        name: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '0',
        start_date: '',
        end_date: '',
        applicable_to: 'ALL',
        usage_limit: '',
        is_active: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.post('/api/promos', {
                ...formData,
                discount_value: Number(formData.discount_value),
                min_purchase: Number(formData.min_purchase),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
            });
            toast.success('Promo baru berhasil dibuat');
            navigate('/admin/promos');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal membuat promo');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/promos')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Inisialisasi Voucher Baru</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="admin-card space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Konfigurasi Kupon</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Kode Voucher</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Fingerprint size={18} />
                                        </div>
                                        <input 
                                            required 
                                            placeholder="misal: HEMAT50"
                                            value={formData.promo_code} 
                                            onChange={e => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })} 
                                            type="text" 
                                            className="font-mono font-bold text-admin-primary"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nama Kampanye</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Type size={18} />
                                        </div>
                                        <input 
                                            required 
                                            placeholder="misal: Promo Awal Tahun"
                                            value={formData.name} 
                                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            type="text" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="form-group">
                                <label className="form-label">Tipe Diskon</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Percent size={18} />
                                    </div>
                                    <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })}>
                                        <option value="percentage">Persentase (%)</option>
                                        <option value="nominal">Nominal Tunai (Rp)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nilai Potongan</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Coins size={18} />
                                    </div>
                                    <input 
                                        required 
                                        value={formData.discount_value} 
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })} 
                                        type="number" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-admin-border">
                            <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-2">Target & Eligibilitas</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Berlaku Untuk</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <ShoppingCart size={18} />
                                        </div>
                                        <select value={formData.applicable_to} onChange={e => setFormData({ ...formData, applicable_to: e.target.value })}>
                                            <option value="ALL">Semua Layanan (Universal)</option>
                                            <option value="TICKET">Khusus Tiket Wisata</option>
                                            <option value="RESORT">Khusus Reservasi Resort</option>
                                            <option value="EVENT">Khusus Tiket Event</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Minimal Pembelian (Rp)</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Coins size={18} />
                                        </div>
                                        <input 
                                            required 
                                            value={formData.min_purchase} 
                                            onChange={e => setFormData({ ...formData, min_purchase: e.target.value })} 
                                            type="number" 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Batas Penggunaan (Opsional)</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Tag size={18} />
                                        </div>
                                        <input 
                                            value={formData.usage_limit} 
                                            onChange={e => setFormData({ ...formData, usage_limit: e.target.value })} 
                                            type="number" 
                                            placeholder="Cth: 100"
                                        />
                                    </div>
                                    <p className="text-[10px] text-admin-text-muted mt-1 italic">*Kosongkan jika tak terbatas</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-admin-border">
                            <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-2">Periode Aktif</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Tanggal Mulai</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <CalendarDays size={18} />
                                        </div>
                                        <input 
                                            required 
                                            value={formData.start_date} 
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })} 
                                            type="date" 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tanggal Berakhir</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <CalendarDays size={18} />
                                        </div>
                                        <input 
                                            required 
                                            value={formData.end_date} 
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
                                            type="date" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate('/admin/promos')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all uppercase tracking-widest text-[10px]">
                                Batal
                            </button>
                            <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]">
                                {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Menyimpan...' : 'Simpan Voucher'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="admin-card bg-admin-primary/5 border-admin-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-admin-primary text-white">
                                <Tag size={18} />
                            </div>
                            <h3 className="font-bold text-admin-text-main">Preview Voucher</h3>
                        </div>
                        <div className="relative p-8 rounded-[2.5rem] bg-white border border-admin-border shadow-xl shadow-admin-primary/5 overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-admin-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-3 rounded-2xl bg-admin-primary/10 text-admin-primary">
                                        <Ticket size={32} />
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${formData.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                            {formData.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-2xl font-black text-admin-primary font-mono tracking-tighter mb-1 uppercase">{formData.promo_code || 'CODE'}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                                            <Tag size={12} className="text-admin-primary" />
                                            {formData.name || 'Campaign Name'}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-dashed border-admin-border flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-tighter mb-1 opacity-60">Potongan Harga</p>
                                            <p className="text-2xl font-black text-admin-text-main leading-none tracking-tight">
                                                {formData.discount_type === 'percentage' ? `${formData.discount_value}%` : `Rp ${Number(formData.discount_value).toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-tighter mb-1 opacity-60">Syarat Min.</p>
                                            <p className="text-sm font-black text-admin-text-main leading-none">
                                                Rp {Number(formData.min_purchase).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-admin-text-muted mt-4 leading-relaxed italic">
                            *Preview visual ini membantu admin memverifikasi parameter kupon sebelum publikasi.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-admin-bg border border-admin-border">
                        <h4 className="text-xs font-bold text-admin-text-main mb-3 flex items-center gap-2">
                            <Info size={14} className="text-admin-primary" /> Aturan Validasi
                        </h4>
                        <ul className="text-[11px] text-admin-text-muted space-y-3">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-admin-primary mt-1 flex-shrink-0" />
                                <span>Promo akan muncul otomatis pada halaman Guest yang sesuai kategori.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-admin-primary mt-1 flex-shrink-0" />
                                <span>Sistem akan memvalidasi minimal transaksi sebelum diskon diterapkan.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-admin-primary mt-1 flex-shrink-0" />
                                <span>Gunakan tipe 'Universal' jika promo berlaku untuk tiket dan resort sekaligus.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
