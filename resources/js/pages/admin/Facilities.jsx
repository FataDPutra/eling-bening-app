import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
    Plus, Edit, Trash2, Search, ConciergeBell, LayoutGrid, X,
    Package, ShoppingBasket, Check, ChevronDown, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRupiah } from '../../utils/data';
import IconRenderer from '../../components/IconRenderer';

// ─── Modern Icon Collections (Lucide Names) ──────────────────────────────────
const ICON_PALETTE = {
    'Dasar & Kamar': [
        'Bed', 'Bath', 'ShowerHead', 'Soap', 'Droplet', 'Brush', 'Sparkles', 'Wind', 'AirVent', 'Fan', 'Tv', 'Monitor', 'Wifi', 'Lightbulb', 'Lamp', 'DoorOpen', 'Lock', 'Refrigerator', 'Smartphone'
    ],
    'Konsumsi': [
        'Coffee', 'Utensils', 'UtensilsCrossed', 'Soup', 'Pizza', 'GlassWater', 'Wine', 'Beer', 'Cake', 'IceCream'
    ],
    'Alam & Outdoor': [
        'Waves', 'Trees', 'Mountain', 'Flame', 'Tent', 'Flower', 'Sun', 'Moon', 'Cloud', 'Fish', 'Sparkles'
    ],
    'Aktifitas & Sport': [
        'Dumbbell', 'Trophy', 'Gamepad2', 'Music', 'Music2', 'Mic', 'Mic2', 'Camera', 'Video', 'MonitorPlay', 'Heart', 'Puzzle', 'Bike', 'Clover'
    ],
    'Transport & Umum': [
        'Car', 'ParkingCircle', 'Bus', 'Bike', 'Building2', 'Stethoscope', 'Zap', 'Contact', 'MapPin', 'Compass', 'Library', 'Brain'
    ]
};

const ALL_ICON_NAMES = Object.values(ICON_PALETTE).flat();
const EMPTY_FORM = {
    name: '',
    icon: 'Bed',
    description: '',
    price: 0,
    is_addon: false,
    is_active: true,
};

// ─── Modern Icon Picker (No Emojis!) ─────────────────────────────────────────
function IconPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(Object.keys(ICON_PALETTE)[0]);
    const [searchQ, setSearchQ] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const displayIcons = searchQ.trim()
        ? ALL_ICON_NAMES.filter(name => name.toLowerCase().includes(searchQ.toLowerCase()))
        : ICON_PALETTE[activeTab] || [];

    return (
        <div ref={ref} className="relative">
            <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Icon Fasilitas (Lucide Icons)</label>

            <button type="button" onClick={() => setOpen(v => !v)}
                className={`flex items-center gap-3 w-full border rounded-2xl px-4 py-3 bg-admin-bg transition-all hover:border-admin-primary ${open ? 'border-admin-primary ring-2 ring-admin-primary/20' : 'border-admin-border'}`}>
                <div className="w-12 h-12 rounded-xl bg-white border border-admin-border flex items-center justify-center text-admin-primary shadow-sm">
                    <IconRenderer icon={value} size={28} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-xs font-black text-admin-text-main uppercase tracking-tight">Icon Terpilih: {value}</p>
                    <p className="text-[9px] text-admin-text-muted font-bold">Klik untuk ganti kolesi icon modern</p>
                </div>
                <ChevronDown size={16} className={`text-admin-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-admin-border rounded-[1.5rem] shadow-2xl z-[2000] overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-admin-border">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
                            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                placeholder="Cari icon modern (e.g. Bed, Wifi)..."
                                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-admin-bg border border-admin-border rounded-xl focus:outline-none focus:border-admin-primary" />
                        </div>
                    </div>

                    {!searchQ && (
                        <div className="flex overflow-x-auto px-3 pt-3 gap-1.5 scrollbar-none border-b border-admin-border pb-3">
                            {Object.keys(ICON_PALETTE).map(cat => (
                                <button key={cat} type="button" onClick={() => setActiveTab(cat)}
                                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${activeTab === cat ? 'bg-admin-primary text-white shadow-md' : 'bg-admin-bg text-admin-text-muted hover:bg-admin-border'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-4 grid grid-cols-6 gap-3 max-h-60 overflow-y-auto bg-slate-50/30">
                        {displayIcons.map((ic, i) => (
                            <button key={i} type="button" onClick={() => { onChange(ic); setOpen(false); setSearchQ(''); }}
                                title={ic}
                                className={`aspect-square rounded-xl flex items-center justify-center text-admin-text-main transition-all hover:bg-admin-primary hover:text-white hover:scale-110 shadow-sm ${value === ic ? 'bg-admin-primary text-white shadow-lg scale-105 ring-2 ring-admin-primary/20' : 'bg-white border border-admin-border'}`}>
                                <IconRenderer icon={ic} size={20} />
                            </button>
                        ))}
                    </div>
                    
                    <div className="p-3 bg-admin-bg border-t border-admin-border text-center">
                        <p className="text-[9px] text-admin-text-muted font-bold tracking-widest uppercase">Pilih icon SVG untuk tampilan premium</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Facilities Page ───────────────────────────────────────────────────
export default function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const fetchFacilities = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/api/facilities');
            setFacilities(res.data || []);
        } catch {
            toast.error('Gagal memuat data fasilitas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchFacilities(); }, []);

    const openCreate = () => { setEditingFacility(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (f) => {
        setEditingFacility(f);
        setForm({ name: f.name, icon: f.icon || 'Bed', description: f.description || '', price: f.price || 0, is_addon: !!f.is_addon, is_active: !!f.is_active });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditingFacility(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingFacility) {
                const res = await axios.put(`/api/facilities/${editingFacility.id}`, form);
                setFacilities(prev => prev.map(f => f.id === editingFacility.id ? res.data : f));
                toast.success('Fasilitas diperbarui!');
            } else {
                const res = await axios.post('/api/facilities', form);
                setFacilities(prev => [...prev, res.data]);
                toast.success('Fasilitas ditambahkan!');
            }
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan fasilitas');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus fasilitas ini?')) return;
        try {
            await axios.delete(`/api/facilities/${id}`);
            setFacilities(prev => prev.filter(f => f.id !== id));
            toast.success('Fasilitas dihapus');
        } catch {
            toast.error('Gagal menghapus fasilitas');
        }
    };

    const filtered = facilities.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'all' ? true : (typeFilter === 'addon' ? f.is_addon : !f.is_addon);
        return matchSearch && matchType;
    });

    const stats = {
        total: facilities.length,
        addon: facilities.filter(f => f.is_addon).length,
        fixed: facilities.filter(f => !f.is_addon).length,
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Master Fasilitas</h1>
                    <p>Konfigurasi fasilitas kamar dan layanan tambahan menggunakan sistem icon modern.</p>
                </div>
                <button className="flex items-center gap-2 btn-primary py-3 px-6 shadow-xl shadow-admin-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={openCreate}>
                    <Plus size={18} strokeWidth={3} />
                    <span className="font-bold uppercase tracking-widest text-xs">Tambah Fasilitas</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card group hover:border-admin-primary transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <ConciergeBell size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Fasilitas</p>
                            <p className="text-3xl font-black text-admin-text-main leading-none tabular-nums">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card border-l-4 border-l-emerald-500 group hover:bg-emerald-50/30 transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                            <Package size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Fasilitas Tetap</p>
                            <p className="text-3xl font-black text-admin-text-main leading-none tabular-nums">{stats.fixed}</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card border-l-4 border-l-orange-400 group hover:bg-orange-50/30 transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
                            <ShoppingBasket size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Layanan Add-on</p>
                            <p className="text-3xl font-black text-admin-text-main leading-none tabular-nums">{stats.addon}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-3 mr-4">
                            <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                                <ConciergeBell size={18} />
                            </div>
                            <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest whitespace-nowrap">Daftar Fasilitas</h3>
                        </div>
                        <div className="flex bg-admin-bg p-1.5 rounded-2xl border border-admin-border w-fit shadow-sm overflow-x-auto custom-scrollbar">
                            {[
                                { id: 'all', label: 'Semua' },
                                { id: 'fixed', label: 'Tetap' },
                                { id: 'addon', label: 'Add-on' },
                            ].map(t => (
                                <button key={t.id} onClick={() => setTypeFilter(t.id)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === t.id ? 'bg-admin-primary text-white shadow-md' : 'text-admin-text-muted hover:text-admin-text-main'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                        <input type="text" placeholder="Cari nama fasilitas..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-full shadow-sm" />
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Informasi Fasilitas</th>
                                <th>Kategori / Tipe</th>
                                <th>Tarif Tambahan</th>
                                <th>Status Operasional</th>
                                <th className="text-right">Aksi Kelola</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-24 text-center text-admin-text-muted font-black uppercase tracking-widest animate-pulse">Mensinkronisasi Data...</td></tr>
                            ) : filtered.map(facility => (
                                <tr key={facility.id} className="group hover:bg-slate-50/50">
                                    <td>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-admin-border flex items-center justify-center text-admin-primary group-hover:border-admin-primary group-hover:shadow-lg group-hover:shadow-admin-primary/10 transition-all duration-500">
                                                <IconRenderer icon={facility.icon} size={28} />
                                            </div>
                                            <div>
                                                <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{facility.name}</div>
                                                <p className="text-[10px] text-admin-text-muted font-bold mt-1 line-clamp-1 italic max-w-[250px]">{facility.description || 'Tidak ada deskripsi tambahan'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {facility.is_addon ? (
                                            <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-2 w-fit shadow-sm">
                                                <ShoppingBasket size={12} /> Layanan Add-on
                                            </span>
                                        ) : (
                                            <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-2 w-fit shadow-sm">
                                                <Package size={12} /> Fasilitas Tetap
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {facility.is_addon && facility.price > 0 ? (
                                            <span className="font-black text-admin-primary text-sm flex flex-col">
                                                <span>{formatRupiah(facility.price)}</span>
                                                <span className="text-[8px] text-admin-text-muted font-bold uppercase tracking-widest">Per Malam / Unit</span>
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-admin-text-light font-black uppercase tracking-widest opacity-40">— FREE —</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit shadow-sm ${facility.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-500 border-rose-200'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${facility.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {facility.is_active ? 'Aktif Melayani' : 'Nonaktif / Maintenance'}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openEdit(facility)}
                                                className="p-3 rounded-xl bg-white border border-admin-border text-admin-text-muted hover:text-admin-primary hover:border-admin-primary hover:shadow-md transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(facility.id)}
                                                className="p-3 rounded-xl bg-white border border-admin-border text-admin-text-muted hover:text-rose-600 hover:border-rose-600 hover:shadow-md transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filtered.length === 0 && (
                    <div className="py-32 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-admin-border">
                        <div className="w-24 h-24 bg-white border border-admin-border rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <ConciergeBell size={48} className="text-admin-text-light" />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-[0.3em]">Data fasilitas belum ditemukan</h4>
                        <button onClick={openCreate} className="mt-6 px-8 py-3 bg-admin-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-admin-primary/20">+ Tambah Fasilitas Baru</button>
                    </div>
                )}
            </div>

            {showModal && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8">
                    {/* Dark & Blurred Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-500"
                        style={{ WebkitBackdropFilter: 'blur(20px)' }}
                        onClick={closeModal}
                    ></div>

                    {/* Modal Card */}
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] md:rounded-[3rem] relative z-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col border border-white/20 animate-scale-up max-h-[90vh] overflow-hidden">
                        
                        {/* Premium Close Button */}
                        <button 
                            onClick={closeModal} 
                            className="absolute top-6 right-6 z-30 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-sm border border-admin-border text-admin-text-muted hover:text-rose-600 hover:border-rose-600 hover:rotate-90 transition-all duration-500 flex items-center justify-center shadow-lg active:scale-90 group"
                        >
                            <X size={20} className="group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Modal Header */}
                        <div className="p-8 md:p-10 border-b border-admin-border bg-admin-bg/50 flex-shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-admin-primary text-white flex items-center justify-center shadow-2xl shadow-admin-primary/30 ring-4 ring-admin-primary/10">
                                    <IconRenderer icon={form.icon} size={28} className="md:w-9 md:h-9" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm md:text-xl font-black text-admin-text-main uppercase tracking-tight leading-tight">
                                        {editingFacility ? 'Edit Master Fasilitas' : 'Fasilitas Kolaborasi Baru'}
                                    </h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-admin-text-light uppercase tracking-[0.3em] mt-1 opacity-60">Konfigurasi Aset Premium Eling Bening</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 text-left">
                                <div className="space-y-3">
                                    <label className="block text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] ml-1">Identitas Fasilitas *</label>
                                    <input 
                                        type="text" 
                                        value={form.name} 
                                        onChange={e => setForm(f => ({...f, name: e.target.value}))}
                                        required 
                                        placeholder="Contoh: Kolam Renang Infinity, Wifi High-Speed..."
                                        className="w-full border-2 border-admin-border rounded-2xl px-6 py-4 text-xs md:text-sm font-black text-admin-text-main focus:outline-none focus:border-admin-primary bg-admin-bg/40 transition-all placeholder:text-admin-text-light/50 shadow-inner" 
                                    />
                                </div>

                                <IconPicker value={form.icon} onChange={val => setForm(f => ({...f, icon: val}))} />

                                <div className="space-y-3">
                                    <label className="block text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] ml-1">Narasi Fasilitas (Metadata)</label>
                                    <textarea 
                                        value={form.description} 
                                        onChange={e => setForm(f => ({...f, description: e.target.value}))}
                                        rows={3} 
                                        placeholder="Jelaskan keunggulan fasilitas ini secara mendalam..."
                                        className="w-full border-2 border-admin-border rounded-2xl px-6 py-4 text-xs md:text-sm font-bold text-admin-text-main focus:outline-none focus:border-admin-primary bg-admin-bg/40 resize-none transition-all shadow-inner placeholder:text-admin-text-light/50" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div 
                                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer select-none group/toggle ${form.is_addon ? 'border-orange-500 bg-orange-50/20 shadow-lg shadow-orange-500/10' : 'border-admin-border bg-admin-bg/40 shadow-inner'}`} 
                                        onClick={() => setForm(f => ({...f, is_addon: !f.is_addon}))}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-xs font-black uppercase tracking-tight ${form.is_addon ? 'text-orange-600' : 'text-admin-text-main'}`}>Layanan Add-on</p>
                                            <div className={`relative w-10 h-5 rounded-full transition-all duration-500 ${form.is_addon ? 'bg-orange-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 ${form.is_addon ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-admin-text-muted font-bold leading-relaxed opacity-70">Ditagih manual sebagai layanan tambahan opsional.</p>
                                    </div>

                                    <div 
                                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer select-none group/status ${form.is_active ? 'border-emerald-500 bg-emerald-50/20 shadow-lg shadow-emerald-500/10' : 'border-admin-border bg-admin-bg/40 shadow-inner'}`}
                                        onClick={() => setForm(f => ({...f, is_active: !f.is_active}))}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-xs font-black uppercase tracking-tight ${form.is_active ? 'text-emerald-600' : 'text-admin-text-main'}`}>Status Aktif</p>
                                            <div className={`relative w-10 h-5 rounded-full transition-all duration-500 ${form.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-admin-text-muted font-bold leading-relaxed opacity-70">Muncul dalam katalog reservasi pusat.</p>
                                    </div>
                                </div>

                                {form.is_addon && (
                                    <div className="p-6 rounded-[2rem] bg-orange-500 text-white shadow-xl shadow-orange-500/20 animate-fade-in relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-1000" />
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-white/70">Valuasi Tarif Layanan (IDR)</label>
                                        <div className="relative">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-black opacity-30">Rp</span>
                                            <input 
                                                type="number" 
                                                value={form.price} 
                                                min="0"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={e => setForm(f => ({...f, price: e.target.value}))}
                                                className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none pl-12 py-2 text-2xl font-black tracking-tighter tabular-nums placeholder:text-white/20 transition-all" 
                                            />
                                            <p className="text-[9px] font-bold mt-2 text-white/50 tracking-widest uppercase">Per Item / Unit Satuan</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-2">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="flex-1 py-5 rounded-2xl bg-admin-bg border-2 border-admin-border text-admin-text-muted font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-admin-text-main transition-all active:scale-95 shadow-sm"
                                    >
                                        Batalkan
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex-[2] flex items-center justify-center gap-3 bg-admin-primary text-white py-5 rounded-2xl shadow-2xl shadow-admin-primary/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
