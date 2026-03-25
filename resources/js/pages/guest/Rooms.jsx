import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, formatRupiah } from '../../utils/data';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [showReschedule, setShowReschedule] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setRooms(getRooms());
    }, []);

    const handleRoomSelect = (roomName) => {
        const slug = roomName.replace(/\s+/g, '-').toLowerCase();
        navigate(`/rooms/${slug}`);
    };

    return (
        <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-4 font-serif">Pilih Villa & Resort</h1>
                    <p className="text-gray-500">Temukan kenyamanan istirahat di tengah alam Ambarawa.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex gap-4 overflow-x-auto w-full lg:w-auto">
                    <div className="flex flex-col min-w-[120px]">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Check In</span>
                        <input type="date" className="font-bold text-sm focus:outline-none bg-transparent" defaultValue="2026-03-10" />
                    </div>
                    <div className="w-px h-10 bg-gray-200 shrink-0"></div>
                    <div className="flex flex-col min-w-[120px]">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Check Out</span>
                        <input type="date" className="font-bold text-sm focus:outline-none bg-transparent" defaultValue="2026-03-11" />
                    </div>
                    <button className="bg-eling-green text-white px-6 rounded-xl font-bold text-sm hover:bg-green-800 transition whitespace-nowrap">
                        Cek Ketersediaan
                    </button>
                </div>
            </div>

            {/* Room cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((r, idx) => {
                    const isFull = r.status === 'full' || r.stock === 0;
                    const isMaintenance = r.status === 'maintenance';
                    const unavailable = isFull || isMaintenance;
                    const badgeText = isMaintenance ? 'Perbaikan' : isFull ? 'Sold Out' : `${r.stock} Unit Tersisa`;

                    // Dynamic Pricing Logic
                    const today = new Date().getDay();
                    const isWeekend = today === 0 || today === 5 || today === 6; // 0=Sun, 5=Fri, 6=Sat
                    const currentPrice = isWeekend && r.priceWeekend ? r.priceWeekend : r.price;

                    return (
                        <div key={idx} className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group ${unavailable ? 'opacity-75' : ''}`}>
                            <div className="h-64 overflow-hidden relative">
                                <img src={(Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : r.image) || "/images/resort-room.png"} className={`w-full h-full object-cover group-hover:scale-110 transition duration-700 ${unavailable ? 'grayscale' : ''}`} alt={r.name} />
                                {unavailable ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-white text-gray-900 font-bold px-6 py-2 rounded-full uppercase tracking-widest text-sm">{badgeText}</span>
                                    </div>
                                ) : (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-eling-green shadow-sm">{badgeText}</div>
                                )}
                            </div>
                            <div className="p-8">
                                <h3 className="font-bold text-2xl mb-2 font-serif text-gray-900">{r.name}</h3>
                                <div className="flex gap-4 text-gray-400 mb-6 text-sm">
                                    {r.bed && <span><i className="fas fa-bed mr-2 text-eling-green"></i>{r.bed}</span>}
                                    <span><i className="fas fa-user-friends mr-2 text-eling-green"></i>{r.capacity} Tamu</span>
                                    {r.size && <span><i className="fas fa-expand mr-2 text-eling-green"></i>{r.size} m&sup2;</span>}
                                </div>
                                <ul className="space-y-2 mb-8 text-sm text-gray-600">
                                    {!unavailable ? (
                                        (r.amenities || []).map((a, i) => (
                                            <li key={i}><i className="fas fa-check text-eling-green mr-2"></i>{a}</li>
                                        ))
                                    ) : (
                                        <li><i className="fas fa-calendar-times text-red-500 mr-2"></i>Tidak Tersedia</li>
                                    )}
                                </ul>
                                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                    <p className={`text-2xl font-bold font-serif ${unavailable ? 'text-gray-400' : 'text-eling-green'}`}>
                                        {formatRupiah(currentPrice)}<span className="text-xs text-gray-400 ml-1 font-sans font-normal">/malam</span>
                                    </p>
                                    {unavailable ? (
                                        <button disabled className="bg-gray-200 text-gray-400 font-bold py-3 px-6 rounded-xl cursor-not-allowed">Habis</button>
                                    ) : (
                                        <button onClick={() => handleRoomSelect(r.name)} className="bg-eling-red text-white font-bold py-3 px-6 rounded-xl hover:bg-red-800 transition">Pilih</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-24 bg-green-50/50 border border-green-900/10 rounded-3xl p-12 text-center">
                <h2 className="text-3xl font-bold mb-4 font-serif text-gray-900">Kebijakan Reschedule</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 tracking-wide">
                    Kami memahami rencana perjalanan Anda bisa berubah. Nikmati kemudahan reschedule maksimal H-7 sebelum kedatangan (syarat: selama unit masih tersedia dalam rentang 2-3 bulan).
                </p>
                <button onClick={() => setShowReschedule(true)} className="text-eling-green font-bold hover:underline">
                    Kelola Booking & Reschedule <i className="fas fa-external-link-alt ml-1"></i>
                </button>
            </div>

            {/* Reschedule Modal */}
            {showReschedule && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 lg:p-12 relative shadow-2xl">
                        <button onClick={() => setShowReschedule(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 cursor-pointer">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <h3 className="font-bold font-serif text-gray-900 text-2xl mb-8">Kelola Reschedule</h3>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-sm text-yellow-700">
                            <p><i className="fas fa-info-circle mr-2"></i> Reschedule hanya berlaku maksimal <strong>H-7</strong> dari tanggal check-in asli.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Booking</label>
                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-eling-green focus:ring-1 focus:ring-eling-green" placeholder="Contoh: EB-RS-123456" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Lama</label>
                                    <input type="text" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-400" value="10 Maret 2026" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Baru</label>
                                    <input type="date" className="w-full bg-white border border-eling-green rounded-xl px-4 py-3 focus:outline-none ring-2 ring-eling-green/20" />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400">*) Ketersediaan unit akan dicek secara real-time untuk rentang 2-3 bulan kedepan.</p>
                            <button
                                onClick={() => {
                                    alert('Permintaan Reschedule Terkirim! Tim kami akan melakukan verifikasi ketersediaan.');
                                    setShowReschedule(false);
                                }}
                                className="w-full bg-eling-green text-white font-bold py-4 rounded-xl hover:bg-green-800 transition mt-4"
                            >
                                Ajukan Perubahan Jadwal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
