import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Tag, Type, Loader2 } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`/api/events`);
                const event = data.find(ev => ev.id === parseInt(id));
                if (event) {
                    setFormData({
                        ...event,
                        images: Array.isArray(event.images) ? event.images : (event.image ? [event.image] : [])
                    });
                } else {
                    toast.error('Event tidak ditemukan');
                    navigate('/admin/events');
                }
            } catch (error) {
                toast.error('Gagal mengambil data event');
                navigate('/admin/events');
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const loadingToast = toast.loading('Memperbarui event...');
        
        try {
            await axios.put(`/api/events/${id}`, formData);
            toast.success('Event berhasil diperbarui', { id: loadingToast });
            navigate('/admin/events');
        } catch (error) {
            toast.error('Gagal memperbarui event', { id: loadingToast });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!formData) return (
        <div className="flex flex-col items-center justify-center p-20 text-admin-text-muted">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Memuat data event...</p>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/events')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Edit Event</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Left Side: General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Informasi Event</h3>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Nama Event / Paket</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input pl-10" placeholder="misal: Wedding Sunset Package" />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Deskripsi Lengkap</label>
                                <textarea required rows="8" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-textarea" placeholder="Jelaskan detail event, fasilitas yang didapat, dan informasi penting lainnya..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Galeri Foto Event</h3>
                        <ImageUpload 
                            images={formData.images} 
                            onChange={(images) => setFormData({ ...formData, images })} 
                        />
                    </div>
                </div>

                {/* Right Side: Category & Schedule */}
                <div className="space-y-6">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Kategori & Jadwal</h3>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Kategori Event</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="admin-input pl-10">
                                        <option>Wedding</option>
                                        <option>Gathering</option>
                                        <option>Concert</option>
                                        <option>Exhibition</option>
                                        <option>Meeting</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Jadwal / Tanggal</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                    <input required value={formData.date_info} onChange={e => setFormData({ ...formData, date_info: e.target.value })} type="text" className="admin-input pl-10" placeholder="misal: 15 Juni 2026 atau Available Daily" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Harga Display</label>
                                <input required value={formData.price_info} onChange={e => setFormData({ ...formData, price_info: e.target.value })} type="text" className="admin-input" placeholder="misal: Mulai Rp 150rb" />
                                <p className="text-[10px] text-admin-text-muted mt-1 italic">*Teks ini akan muncul di kartu event guest</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status Publikasi</label>
                                <select value={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })} className="admin-input">
                                    <option value="true">Published</option>
                                    <option value="false">Simpan sebagai Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" disabled={isSaving} onClick={() => navigate('/admin/events')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20">
                            <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-admin-bg border border-admin-border">
                        <p className="text-[11px] text-admin-text-muted leading-relaxed">
                            <strong>Note:</strong> Pastikan gambar yang diunggah memiliki kualitas tinggi untuk menjaga tampilan website tetap profesional.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
