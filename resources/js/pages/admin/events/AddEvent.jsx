import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Tag, Type } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

const formatDateID = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function AddEvent() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [dateRaw, setDateRaw] = useState('');
    const [dateMode, setDateMode] = useState('picker'); // 'picker' | 'custom'
    const [formData, setFormData] = useState({ 
        name: '', 
        category: 'Wedding', 
        date_info: '', 
        price: 0,
        ticket_quota: '',
        description: '', 
        is_active: true,
        is_ticketed: true,
        images: [] 
    });

    const handleDateChange = (e) => {
        const raw = e.target.value; // e.g. "2026-06-15"
        setDateRaw(raw);
        setFormData(prev => ({ ...prev, date_info: formatDateID(raw) }));
    };

    const handleModeSwitch = (mode) => {
        setDateMode(mode);
        // Reset nilai saat beralih mode
        setDateRaw('');
        setFormData(prev => ({ ...prev, date_info: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const loadingToast = toast.loading('Menyimpan event...');
        
        try {
            await axios.post('/api/events', formData);
            toast.success('Event berhasil ditambahkan', { id: loadingToast });
            navigate('/admin/events');
        } catch (error) {
            toast.error('Gagal menambahkan event', { id: loadingToast });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
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
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Type size={16} />
                                    </div>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="misal: Wedding Sunset Package" />
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
                                <div className="form-input-group">
                                    <div className="input-icon-box">
                                        <Tag size={16} />
                                    </div>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
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

                                {/* Mode Toggle */}
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => handleModeSwitch('picker')}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${
                                            dateMode === 'picker'
                                                ? 'bg-admin-primary text-white border-admin-primary shadow-sm'
                                                : 'bg-white text-admin-text-muted border-admin-border hover:border-admin-primary hover:text-admin-primary'
                                        }`}
                                    >
                                        📅 Tanggal Pasti
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleModeSwitch('custom')}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${
                                            dateMode === 'custom'
                                                ? 'bg-admin-primary text-white border-admin-primary shadow-sm'
                                                : 'bg-white text-admin-text-muted border-admin-border hover:border-admin-primary hover:text-admin-primary'
                                        }`}
                                    >
                                        ✏️ Jadwal Custom
                                    </button>
                                </div>

                                {dateMode === 'picker' ? (
                                    <>
                                        <div className="form-input-group">
                                            <div className="input-icon-box">
                                                <Calendar size={16} />
                                            </div>
                                            <input
                                                required
                                                type="date"
                                                value={dateRaw}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={handleDateChange}
                                                style={{ colorScheme: 'light' }}
                                            />
                                        </div>
                                        {formData.date_info && (
                                            <p className="text-[11px] text-admin-primary font-bold mt-1.5 flex items-center gap-1">
                                                <Calendar size={11} /> Tampil sebagai: <span className="italic">{formData.date_info}</span>
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="form-input-group">
                                            <div className="input-icon-box">
                                                <Calendar size={16} />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={formData.date_info}
                                                onChange={e => setFormData(prev => ({ ...prev, date_info: e.target.value }))}
                                                placeholder="misal: Setiap Sabtu & Minggu, 16:00 WIB"
                                            />
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {['Available Daily', 'Setiap Weekend', 'Setiap Sabtu, 16:00 WIB', 'Setiap Hari, 08:00–18:00'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, date_info: s }))}
                                                    className="px-2.5 py-1 text-[10px] font-bold bg-admin-bg border border-admin-border rounded-lg text-admin-text-muted hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tipe Event</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_ticketed: true })}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            formData.is_ticketed
                                                ? 'bg-admin-primary/10 text-admin-primary border-admin-primary/20'
                                                : 'bg-white text-admin-text-muted border-admin-border'
                                        }`}
                                    >
                                        🎟️ Jual Tiket
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_ticketed: false })}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            !formData.is_ticketed
                                                ? 'bg-admin-primary/10 text-admin-primary border-admin-primary/20'
                                                : 'bg-white text-admin-text-muted border-admin-border'
                                        }`}
                                    >
                                        📢 Info Saja
                                    </button>
                                </div>
                                <p className="text-[9px] text-admin-text-muted mt-2 italic px-2">"Jual Tiket" akan mengaktifkan tombol beli di guest</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Harga Tiket (Transaksi)</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">Rp</div>
                                    <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="number" placeholder="0" />
                                </div>
                                <p className="text-[9px] text-admin-text-muted mt-1 italic px-2">*Masukkan 0 jika tiket gratis. Harga ini akan tampil otomatis di situs guest.</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Kuota Tiket</label>
                                <div className="form-input-group">
                                    <div className="input-icon-box">🎟</div>
                                    <input value={formData.ticket_quota} onChange={e => setFormData({ ...formData, ticket_quota: e.target.value })} type="number" placeholder="Kosongkan jika tidak terbatas" min="0" />
                                </div>
                                <p className="text-[9px] text-admin-text-muted mt-1 italic px-2">*Biarkan kosong untuk kuota tidak terbatas</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status Publikasi</label>
                                <select value={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })} className="admin-input">
                                    <option value="true">Langsung Publish</option>
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
                            <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Event'}
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
