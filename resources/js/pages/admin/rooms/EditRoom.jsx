import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Save, Loader2 } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

const AMENITIES_OPTIONS = [
    'WiFi', 'TV', 'AC', 'Coffee Maker',
    'Balcony', 'Minibar', 'Shower', 'Lake View',
    'Bathtub', 'Breakfast', 'Work Desk', 'Safe Deposit Box'
];

export default function EditRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await axios.get(`/api/resorts/${id}`);
                const room = res.data;
                setFormData({
                    ...room,
                    facilities: Array.isArray(room.facilities) ? room.facilities : [],
                    gallery: Array.isArray(room.gallery) ? room.gallery : []
                });
            } catch (error) {
                console.error("Failed to fetch room", error);
                toast.error('Kamar tidak ditemukan');
                navigate('/admin/rooms');
            }
        };
        fetchRoom();
    }, [id, navigate]);

    const handleAmenityChange = (amenity) => {
        const current = formData.facilities;
        if (current.includes(amenity)) {
            setFormData({ ...formData, facilities: current.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, facilities: [...current, amenity] });
        }
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

            await axios.put(`/api/resorts/${id}`, finalData);
            toast.success('Perubahan berhasil disimpan');
            navigate('/admin/rooms');
        } catch (error) {
            console.error("Failed to update resort", error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
        } finally {
            setIsSaving(false);
        }
    };

    if (!formData) return (
        <div className="flex flex-col items-center justify-center p-20 text-admin-text-muted">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Memuat data kamar...</p>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/rooms')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Edit Tipe Kamar</h1>
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
                                <textarea required rows="6" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-textarea" placeholder="Jelaskan detail kamar, pemandangan, dan keunggulan lainnya..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Fasilitas Kamar</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {AMENITIES_OPTIONS.map(opt => {
                                const isSelected = formData.facilities.includes(opt);
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => handleAmenityChange(opt)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                                                ? 'bg-admin-primary-light border-admin-primary text-admin-primary-dark'
                                                : 'bg-white border-admin-border text-admin-text-muted hover:border-admin-primary/50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-admin-primary border-admin-primary text-white'
                                                : 'bg-white border-admin-border text-transparent'
                                            }`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className="text-xs font-bold">{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Settings & Images */}
                <div className="space-y-6">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Pengaturan & Harga</h3>
                        <div className="space-y-4">
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
                        <ImageUpload
                            images={formData.gallery}
                            onChange={(gallery) => setFormData({ ...formData, gallery })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/admin/rooms')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20 disabled:opacity-50">
                            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} />}
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
