import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Tag, Type } from 'lucide-react';
import { getEvents, saveEvents } from '../../../utils/data';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

export default function AddEvent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        name: '', 
        category: 'Wedding', 
        date: '', 
        price: '', 
        desc: '', 
        status: 'active',
        images: [] 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const events = getEvents();
        const newId = events.length > 0 ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
        const finalData = {
            ...formData,
            id: newId,
            image: formData.images.length > 0 ? formData.images[0] : '/images/generated/event.png'
        };
        const updated = [...events, finalData];
        saveEvents(updated);
        toast.success('Event berhasil ditambahkan');
        navigate('/admin/events');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/events')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Tambah Event Baru</h1>
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
                                <textarea required rows="8" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="admin-textarea" placeholder="Jelaskan detail event, fasilitas yang didapat, dan informasi penting lainnya..."></textarea>
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
                                    <input required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} type="text" className="admin-input pl-10" placeholder="misal: 15 Juni 2026 atau Available Daily" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Harga Display</label>
                                <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="text" className="admin-input" placeholder="misal: Mulai Rp 150rb" />
                                <p className="text-[10px] text-admin-text-muted mt-1 italic">*Teks ini akan muncul di kartu event guest</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status Publikasi</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="admin-input">
                                    <option value="active">Langsung Publish</option>
                                    <option value="inactive">Simpan sebagai Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/admin/events')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                            Batal
                        </button>
                        <button type="submit" className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20">
                            <Save size={18} /> Simpan Event
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
