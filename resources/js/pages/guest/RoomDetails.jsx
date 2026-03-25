import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';

export default function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [room, setRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/resorts/${id}`)
            .then(res => {
                setRoom(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch room details", err);
                setIsLoading(false);
            });
    }, [id]);

    const handleBooking = () => {
        // Here we could store room details in context or state before navigating
        navigate('/booking'); 
    };

    if (isLoading) {
        return <div className="pt-32 text-center text-xl text-gray-500 font-bold min-h-screen">Memuat data kamar...</div>;
    }

    if (!room) {
        return <div className="pt-32 text-center text-xl text-gray-500 font-bold min-h-screen">Kamar tidak ditemukan.</div>;
    }

    // Dynamic Pricing Logic
    const today = new Date().getDay();
    const isWeekend = today === 0 || today === 5 || today === 6; // 0=Sun, 5=Fri, 6=Sat
    const currentPrice = isWeekend && room.price_weekend ? room.price_weekend : room.price;

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
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[400px] mb-10 overflow-hidden rounded-3xl">
                <div className="md:col-span-2 md:row-span-2">
                    <img src={(Array.isArray(room.gallery) && room.gallery.length > 0 ? room.gallery[0] : "/images/resort-room.png")} alt="Main Room" className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer" />
                </div>
                <div className="md:col-span-1 md:row-span-1 hidden md:block">
                    <img src={(Array.isArray(room.gallery) && room.gallery.length > 1 ? room.gallery[1] : "/images/resort-room.png")} alt="Room Detail 1" className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer brightness-110" />
                </div>
                <div className="md:col-span-1 md:row-span-1 hidden md:block">
                    <img src={(Array.isArray(room.gallery) && room.gallery.length > 2 ? room.gallery[2] : "/images/resort-room.png")} alt="Room Detail 2" className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer brightness-90" />
                </div>
                <div className="md:col-span-2 md:row-span-1 hidden md:block relative">
                    <img src={(Array.isArray(room.gallery) && room.gallery.length > 3 ? room.gallery[3] : "/images/resort-room.png")} alt="Room Detail 3" className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer saturate-50" />
                    {Array.isArray(room.gallery) && room.gallery.length > 4 && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold text-2xl">+{room.gallery.length - 4}</span>
                        </div>
                    )}
                    <button className="absolute bottom-4 right-4 bg-white text-gray-900 px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-50 flex items-center gap-2">
                        <i className="fas fa-th"></i> Lihat Semua Foto
                    </button>
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
                    <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-32">
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
                                        <input type="date" className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer focus:ring-0 p-0 border-0" defaultValue="2026-03-10" />
                                    </label>
                                </div>
                                <div className="hover:bg-gray-50 focus-within:bg-gray-50 transition">
                                    <label className="block p-4 cursor-pointer">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Check-out</span>
                                        <input type="date" className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer focus:ring-0 p-0 border-0" defaultValue="2026-03-11" />
                                    </label>
                                </div>
                            </div>
                            <div className="relative hover:bg-gray-50 focus-within:bg-gray-50 transition">
                                <label className="block p-4 cursor-pointer">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Tamu</span>
                                    <select className="w-full font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer appearance-none focus:ring-0 p-0 border-0" defaultValue="2">
                                        <option value="1">1 Dewasa</option>
                                        <option value="2">2 Dewasa</option>
                                        <option value="3">3 Dewasa</option>
                                        <option value="4">4 Dewasa</option>
                                    </select>
                                </label>
                                <i className="fas fa-chevron-down text-gray-400 text-xs absolute right-4 top-1/2 translate-y-1 pointer-events-none"></i>
                            </div>
                        </div>

                        <button onClick={handleBooking} className="w-full bg-eling-red text-white py-4 rounded-xl font-bold text-lg hover:bg-red-800 transition shadow-lg mb-4">
                            Pesan Sekarang
                        </button>
                        <p className="text-center text-xs text-gray-500 mb-6">Anda belum akan dikenakan biaya</p>

                        {/* Price breakdown */}
                        <div className="space-y-3 pt-6 border-t border-dashed border-gray-200 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span className="underline decoration-dotted text-gray-500">{formatRupiah(currentPrice)} x 1 malam</span>
                                <span>{formatRupiah(currentPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span className="underline decoration-dotted text-gray-500">Pajak & Layanan Hotel</span>
                                <span>{formatRupiah(currentPrice * 0.1)}</span>
                            </div>
                            <div className="flex justify-between pt-4 font-bold text-lg text-eling-green border-t border-gray-100">
                                <span>Total Harga</span>
                                <span>{formatRupiah(currentPrice * 1.1)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Booking Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div>
                        <span className="text-xs text-gray-500 block mb-0.5">Mulai dari</span>
                        <span className="text-lg font-bold font-serif text-eling-green">{formatRupiah(currentPrice)}</span>
                        <span className="text-gray-400 text-[10px]">/mlm</span>
                    </div>
                    <button onClick={handleBooking} className="bg-eling-red text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-800 transition shadow-md">
                        Pesan
                    </button>
                </div>
            </div>
        </main>
    );
}
