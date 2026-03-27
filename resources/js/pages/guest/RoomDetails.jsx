import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';

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
    })() : '';

    useEffect(() => {
        if (!room) setIsInitialLoading(true);
        else setIsUpdating(true);

        axios.get(`/api/resorts/${id}`, {
            params: {
                check_in: startDate,
                check_out: endDate
            }
        })
            .then(res => {
                setRoom(res.data);
                setIsInitialLoading(false);
                setIsUpdating(false);
            })
            .catch(err => {
                console.error("Failed to fetch room details", err);
                setIsInitialLoading(false);
                setIsUpdating(false);
            });
    }, [id, startDate, endDate]);

    const handleBooking = () => {
        navigate('/booking', { 
            state: { 
                room, 
                checkIn: startDate, 
                checkOut: endDate, 
                guests,
                roomsNeeded,
                totalNights: Math.max(1, (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
            } 
        }); 
    };

    if (isInitialLoading) {
        return (
            <div className="pt-32 flex flex-col items-center justify-center min-h-screen animate-fade-in">
                <div className="w-16 h-16 border-4 border-eling-green/20 border-t-eling-green rounded-full animate-spin mb-6"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Menyiapkan Pengalaman Anda...</p>
            </div>
        );
    }

    if (!room) {
        return <div className="pt-32 text-center text-xl text-gray-500 font-bold min-h-screen">Kamar tidak ditemukan.</div>;
    }

    // Dynamic Pricing Logic
    const today = new Date().getDay();
    const isWeekend = today === 0 || today === 5 || today === 6; // 0=Sun, 5=Fri, 6=Sat
    const currentPrice = isWeekend && room.price_weekend ? room.price_weekend : room.price;

    const roomsNeeded = Math.ceil(guests / (room.capacity || 2));
    const isRoomAvailable = room.available_stock !== undefined ? room.available_stock >= roomsNeeded : room.stock >= roomsNeeded;

    return (
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
            {/* Room Headline */}
            <div className="mb-6">
                <h1 className="text-4xl font-serif font-bold mb-2 text-gray-900">{room.name}</h1>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center text-yellow-400">
                        <i className="fas fa-star text-sm"></i>
                        <i className="fas fa-star text-sm"></i>
                        <i className="fas fa-star text-sm"></i>
                        <i className="fas fa-star text-sm"></i>
                        <i className="fas fa-star-half-alt text-sm"></i>
                        <span className="text-gray-900 font-bold ml-2">4.8</span>
                        <span className="text-gray-400 ml-1">(124 Penilaian)</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span><i className="fas fa-map-marker-alt mr-1 text-eling-green"></i> Ambarawa, Jawa Tengah</span>
                </div>
            </div>

            {/* Image Gallery Grid */}
            <div className="mb-10 group/gallery">
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[450px] overflow-hidden rounded-3xl relative">
                    {/* Main Slot */}
                    <div className="md:col-span-2 md:row-span-2 relative h-full overflow-hidden">
                        {renderMedia(galleryToDisplay[0], "Main")}
                    </div>

                    {/* Secondary Slots (Adaptive) */}
                    {galleryToDisplay.slice(1, 4).map((media, idx) => (
                        <div key={idx} className={`relative overflow-hidden hidden md:block ${idx === 2 ? 'md:col-span-2 md:row-span-1' : 'md:col-span-1 md:row-span-1'}`}>
                            {renderMedia(media, `Detail ${idx+1}`)}
                        </div>
                    ))}

                    {/* View All Button Overlay */}
                    {hasGallery && (
                        <button 
                            onClick={() => setShowFullGallery(true)}
                            className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-gray-900 px-6 py-3 rounded-2xl font-black text-xs shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center gap-3 border border-white/50 uppercase tracking-[0.2em] group"
                        >
                            <i className="fas fa-th-large text-eling-green group-hover:rotate-90 transition-transform duration-500"></i> 
                            {room.gallery.length > 4 ? `Explore ${room.gallery.length} Media` : 'Lihat Semua Foto'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                {/* Left Content: Description, Features, Reviews */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-eling-green text-xl">
                                <i className="fas fa-user-friends"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Kapasitas</p>
                                <p className="font-medium text-gray-900">{room.capacity || 2} Tamu</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-eling-green text-xl">
                                <i className="fas fa-bed"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Tipe Ranjang</p>
                                <p className="font-medium text-gray-900">{room.bed_type || '1 Queen Bed'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-eling-green text-xl">
                                <i className="fas fa-expand"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Ukuran Kamar</p>
                                <p className="font-medium text-gray-900">{room.room_size || '24'} m&sup2;</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 font-serif text-gray-900">Tentang Kamar Ini</h2>
                        <p className="text-gray-600 leading-relaxed mb-4 text-justify">
                            {room.description || `Nikmati pemandangan spektakuler Rawa Pening dan pegunungan sekitarnya langsung dari balkon pribadi Anda. ${room.name} menawarkan keseimbangan sempurna antara kemewahan modern dan sentuhan alam yang menenangkan.`}
                        </p>
                    </div>

                    {/* Facilities */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900">Fasilitas Lengkap</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {(room.facilities || []).map((a, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <i className="fas fa-check text-xl text-eling-green w-6"></i>
                                    <span className="text-gray-700 text-sm">{a}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews Dummy Content */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold font-serif text-gray-900">Penilaian Tamu</h2>
                            <button className="text-eling-green font-bold text-sm hover:underline">Lihat Semua Ulasan</button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            R
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Rina Gunawan</h4>
                                            <p className="text-xs text-gray-500">2 hari yang lalu</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 text-sm">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed text-justify">"Kamarnya sangat bersih dan wangi! Pemandangannya langsung ke danau dan gunung sangat luar biasa untuk dinikmati saat pagi hari."</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Widget: Sticky Booking */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className={`bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-32 transition-all duration-500 ${isUpdating ? 'opacity-60 grayscale-[0.2] scale-[0.98]' : 'opacity-100'}`}>
                        {isUpdating && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-3xl">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-eling-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-eling-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-eling-green rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div className="mb-6 flex items-end gap-1">
                            <span className="text-3xl font-bold font-serif text-eling-green">{formatRupiah(currentPrice)}</span>
                            <span className="text-gray-400 text-sm mb-1">/ malam</span>
                        </div>

                        {/* Date & Guest Picker */}
                        <div className="border border-gray-200 rounded-2xl mb-6 overflow-hidden bg-white relative">
                            <div className="grid grid-cols-2 border-b border-gray-200">
                                <div className="border-r border-gray-200 hover:bg-gray-50 focus-within:bg-gray-50 transition">
                                    <label className="block p-4 cursor-pointer">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Check-in</span>
                                        <input 
                                            type="date" 
                                            value={startDate} 
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => handleStartDateChange(e.target.value)} 
                                            className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer focus:ring-0 p-0 border-0" 
                                        />
                                    </label>
                                </div>
                                <div className="hover:bg-gray-50 focus-within:bg-gray-50 transition">
                                    <label className="block p-4 cursor-pointer">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Check-out</span>
                                        <input 
                                            type="date" 
                                            value={endDate} 
                                            min={minCheckoutDate}
                                            onChange={e => setEndDate(e.target.value)} 
                                            className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer focus:ring-0 p-0 border-0" 
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="relative hover:bg-gray-50 focus-within:bg-gray-50 transition">
                                <label className="block p-4 cursor-pointer">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Tamu</span>
                                    <select value={guests} onChange={e => setGuests(parseInt(e.target.value))} className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer appearance-none focus:ring-0 p-0 border-0">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <option key={n} value={n}>{n} Dewasa</option>
                                        ))}
                                    </select>
                                </label>
                                <i className="fas fa-chevron-down text-gray-400 text-xs absolute right-4 top-1/2 translate-y-1 pointer-events-none"></i>
                            </div>
                        </div>

                        {roomsNeeded > 1 && isRoomAvailable && (
                            <div className="mb-6 p-4 bg-eling-red/5 border border-eling-red/10 rounded-2xl flex gap-3 items-start animate-fade-in">
                                <i className="fas fa-info-circle text-eling-red mt-1"></i>
                                <p className="text-[11px] text-eling-red leading-relaxed">
                                    Kapasitas kamar ini {room.capacity} orang. Anda memerlukan <strong>{roomsNeeded} unit kamar</strong> untuk menampung {guests} tamu.
                                </p>
                            </div>
                        )}

                        {!isRoomAvailable && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-2xl flex gap-3 items-start animate-pulse">
                                <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
                                <p className="text-[11px] text-red-700 leading-relaxed font-bold">
                                    Maaf, stok unit tidak mencukupi untuk tanggal dan jumlah unit yang dipilih. Tersisa {room.available_stock} unit.
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleBooking} 
                            disabled={!isRoomAvailable}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg mb-4 transition ${isRoomAvailable ? 'bg-eling-red text-white hover:bg-red-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isRoomAvailable ? 'Pesan Sekarang' : 'Stok Tidak Cukup'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mb-6">Anda belum akan dikenakan biaya</p>

                        {/* Price breakdown */}
                        <div className="space-y-3 pt-6 border-t border-dashed border-gray-200 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span className="underline decoration-dotted text-gray-500">{formatRupiah(currentPrice)} x {roomsNeeded} unit</span>
                                <span>{formatRupiah(currentPrice * roomsNeeded)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span className="underline decoration-dotted text-gray-500">Pajak & Layanan (10%)</span>
                                <span>{formatRupiah((currentPrice * roomsNeeded) * 0.1)}</span>
                            </div>
                            <div className="flex justify-between pt-4 font-bold text-lg text-eling-green border-t border-gray-100">
                                <span>Total Harga</span>
                                <span>{formatRupiah((currentPrice * roomsNeeded) * 1.1)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Booking Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div>
                        <span className="text-xs text-gray-500 block mb-0.5">{roomsNeeded} Unit x 1 Malam</span>
                        <span className="text-lg font-bold font-serif text-eling-green">{formatRupiah(currentPrice * roomsNeeded)}</span>
                        <span className="text-gray-400 text-[10px]">/total</span>
                    </div>
                    <button 
                        onClick={handleBooking} 
                        disabled={!isRoomAvailable}
                        className={`px-8 py-3 rounded-xl font-bold text-sm shadow-md transition ${isRoomAvailable ? 'bg-eling-red text-white hover:bg-red-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        {isRoomAvailable ? 'Pesan' : 'Habis'}
                    </button>
                </div>
            </div>

            {/* View All Gallery Modal */}
            {showFullGallery && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
                    <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <div>
                            <h2 className="text-xl font-serif font-black text-gray-900 tracking-tight">{room.name}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{room.gallery?.length || 0} Media Terunggah</p>
                        </div>
                        <button 
                            onClick={() => setShowFullGallery(false)}
                            className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-eling-red hover:text-white transition-all shadow-sm"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-20">
                            {Array.isArray(room.gallery) && room.gallery.map((media, i) => (
                                <div key={i} className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 group shadow-sm hover:shadow-xl transition-all">
                                    {renderMedia(media, `Gallery ${i+1}`)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxMedia && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in">
                    <button 
                        onClick={() => setLightboxMedia(null)}
                        className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                    
                    <div className="w-full max-w-6xl max-h-[85vh] flex items-center justify-center">
                        {lightboxMedia.type === 'iframe' ? (
                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                                <iframe 
                                    src={lightboxMedia.url.replace('mute=1', 'mute=0&autoplay=1')} 
                                    className="w-full h-full" 
                                    allow="autoplay; encrypted-media; fullscreen"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : lightboxMedia.type === 'video' ? (
                            <video 
                                src={lightboxMedia.url} 
                                className="max-w-full max-h-full rounded-2xl shadow-2xl" 
                                controls 
                                autoPlay 
                            />
                        ) : (
                            <img 
                                src={lightboxMedia.url} 
                                className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-scale-up" 
                                alt="Detail" 
                            />
                        )}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] font-serif">Detail Media • Eling Bening Resort</p>
                    </div>
                </div>
            )}
        </main>
    );
}
