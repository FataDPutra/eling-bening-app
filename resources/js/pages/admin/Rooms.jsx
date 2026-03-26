import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Check, Building, Maximize, BedDouble, Info, Search, Users, ShieldCheck, ChevronRight, Play, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

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
        if (confirm('Yakin ingin menghapus kamar tipe ini? Semua pemesanan terkait mungkin terdampak.')) {
            try {
                await axios.delete(`/api/resorts/${id}`);
                setRooms(rooms.filter(r => r.id !== id));
                toast.success('Kamar berhasil dihapus');
            } catch (error) {
                console.error("Failed to delete room", error);
                toast.error("Gagal menghapus kamar");
            }
        }
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
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Inventory List</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                            <input
                                type="text"
                                placeholder="Search room type..."
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
                            <th>Preview</th>
                            <th>Room Specification</th>
                            <th>Capacity</th>
                            <th>Availability</th>
                            <th>Rate / Night</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map(room => (
                            <tr key={room.id} className="group">
                                <td className="w-28">
                                    <div className="relative w-20 h-14 rounded-2xl overflow-hidden border-2 border-admin-border group-hover:border-admin-primary transition-all shadow-sm">
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
                                        <span className="text-xs font-black text-admin-text-main">{room.capacity} Guests</span>
                                    </div>
                                </td>
                                <td>
                                    {room.stock > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="badge-status bg-success/10 text-success border-success/20">
                                                Active Stock
                                            </span>
                                            <span className="text-[10px] font-bold text-admin-text-light pl-2">{room.stock} Units Left</span>
                                        </div>
                                    ) : (
                                        <span className="badge-status bg-danger/10 text-danger border-danger/20">
                                            Out of Stock
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-admin-primary">{formatRupiah(room.price)}</span>
                                        <span className="text-[9px] font-bold text-admin-text-light uppercase tracking-widest mt-0.5">Base Fare</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-start gap-2">
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="View Deep Analysis" onClick={() => {
                                            setSelectedRoom(room);
                                            setActiveMedia((Array.isArray(room.gallery) && room.gallery.length > 0 ? room.gallery[0] : room.image) || '/images/resort-room.png');
                                        }}><Eye size={18} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-admin-text-main flex items-center justify-center hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all shadow-sm" title="Modify" onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}><Edit size={18} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border text-danger flex items-center justify-center hover:bg-danger hover:text-white hover:border-danger transition-all shadow-sm" title="Terminate" onClick={() => handleDelete(room.id)}><Trash2 size={18} /></button>
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
                            className="absolute top-8 right-8 z-20 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xl transition-all shadow-2xl border border-white/20"
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
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary">Property Specification</span>
                            </div>

                            <div className="flex justify-between items-start mb-10">
                                <h2 className="text-4xl font-black text-admin-text-main tracking-tighter leading-none uppercase">{selectedRoom.name}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 rounded-3xl bg-admin-bg border border-admin-border flex flex-col">
                                    <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3">Configurations</span>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <BedDouble size={16} className="text-admin-primary" />
                                            <span className="text-sm font-black text-admin-text-main">{selectedRoom.bed_type} Room</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Maximize size={16} className="text-admin-primary" />
                                            <span className="text-sm font-black text-admin-text-main">{selectedRoom.room_size} Square Meters</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-admin-primary text-white flex flex-col shadow-xl shadow-admin-primary/20">
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-3">Starting From</span>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black">{formatRupiah(selectedRoom.price)}</span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Net Per Night</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <section>
                                    <h4 className="text-xs font-black text-admin-text-main uppercase tracking-widest mb-6 flex justify-between items-center">
                                        Service Amenities
                                        <span className="w-12 h-px bg-admin-border" />
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(selectedRoom.facilities || []).map((a, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-admin-bg border border-admin-border text-admin-text-main rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-all">
                                                <Check size={14} className="opacity-50" /> {a}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-black text-admin-text-main uppercase tracking-widest mb-4">Description Text</h4>
                                    <p className="text-sm font-medium text-admin-text-muted leading-relaxed italic border-l-4 border-admin-primary/10 pl-6">
                                        "{selectedRoom.description}"
                                    </p>
                                </section>

                                <div className="pt-10 flex gap-4">
                                    <button
                                        onClick={() => navigate(`/admin/rooms/edit/${selectedRoom.id}`)}
                                        className="flex-1 btn-primary py-5 rounded-[2rem] shadow-2xl shadow-admin-primary/30 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] font-black"
                                    >
                                        Edit Specifications
                                    </button>
                                    <button
                                        onClick={() => setSelectedRoom(null)}
                                        className="w-20 h-20 rounded-[2rem] bg-admin-bg border border-admin-border text-admin-text-muted flex items-center justify-center hover:bg-white transition-all shadow-xl"
                                    >
                                        <ChevronRight size={32} />
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
