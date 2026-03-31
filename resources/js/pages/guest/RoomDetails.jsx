import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import IconRenderer from '../../components/IconRenderer';

export default function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [room, setRoom] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState(2);
    
    // Gallery & Lightbox states
    const [showFullGallery, setShowFullGallery] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState(null); // { url: string, type: 'image' | 'video' }

    const defaultImages = [
        "/images/resort-room.png",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    ];

    const hasGallery = Array.isArray(room?.gallery) && room.gallery.length > 0;
    const galleryToDisplay = hasGallery ? room.gallery : defaultImages;

    // Media detection & rendering (Robust Version)
    const renderMedia = (mediaItem, alt) => {
        if (!mediaItem) return <img src="/images/resort-room.png" alt="Default" className="w-full h-full object-cover" />;
        
        // Ensure string and clean
        const urlStr = typeof mediaItem === 'string' ? mediaItem : (mediaItem.url || "");
        const url = urlStr.trim();
        if (!url) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><i className="fas fa-image text-2xl"></i></div>;

        const isYouTube = /youtube\.com|youtu\.be/i.test(url);
        const isVimeo = /vimeo\.com/i.test(url);
        const isDirectVideo = /\.(mp4|webm|ogg)/i.test(url) || url.startsWith('data:video');

        // Handle YouTube / Vimeo (Grid View Optimized)
        if (isYouTube || isVimeo) {
            let embedUrl = "";
            let thumbUrl = "";
            
            if (isYouTube) {
                const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop().split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
                thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            } else if (isVimeo) {
                const videoId = url.split('/').pop().split('?')[0];
                embedUrl = `https://player.vimeo.com/video/${videoId}`;
                thumbUrl = null;
            }

            return (
                <div 
                    className="w-full h-full relative group cursor-pointer overflow-hidden bg-slate-900"
                    onClick={() => setLightboxMedia({ url: embedUrl, type: 'iframe' })}
                >
                    {thumbUrl ? (
                        <img 
                            src={thumbUrl} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" 
                            alt={alt}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                             <i className="fab fa-vimeo-v text-white/20 text-4xl"></i>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/30 transition-all duration-500">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white shadow-2xl scale-90 group-hover:scale-100 transition duration-500">
                            <i className="fas fa-play text-sm ml-1"></i>
                        </div>
                    </div>
                </div>
            );
        }

        // Handle Direct Video Files
        if (isDirectVideo) {
            return (
                <div 
                    className="w-full h-full relative group cursor-pointer bg-slate-950"
                    onClick={() => setLightboxMedia({ url: url, type: 'video' })}
                >
                    <video 
                        src={url} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                        muted 
                        playsInline 
                        preload="metadata"
                        loop
                        onLoadedMetadata={(e) => {
                            // Seek to 1s to ensure a frame is shown if metadata is ready
                            e.target.currentTime = 0.5;
                        }}
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => {e.target.pause();}}
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none group-hover:bg-black/30 transition-all">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white shadow-2xl scale-90 group-hover:scale-110 transition duration-500">
                            <i className="fas fa-play text-sm ml-1"></i>
                        </div>
                    </div>
                </div>
            );
        }

        // Standard Image (Handling potential base64 or long URLs)
        return (
            <div className="w-full h-full overflow-hidden bg-gray-100">
                <img 
                    src={url} 
                    alt={alt} 
                    onClick={() => setLightboxMedia({ url, type: 'image' })}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000 cursor-pointer" 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/resort-room.png";
                    }}
                />
            </div>
        );
    };

    const handleStartDateChange = (val) => {
        setStartDate(val);
        const d1 = new Date(val);
        const d2 = new Date(endDate);
        
        // If checkout is before or same as checkin, move it to next day
        if (d2 <= d1) {
            const nextDay = new Date(d1);
            nextDay.setDate(nextDay.getDate() + 1);
            setEndDate(nextDay.toISOString().split('T')[0]);
        }
    };

    const minCheckoutDate = startDate ? (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    })() : new Date(new Date().getTime() + 86400000).toISOString().split('T')[0];

    const fetchRoomDetails = async () => {
        if (!isInitialLoading) setIsUpdating(true);
        try {
            const response = await axios.get(`/api/resorts/${id}`, {
                params: {
                    check_in: startDate,
                    check_out: endDate
                }
            });
            setRoom(response.data);
        } catch (error) {
            console.error('Error fetching room details:', error);
        } finally {
            setIsInitialLoading(false);
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchRoomDetails();
        }
    }, [id, startDate, endDate]);

    const handleBooking = () => {
        const guestsNum = parseInt(guests);
        const days = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const roomsNeeded = room ? Math.ceil(guestsNum / room.capacity) : 1;
        
        const payload = {
            room: {
                ...room,
                image: galleryToDisplay[0] || "/images/resort-room.png"
            },
            checkIn: startDate,
            checkOut: endDate,
            guests: guestsNum,
            totalNights: days,
            roomsNeeded: roomsNeeded
        };

        navigate('/booking', { state: payload });
    };

    if (isInitialLoading) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-20 h-20 relative mb-8">
                    <div className="absolute inset-0 border-4 border-eling-green/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-eling-green border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900 animate-pulse">Menyiapkan Kamar Impian Anda...</h3>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4 bg-slate-50">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-exclamation-triangle text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold font-serif mb-4 text-center">Kamar Tidak Ditemukan</h2>
                <p className="text-gray-500 text-center mb-8 max-w-md">Maaf, kami tidak dapat menemukan informasi kamar yang Anda cari. Silakan kembali ke daftar resort kami.</p>
                <button 
                    onClick={() => navigate('/resorts')} 
                    className="bg-eling-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition shadow-lg"
                >
                    Kembali ke Daftar Resort
                </button>
            </div>
        );
    }

    const guestsNum = parseInt(guests);
    const roomsNeeded = Math.ceil(guestsNum / room.capacity);
    const isRoomAvailable = room.available_stock >= roomsNeeded;
    const currentPrice = room.price;

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Gallery Section */}
            <div className="pt-24 pb-12 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-eling-green/10 text-eling-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Resort & Spa</span>
                                <div className="flex text-yellow-400 text-xs">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-2 leading-tight">{room.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><i className="fas fa-map-marker-alt text-eling-green"></i> Eling Bening, Semarang</span>
                                <span className="flex items-center gap-1.5"><i className="fas fa-user-friends text-eling-green"></i> Kapasitas: {room.capacity} Orang</span>
                                <span className="flex items-center gap-1.5"><i className="fas fa-expand-arrows-alt text-eling-green"></i> Luas: {room.room_size} m&sup2;</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition shadow-sm text-gray-400">
                                <i className="far fa-heart"></i>
                            </button>
                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition shadow-sm text-gray-400">
                                <i className="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>

                    {/* Image Grid Optimized */}
                    <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[550px] rounded-[2.5rem] overflow-hidden group shadow-2xl relative animate-fade-in-up">
                        <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden">
                            {renderMedia(galleryToDisplay[0], room.name)}
                        </div>
                        <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden">
                            {renderMedia(galleryToDisplay[1] || galleryToDisplay[0], "Gallery 1")}
                        </div>
                        <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden">
                            {renderMedia(galleryToDisplay[2] || galleryToDisplay[0], "Gallery 2")}
                        </div>
                        <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden">
                            {renderMedia(galleryToDisplay[3] || galleryToDisplay[0], "Gallery 3")}
                        </div>
                        <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden group/last">
                            {renderMedia(galleryToDisplay[4] || galleryToDisplay[0], "Gallery 4")}
                            {galleryToDisplay.length > 5 && (
                                <div 
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer group-hover/last:bg-black/40 transition-all duration-500"
                                    onClick={() => setShowFullGallery(true)}
                                >
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">+{galleryToDisplay.length - 4}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Foto Lainnya</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Overlay Show All Images Button */}
                        <button 
                            onClick={() => setShowFullGallery(true)}
                            className="absolute bottom-6 right-6 px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-white transition-all shadow-xl active:scale-95 duration-300"
                        >
                            <i className="fas fa-th-large"></i> Lihat Semua Foto
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left: Info Details */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-12 py-10 px-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] animate-fade-in-up">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-eling-green/5 text-eling-green flex items-center justify-center">
                                    <i className="fas fa-user-friends text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Max Tamu</p>
                                    <p className="font-bold text-gray-900">{room.capacity} Orang</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <i className="fas fa-bed text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Tipe Bed</p>
                                    <p className="font-bold text-gray-900">{room.bed_type || 'King Bed'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <i className="fas fa-expand-arrows-alt text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Luas Kamar</p>
                                    <p className="font-bold text-gray-900">{room.room_size || '24'} m&sup2;</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Tentang Kamar Ini</h2>
                            <p className="text-gray-600 leading-[1.8] text-lg text-justify font-light italic">
                                "{room.description || `Nikmati pemandangan spektakuler Rawa Pening dan pegunungan sekitarnya langsung dari balkon pribadi Anda. ${room.name} menawarkan keseimbangan sempurna antara kemewahan modern dan sentuhan alam yang menenangkan.`}"
                            </p>
                        </div>

                        {/* Facilities: The Modern Lucide Version */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Fasilitas Premium</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10">
                                {(room.facilities || []).map((a, i) => (
                                    <div key={i} className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-eling-green flex items-center justify-center group-hover:bg-eling-green group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-eling-green/20 group-hover:-translate-y-1.5">
                                            <IconRenderer icon={a.icon} size={28} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-wide group-hover:text-eling-green transition-colors">{a.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Fasilitas Kamar</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-16 border-t border-gray-100 flex flex-col gap-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-bold font-serif text-gray-900">Ulasan Pengalaman</h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-500">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                    <span className="font-bold text-gray-900">4.9 / 5.0</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 text-6xl text-slate-50 font-serif rotate-12 pointer-events-none group-hover:text-eling-green/10 transition-colors">"</div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-eling-green to-emerald-700 text-white flex items-center justify-center font-serif text-3xl shadow-lg">
                                                R
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase tracking-tight">Rina Gunawan</h4>
                                                <p className="text-xs text-gray-400 font-bold">Terverifikasi • 2 hari yang lalu</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-lg leading-relaxed text-left italic font-light font-serif">"Pengalaman menginap yang tak terlupakan. Kamarnya jauh lebih bagus dari foto. Staff sangat ramah dan pemandangan paginya benar-benar tiada tanding..."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sticky Widget */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className={`bg-white rounded-[3rem] p-10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-32 transition-all duration-700 ${isUpdating ? 'opacity-50 grayscale scale-[0.98]' : 'opacity-100'}`}>
                            <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-2 text-center">Harga per Malam</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-4xl font-black font-serif text-gray-900">{formatRupiah(currentPrice)}</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-eling-green transition-all">
                                        <label className="block mb-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">Check-In</label>
                                        <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]}
                                            onChange={e => handleStartDateChange(e.target.value)} 
                                            className="w-full text-sm font-black text-gray-900 outline-none border-0 p-0 focus:ring-0 cursor-pointer" />
                                    </div>
                                    <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-eling-green transition-all">
                                        <label className="block mb-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">Check-Out</label>
                                        <input type="date" value={endDate} min={minCheckoutDate}
                                            onChange={e => setEndDate(e.target.value)} 
                                            className="w-full text-sm font-black text-gray-900 outline-none border-0 p-0 focus:ring-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-eling-green transition-all">
                                    <label className="block mb-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">Jumlah Tamu Dewasa</label>
                                    <select value={guests} onChange={e => setGuests(parseInt(e.target.value))} 
                                        className="w-full text-sm font-black text-gray-900 outline-none border-0 p-0 focus:ring-0 cursor-pointer appearance-none bg-transparent">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <option key={n} value={n}>{n} Orang</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button onClick={handleBooking} disabled={!isRoomAvailable}
                                className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 ${isRoomAvailable ? 'bg-eling-green text-white hover:bg-emerald-800 hover:shadow-eling-green/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                {isRoomAvailable ? 'Amankan Kamar Sekarang' : 'Stok Menipis/Habis'}
                            </button>

                            <div className="mt-8 space-y-4 pt-8 border-t border-dashed border-slate-100">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Total Unit Kamar</span>
                                    <span className="font-black text-gray-900">{roomsNeeded} Unit</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Pajak Negara (10%)</span>
                                    <span className="font-black text-gray-900">TERMASUK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox / Sidebar Overlays */}
            {lightboxMedia && (
                <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setLightboxMedia(null)}>
                    <button className="absolute top-8 right-10 text-white hover:text-eling-green transition-colors z-[2100]" onClick={() => setLightboxMedia(null)}>
                        <X size={40} strokeWidth={1} />
                    </button>
                    <div className="w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        {lightboxMedia.type === 'image' && <img src={lightboxMedia.url} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-scale-up" alt="Lightbox" />}
                        {lightboxMedia.type === 'iframe' && <iframe src={lightboxMedia.url} className="w-full h-full rounded-2xl shadow-2xl border-0 animate-scale-up" allowFullScreen allow="autoplay"></iframe>}
                        {lightboxMedia.type === 'video' && <video src={lightboxMedia.url} className="max-w-full max-h-full rounded-2xl shadow-2xl animate-scale-up" controls autoPlay loop></video>}
                    </div>
                </div>
            )}
        </div>
    );
}
