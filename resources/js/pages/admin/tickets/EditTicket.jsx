import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Ticket, CalendarDays, Coins, Type, Fingerprint, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import MediaUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

export default function EditTicket() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState(null);

    const fetchTicket = async () => {
        try {
            const res = await axios.get(`/api/tickets/${id}`);
            setFormData(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch ticket", error);
            toast.error('Gagal mengambil data tiket');
            navigate('/admin/tickets');
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.put(`/api/tickets/${id}`, {
                ...formData,
                price: Number(formData.price)
            });
            toast.success('Perubahan berhasil disimpan');
            navigate('/admin/tickets');
        } catch (error) {
            console.error("Failed to update ticket", error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 text-admin-text-muted">
            <Loader2 className="animate-spin mb-4 text-admin-primary" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Authenticating Ticket Data...</p>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/tickets')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Edit Kategori Tiket</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="admin-card space-y-6">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Update Konfigurasi</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group opacity-60">
                                <label className="form-label">ID Tiket (Read Only)</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Fingerprint size={18} />
                                    </div>
                                    <input value={formData.id} readOnly type="text" className="bg-slate-50 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nama / Jenis Tiket</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Type size={18} />
                                    </div>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="misal: Tiket Terusan" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Hari Berlaku</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <CalendarDays size={18} />
                                    </div>
                                    <select value={formData.validity_day} onChange={e => setFormData({ ...formData, validity_day: e.target.value })}>
                                        <option value="weekday">Weekday Only</option>
                                        <option value="weekend">Weekend Only</option>
                                        <option value="all_days">Setiap Hari (All Days)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga Tiket</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Coins size={18} />
                                        <span className="ml-1 text-sm font-bold">Rp</span>
                                    </div>
                                    <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="number" placeholder="0" className="w-full" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi Singkat</label>
                            <textarea required rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-textarea" placeholder="Jelaskan fasilitas atau area yang bisa diakses dengan tiket ini..."></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status Aktivasi</label>
                            <div className="form-input-group">
                                <select value={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}>
                                    <option value="true">Aktif (Tampil di Guest)</option>
                                    <option value="false">Non-aktif (Sembunyikan)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group pb-4">
                            <label className="form-label flex items-center gap-2">
                                <ImageIcon size={14} className="text-admin-primary" /> Gambar Unggulan Tiket
                            </label>
                            <div className="p-6 bg-admin-bg rounded-[2rem] border-2 border-dashed border-admin-border hover:border-admin-primary transition-all">
                                <MediaUpload 
                                    images={formData.image ? [formData.image] : []} 
                                    setImages={(newImages) => setFormData({ ...formData, image: newImages[0] || '' })} 
                                    maxImages={1} 
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate('/admin/tickets')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                                Batal
                            </button>
                            <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20 disabled:opacity-50">
                                {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="admin-card bg-admin-primary/5 border-admin-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-admin-primary text-white">
                                <Ticket size={18} />
                            </div>
                            <h3 className="font-bold text-admin-text-main">Preview Kartu</h3>
                        </div>
                        <div className="relative p-6 rounded-[2rem] bg-white border border-admin-border shadow-xl shadow-admin-primary/5 overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02]">
                            <img src={formData.image || "/images/hero-bg.png"} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-2xl bg-admin-primary/10 text-admin-primary">
                                        <Ticket size={24} />
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${formData.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                            {formData.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-black text-admin-text-main leading-tight mb-1">{formData.name || 'Updating Ticket'}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                                            <CalendarDays size={12} className="text-admin-primary" />
                                            {formData.validity_day.replace('_', ' ')}
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-admin-text-muted leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                        {formData.description || 'Reviewing the latest updates to this ticket configuration...'}
                                    </p>

                                    <div className="pt-4 border-t border-dashed border-admin-border flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-tighter mb-1 opacity-60">Entry Price</p>
                                            <p className="text-xl font-black text-admin-primary leading-none tracking-tight">
                                                Rp {(Number(formData.price) || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-admin-bg border border-admin-border flex items-center justify-center opacity-30">
                                            <Fingerprint size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-admin-text-muted mt-4 leading-relaxed italic">
                            *Setiap perubahan akan langsung berdampak pada halaman pemesanan pengunjung.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-admin-bg border border-admin-border">
                        <h4 className="text-xs font-bold text-admin-text-main mb-2 flex items-center gap-2">
                            <Coins size={14} className="text-admin-primary" /> Tips Pengaturan
                        </h4>
                        <ul className="text-[11px] text-admin-text-muted space-y-2">
                            <li>• Pastikan harga yang diubah sudah mencakup pajak & layanan.</li>
                            <li>• Update deskripsi jika ada perubahan fasilitas area.</li>
                            <li>• Non-aktifkan tiket jika kuota kunjungan sudah penuh.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
