import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { getRooms, saveRooms } from '../../../utils/data';
import ImageUpload from '../../../components/admin/ImageUpload';
import toast from 'react-hot-toast';

const AMENITIES_OPTIONS = [
    'WiFi', 'TV', 'AC', 'Coffee Maker',
    'Balcony', 'Minibar', 'Shower', 'Lake View',
    'Bathtub', 'Breakfast', 'Work Desk', 'Safe Deposit Box'
];

export default function AddRoom() {
    const navigate = useNavigate();
    const initialForm = {
        name: '',
        price: '',
        priceWeekend: '',
        capacity: 2,
        stock: 5,
        bed: 'King Bed',
        size: 30,
        desc: '',
        amenities: [],
        status: 'available',
        images: []
    };
    const [formData, setFormData] = useState(initialForm);

    const handleAmenityChange = (amenity) => {
        const current = formData.amenities;
        if (current.includes(amenity)) {
            setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, amenities: [...current, amenity] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const rooms = getRooms();
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        const finalData = {
            ...formData,
            id: newId,
            image: formData.images.length > 0 ? formData.images[0] : '/images/resort-room.png',
            price: Number(formData.price),
            priceWeekend: Number(formData.priceWeekend),
            capacity: Number(formData.capacity),
            stock: Number(formData.stock),
            size: Number(formData.size)
        };

        saveRooms([...rooms, finalData]);
        toast.success('Kamar berhasil ditambahkan');
        navigate('/admin/rooms');
    };

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
                                <textarea required rows="6" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="admin-textarea" placeholder="Jelaskan detail kamar, pemandangan, dan keunggulan lainnya..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Fasilitas Kamar</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {AMENITIES_OPTIONS.map(opt => {
                                const isSelected = formData.amenities.includes(opt);
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Harga per Malam (Weekday)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light font-bold text-sm">Rp</span>
                                        <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="number" className="admin-input pl-10" placeholder="0" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Harga per Malam (Weekend)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light font-bold text-sm">Rp</span>
                                        <input required value={formData.priceWeekend} onChange={e => setFormData({ ...formData, priceWeekend: e.target.value })} type="number" className="admin-input pl-10" placeholder="0" />
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
                                <input required value={formData.bed} onChange={e => setFormData({ ...formData, bed: e.target.value })} type="text" placeholder="misal: 1 King Bed" className="admin-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Luas Kamar (m²)</label>
                                <input required value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} type="number" className="admin-input" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Galeri Foto</h3>
                        <ImageUpload
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/admin/rooms')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                            Batal
                        </button>
                        <button type="submit" className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20">
                            <Save size={18} /> Simpan Kamar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
