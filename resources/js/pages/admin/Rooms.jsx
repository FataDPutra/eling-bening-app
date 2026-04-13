import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Check, Building, Maximize, BedDouble, Info, Search, Users, ShieldCheck, ChevronRight, Play, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import IconRenderer from '../../components/IconRenderer';
import Swal from 'sweetalert2';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [activeMedia, setActiveMedia] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/resorts');
            setRooms(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch resorts", error);
            toast.error("Gagal memuat data kamar");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Kamar yang dihapus tidak dapat dikembalikan dan mungkin berdampak pada reservasi yang ada!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // rose-600
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#ffffff',
            borderRadius: '1.5rem',
            customClass: {
                title: 'font-black text-admin-text-main',
                popup: 'rounded-[2rem]'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const load = toast.loading('Memproses penghapusan...');
                try {
                    await axios.delete(`/api/resorts/${id}`);
                    setRooms(rooms.filter(r => r.id !== id));
                    toast.success('Kamar berhasil dihapus', { id: load });
                } catch (error) {
                    console.error("Failed to delete room", error);
                    toast.error("Gagal menghapus kamar", { id: load });
                }
            }
        });
    };

    const filteredRooms = rooms.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Manajemen Kamar Resort</h1>
                    <p>Konfigurasi inventaris tipe kamar, kapasitas huni, dan manajemen harga dinamis.</p>
                </div>
                <button className="btn-primary py-3 px-6 shadow-xl shadow-admin-primary/20" onClick={() => navigate('/admin/rooms/add')}>
                    <Plus size={20} /> Tambah Kamar Baru
                </button>
            </div>

            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-admin-primary/10 text-admin-primary">
                            <Building size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Daftar Inventori</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Cari tipe kamar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-admin-bg border border-admin-border rounded-2xl text-xs font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all w-72"
                            />
                        </div>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Pratinjau</th>
                            <th>Tipe & Spesifikasi</th>
                            <th>Kapasitas</th>
                            <th>Ketersediaan</th>
                            <th>Harga / Malam</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map(room => (
                            <tr key={room.id} className="group">
                                <td className="w-28">
                                    <div 
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            setActiveMedia((Array.isArray(room.gallery) && room.gallery.length > 0 ? room.gallery[0] : room.image) || '/images/resort-room.png');
                                        }}
                                        className="relative w-20 h-14 rounded-2xl overflow-hidden border-2 border-admin-border group-hover:border-admin-primary transition-all shadow-sm cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity z-10">
                                            <Eye size={16} />
                                        </div>
                                        <img
                                            src={(Array.isArray(room.gallery) && room.gallery.length > 0 ? room.gallery[0] : room.image) || '/images/resort-room.png'}
                                            alt={room.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="font-black text-admin-text-main text-sm uppercase tracking-tight">{room.name}</div>
                                    <div className="flex gap-4 mt-1.5">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-admin-text-muted uppercase tracking-widest">
                                            <BedDouble size={12} className="text-admin-primary/60" /> {room.bed_type}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-admin-text-muted uppercase tracking-widest">
                                            <Maximize size={12} className="text-admin-primary/60" /> {room.room_size} m²
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-main">
                                            <Users size={14} />
                                        </div>
                                        <span className="text-xs font-black text-admin-text-main">{room.capacity} Tamu</span>
                                    </div>
                                </td>
                                <td>
                                    {room.stock > 0 ? (
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Tersedia</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-admin-text-muted pl-1.5">{room.stock} Unit Tersisa</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 w-fit">
                                            <X size={10} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Habis</span>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-0.5 leading-none">Weekday</p>
                                            <span className="text-sm font-black text-admin-primary tracking-tight">{formatRupiah(room.price)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] mb-0.5 leading-none">Weekend</p>
                                            <span className="text-sm font-black text-orange-600 tracking-tight">{formatRupiah(room.price_weekend)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-start gap-2">
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="View Deep Analysis" onClick={() => {
                                            setSelectedRoom(room);
                                            setActiveMedia((Array.isArray(room.gallery) && room.gallery.length > 0 ? room.gallery[0] : room.image) || '/images/resort-room.png');
                                        }}><Eye size={18} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Modify" onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}><Edit size={18} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm" title="Hapus Kamar" onClick={() => handleDelete(room.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRooms.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-admin-text-light/20">
                            <Building size={40} />
                        </div>
                        <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-widest">No rooms matched your criteria</h4>
                    </div>
                )}
            </div>

            {/* Room Detail Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedRoom(null)}></div>
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col lg:flex-row relative z-[1001] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-scale-up border border-white/20">
                        <button
                            onClick={() => setSelectedRoom(null)}
                            className="absolute top-8 right-8 z-20 w-12 h-12 rounded-2xl bg-slate-900/10 text-slate-900 hover:bg-rose-500 hover:text-white flex items-center justify-center backdrop-blur-xl transition-all shadow-sm border border-black/5"
                        >
                            <X size={24} />
                        </button>

                        <div className="lg:w-1/2 h-80 lg:h-auto relative bg-black flex items-center justify-center">
                            {activeMedia && (activeMedia.startsWith('data:video/') || activeMedia.endsWith('.mp4')) ? (
                                <video 
                                    src={activeMedia} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="max-w-full max-h-full"
                                />
                            ) : (
                                <img
                                    src={activeMedia}
                                    alt={selectedRoom.name}
                                    className="w-full h-full object-cover transition-all duration-700"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />

                            {Array.isArray(selectedRoom.gallery) && selectedRoom.gallery.length > 1 && (
                                <div className="absolute bottom-8 left-8 right-8 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                    {selectedRoom.gallery.map((img, i) => {
                                        const isVideo = img.startsWith('data:video/') || img.endsWith('.mp4');
                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => setActiveMedia(img)}
                                                className={`flex-shrink-0 w-24 h-16 rounded-[1.25rem] overflow-hidden border-2 transition-all cursor-pointer shadow-xl relative ${activeMedia === img ? 'border-white scale-105 z-10' : 'border-white/40 hover:border-white/70'}`}
                                            >
                                                {isVideo ? (
                                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                        <Film size={20} className="text-white opacity-60" />
                                                        <video src={img} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                                    </div>
                                                ) : (
                                                    <img src={img} className="w-full h-full object-cover" />
                                                )}
                                                {isVideo && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Play size={12} fill="white" className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/2 p-12 lg:p-16 overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-lg bg-admin-primary/10 text-admin-primary">
                                    <ShieldCheck size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary">Spesifikasi Properti</span>
                            </div>

                            <div className="flex justify-between items-start mb-10">
                                <h2 className="text-4xl font-black text-admin-text-main tracking-tighter leading-none uppercase">{selectedRoom.name}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 rounded-3xl bg-admin-bg border border-admin-border flex flex-col">
                                    <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3">Konfigurasi</span>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <BedDouble size={16} className="text-admin-primary" />
                                            <span className="text-sm font-black text-admin-text-main">{selectedRoom.bed_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Maximize size={16} className="text-admin-primary" />
                                            <span className="text-sm font-black text-admin-text-main">Luas {selectedRoom.room_size} m²</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-admin-primary text-white flex flex-col shadow-xl shadow-admin-primary/20">
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-3">Mulai Dari (Hari Kerja)</span>
                                    <div className="flex flex-col mb-4">
                                        <span className="text-2xl font-black">{formatRupiah(selectedRoom.price)}</span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Net Per Malam</span>
                                    </div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-3 border-t border-white/20 pt-4">Tarif Akhir Pekan</span>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black">{formatRupiah(selectedRoom.price_weekend)}</span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Sabtu - Minggu</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <section>
                                    <h4 className="text-xs font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                        Fasilitas & Layanan
                                        <span className="w-12 h-px bg-admin-border" />
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(selectedRoom.facilities || []).map((f, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-admin-bg border border-admin-border text-admin-text-main rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all">
                                                <IconRenderer icon={f.icon} size={14} />
                                                <span>{f.name || f}</span>
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-black text-admin-text-main uppercase tracking-widest mb-4">Deskripsi Kamar</h4>
                                    <p className="text-sm font-medium text-admin-text-muted leading-relaxed italic border-l-4 border-admin-primary/10 pl-6">
                                        "{selectedRoom.description}"
                                    </p>
                                </section>

                                <div className="pt-10 flex gap-4">
                                    <button
                                        onClick={() => navigate(`/admin/rooms/edit/${selectedRoom.id}`)}
                                        className="flex-[3] btn-primary py-5 rounded-[2rem] shadow-2xl shadow-admin-primary/30 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] font-black flex items-center justify-center gap-3 group"
                                    >
                                        <span>Ubah Spesifikasi</span>
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedRoom(null)}
                                        className="flex-1 rounded-[2rem] bg-admin-bg border border-admin-border text-admin-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-admin-text-main transition-all"
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
