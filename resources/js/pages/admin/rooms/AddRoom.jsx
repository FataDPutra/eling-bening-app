import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Save, Loader2, ConciergeBell, Package, ShoppingBasket } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

export default function AddRoom() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [allFacilities, setAllFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(true);

    const initialForm = {
        name: '',
        price: '',
        price_weekend: '',
        capacity: 2,
        stock: 5,
        bed_type: 'King Bed',
        room_size: 30,
        description: '',
        facility_ids: [],
        gallery: []
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        axios.get('/api/facilities')
            .then(res => setAllFacilities((res.data || []).filter(f => f.is_active)))
            .catch(() => toast.error('Gagal memuat daftar fasilitas'))
            .finally(() => setLoadingFacilities(false));
    }, []);

    const toggleFacility = (id) => {
        const current = formData.facility_ids;
        setFormData(prev => ({
            ...prev,
            facility_ids: current.includes(id) ? current.filter(x => x !== id) : [...current, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const finalData = {
                ...formData,
                price: Number(formData.price),
                price_weekend: Number(formData.price_weekend),
                capacity: Number(formData.capacity),
                stock: Number(formData.stock),
                room_size: String(formData.room_size)
            };

            await axios.post('/api/resorts', finalData);
            toast.success('Kamar berhasil ditambahkan');
            navigate('/admin/rooms');
        } catch (error) {
            console.error("Failed to add resort", error);
            toast.error(error.response?.data?.message || 'Gagal menambahkan kamar');
        } finally {
            setIsSaving(false);
        }
    };

    const fixedFacilities = allFacilities.filter(f => !f.is_addon);
    const addonFacilities = allFacilities.filter(f => f.is_addon);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/rooms')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Tambah Tipe Kamar Baru</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Left Side: General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Informasi Dasar</h3>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Nama Tipe Kamar</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input" placeholder="misal: Deluxe Lake View" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi Lengkap</label>
                                <textarea required rows="5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-textarea" placeholder="Jelaskan detail kamar, pemandangan, dan keunggulan lainnya..." />
                            </div>
                        </div>
                    </div>

                    {/* Facilities Checklist */}
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-2 pb-4 border-b border-admin-border flex items-center gap-2">
                            <ConciergeBell size={16} className="text-admin-primary" /> Pilih Fasilitas Kamar
                        </h3>
                        <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mb-6">
                            Pilih fasilitas yang tersedia di kamar ini dari data master fasilitas.
                        </p>

                        {loadingFacilities ? (
                            <div className="py-8 text-center text-admin-text-muted text-xs font-bold animate-pulse">Memuat fasilitas...</div>
                        ) : allFacilities.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-admin-border rounded-2xl">
                                <p className="text-xs text-admin-text-muted font-bold">Belum ada data fasilitas.</p>
                                <button type="button" onClick={() => navigate('/admin/facilities')} className="mt-2 text-admin-primary text-xs font-black uppercase hover:underline">
                                    + Tambah di Kelola Fasilitas
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {fixedFacilities.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package size={13} className="text-emerald-600" />
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Fasilitas Tetap Bawaan Kamar</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {fixedFacilities.map(f => {
                                                const selected = formData.facility_ids.includes(f.id);
                                                return (
                                                    <div key={f.id} onClick={() => toggleFacility(f.id)}
                                                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${selected ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-admin-border text-admin-text-muted hover:border-emerald-300'}`}>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-admin-border'}`}>
                                                            {selected && <Check size={11} strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-lg leading-none">{f.icon}</span>
                                                        <span className="text-xs font-bold truncate">{f.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {addonFacilities.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShoppingBasket size={13} className="text-orange-500" />
                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Fasilitas Add-on (Bisa Dipesan Tamu)</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {addonFacilities.map(f => {
                                                const selected = formData.facility_ids.includes(f.id);
                                                return (
                                                    <div key={f.id} onClick={() => toggleFacility(f.id)}
                                                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${selected ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-admin-border text-admin-text-muted hover:border-orange-300'}`}>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-orange-400 border-orange-400 text-white' : 'bg-white border-admin-border'}`}>
                                                            {selected && <Check size={11} strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-lg leading-none">{f.icon}</span>
                                                        <span className="text-xs font-bold truncate">{f.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Settings & Images */}
                <div className="space-y-6">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Pengaturan & Harga</h3>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Harga per Malam (Weekday)</label>
                                <div className="input-with-prefix">
                                    <div className="input-prefix">Rp</div>
                                    <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="number" placeholder="0" className="w-full" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga per Malam (Weekend)</label>
                                <div className="input-with-prefix">
                                    <div className="input-prefix">Rp</div>
                                    <input required value={formData.price_weekend} onChange={e => setFormData({ ...formData, price_weekend: e.target.value })} type="number" placeholder="0" className="w-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Stok Unit</label>
                                    <input required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} type="number" min="0" className="admin-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Kapasitas</label>
                                    <input required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} type="number" min="1" className="admin-input" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tipe Kasur</label>
                                <input required value={formData.bed_type} onChange={e => setFormData({ ...formData, bed_type: e.target.value })} type="text" placeholder="misal: 1 King Bed" className="admin-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Luas Kamar (m²)</label>
                                <input required value={formData.room_size} onChange={e => setFormData({ ...formData, room_size: e.target.value })} type="number" className="admin-input" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Galeri Foto</h3>
                        <ImageUpload images={formData.gallery} onChange={(gallery) => setFormData({ ...formData, gallery })} />
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/admin/rooms')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20 disabled:opacity-50">
                            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} />}
                            {isSaving ? 'Menyimpan...' : 'Simpan Kamar'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
