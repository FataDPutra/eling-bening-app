import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import { useAuth } from '../../utils/AuthContext';
import IconRenderer from '../../components/IconRenderer';
import { Calendar, Search, MapPin, Check, ChevronRight, X, Lock, Info, UserCircle, Loader2 } from 'lucide-react';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReschedule, setShowReschedule] = useState(false);
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState(todayStr);
    const [checkOut, setCheckOut] = useState(tomorrowStr);
    
    // Reschedule states
    const [bookingCode, setBookingCode] = useState('');
    const [oldDate, setOldDate] = useState('');
    const [newDate, setNewDate] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Default images used only when no gallery images are present
    const defaultImages = [
        "/images/resort-room.png",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    ];

    const fetchRooms = (ci, co) => {
        setIsLoading(true);
        axios.get('/api/resorts', {
            params: {
                check_in: ci,
                check_out: co
            }
        })
            .then(res => {
                setRooms(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch resorts", err);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchRooms(checkIn, checkOut);
    }, []);

    const handleRoomSelect = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    const handleCheckInChange = (newCi) => {
        setCheckIn(newCi);
        const ciDate = new Date(newCi);
        const coDate = new Date(checkOut);
        
        // If check out is not after check in, set it to ci + 1 day
        if (coDate <= ciDate) {
            const nextDay = new Date(ciDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            setCheckOut(nextDay);
        }
    };

    const handleCheckBooking = async (code) => {
        if (!code || code.length < 5) return;
        setIsChecking(true);
        try {
            const { data } = await axios.get(`/api/transactions/check-booking/${code}`);
            setOldDate(data.check_in_date);
            setBookingData(data);
            toast.success('Pemesanan ditemukan!');
        } catch (error) {
            setOldDate('');
            setBookingData(null);
            toast.error(error.response?.data?.message || 'Kode booking tidak ditemukan');
        } finally {
            setIsChecking(false);
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!bookingCode || !newDate) {
            toast.error('Mohon isi kode booking dan tanggal baru');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`/api/transactions/${bookingCode}/reschedule`, {
                new_check_in_date: newDate,
                reason: 'Reschedule from guest dashboard'
            });
            toast.success('Permintaan reschedule berhasil dikirim!');
            setShowReschedule(false);
            // Reset fields
            setBookingCode('');
            setOldDate('');
            setNewDate('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengajukan reschedule');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-4 font-serif">Pilih Villa & Resort</h1>
                    <p className="text-gray-500">Temukan kenyamanan istirahat di tengah alam Ambarawa.</p>
                </div>
                <div className="bg-white p-6 lg:p-4 rounded-3xl shadow-xl border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto relative z-10 transition-all hover:shadow-2xl">
                    <div className="flex flex-1 items-center gap-4 p-4 lg:p-2 bg-gray-50/50 rounded-2xl border border-gray-100 lg:border-none lg:bg-transparent">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-eling-green shadow-sm shrink-0">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Check In</span>
                            <input 
                                type="date" 
                                className="font-black text-sm focus:outline-none bg-transparent text-gray-700 w-full" 
                                value={checkIn} 
                                min={todayStr}
                                onChange={e => handleCheckInChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-10 bg-gray-100 shrink-0"></div>

                    <div className="flex flex-1 items-center gap-4 p-4 lg:p-2 bg-gray-50/50 rounded-2xl border border-gray-100 lg:border-none lg:bg-transparent">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-eling-green shadow-sm shrink-0">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Check Out</span>
                            <input 
                                type="date" 
                                className="font-black text-sm focus:outline-none bg-transparent text-gray-700 w-full" 
                                value={checkOut}
                                min={new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                onChange={e => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => fetchRooms(checkIn, checkOut)}
                        className="bg-eling-green text-white px-8 h-14 lg:h-auto lg:py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                    >
                        <Search size={16} strokeWidth={3} />
                        Cek Ketersediaan
                    </button>
                </div>
           </div>

            {/* Room cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((r, idx) => {
                    const isFull = r.status === 'full' || (r.available_stock !== undefined ? r.available_stock === 0 : r.stock === 0);
                    const isMaintenance = r.status === 'maintenance';
                    const unavailable = isFull || isMaintenance;
                    const stockToShow = r.available_stock !== undefined ? r.available_stock : r.stock;
                    const badgeText = isMaintenance ? 'Perbaikan' : isFull ? 'Sold Out' : `${stockToShow} Unit Tersisa`;

                    // Dynamic Pricing Logic
                    const today = new Date().getDay();
                    const isWeekend = today === 0 || today === 6; // 0=Sun, 6=Sat (Adjusted as per common practice)
                    const currentPrice = isWeekend && r.price_weekend ? r.price_weekend : r.price;

                    return (
                        <div key={idx} className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group flex flex-col h-full hover:-translate-y-3 hover:shadow-2xl hover:border-eling-green/20 transition-all duration-500 ${unavailable ? 'opacity-75' : ''}`}>
                            <div className="h-64 overflow-hidden relative shrink-0">
                                <img 
                                    src={(Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery[0] : null) || defaultImages[idx % defaultImages.length]} 
                                    className={`w-full h-full object-cover group-hover:scale-110 transition duration-700 ${unavailable ? 'grayscale' : ''}`} 
                                    alt={r.name} 
                                />
                                {unavailable ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-white text-gray-900 font-bold px-6 py-2 rounded-full uppercase tracking-widest text-sm">{badgeText}</span>
                                    </div>
                                ) : (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-eling-green shadow-sm">{badgeText}</div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="font-bold text-2xl mb-2 font-serif text-gray-900 line-clamp-1">{r.name}</h3>
                                <div className="flex flex-wrap gap-4 text-gray-400 mb-6 text-sm">
                                    {r.bed_type && <span className="flex items-center gap-1.5"><IconRenderer icon="Bed" size={14} className="text-eling-green" /> {r.bed_type}</span>}
                                    <span className="flex items-center gap-1.5"><IconRenderer icon="Users" size={14} className="text-eling-green" /> {r.capacity} Tamu</span>
                                    {r.room_size && <span className="flex items-center gap-1.5"><IconRenderer icon="Maximize" size={14} className="text-eling-green" /> {r.room_size} m&sup2;</span>}
                                </div>
                                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                                    {!unavailable ? (
                                        <>
                                            {(Array.isArray(r.facilities) ? r.facilities : []).slice(0, 3).map((a, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 flex items-center justify-center text-eling-green opacity-70">
                                                        <IconRenderer icon={a.icon} size={14} />
                                                    </div>
                                                    <span className="font-medium line-clamp-1">{a.name}</span>
                                                </li>
                                            ))}
                                            {r.facilities?.length > 3 && (
                                                <li className="pl-8 text-[11px] font-bold text-eling-green/60 italic">
                                                    + {r.facilities.length - 3} fasilitas lainnya
                                                </li>
                                            )}
                                        </>
                                    ) : (
                                        <li className="flex items-center gap-3 text-red-400 font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                                            <X size={16} /> Tidak Tersedia Saat Ini
                                        </li>
                                    )}
                                </ul>
                                <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 mt-auto">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none px-1">Harga Per Malam</p>
                                        <div className={`flex items-baseline gap-1 ${unavailable ? 'text-gray-400' : 'text-eling-green'}`}>
                                            <span className="text-lg font-black font-serif">Rp</span>
                                            <span className="text-3xl font-black font-serif tracking-tighter">
                                                {Number(currentPrice).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold lowercase ml-1">/malam</span>
                                        </div>
                                    </div>
                                    {unavailable ? (
                                        <button disabled className="bg-gray-100 text-gray-400 font-bold py-4 px-8 rounded-2xl cursor-not-allowed w-full border border-gray-200 uppercase tracking-widest text-[11px]">Habis Dipesan</button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRoomSelect(r.id)} 
                                            className="bg-eling-red text-white font-black py-4 px-8 rounded-2xl hover:bg-red-800 hover:shadow-xl hover:shadow-red-500/20 active:scale-95 transition-all duration-300 group/btn relative overflow-hidden w-full shrink-0 flex items-center justify-center gap-2"
                                        >
                                            <span className="relative z-10 flex items-center gap-2 text-[11px] uppercase tracking-wide whitespace-nowrap">Lihat Detail Kamar <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </button>
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
                        
                        {!user ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                    <i className="fas fa-lock text-3xl"></i>
                                </div>
                                <h4 className="text-xl font-bold text-gray-800 mb-2">Login Diperlukan</h4>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Silakan login terlebih dahulu untuk mengakses data pesanan Anda dan mengajukan reschedule.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="bg-eling-green text-white font-bold py-4 px-10 rounded-2xl hover:bg-green-800 transition shadow-lg"
                                    >
                                        Login Sekarang
                                    </button>
                                    <button 
                                        onClick={() => navigate('/register')}
                                        className="bg-gray-100 text-gray-700 font-bold py-4 px-10 rounded-2xl hover:bg-gray-200 transition"
                                    >
                                        Daftar Akun
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-sm text-yellow-700">
                                    <p><i className="fas fa-info-circle mr-2"></i> Reschedule hanya berlaku maksimal <strong>H-7</strong> dari tanggal check-in asli.</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Booking</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-eling-green focus:ring-1 focus:ring-eling-green" 
                                                placeholder="Contoh: EB-RS-123456" 
                                                value={bookingCode}
                                                onChange={(e) => setBookingCode(e.target.value)}
                                                onBlur={() => handleCheckBooking(bookingCode)}
                                            />
                                            {isChecking && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-eling-green border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Lama</label>
                                            <input 
                                                type="text" 
                                                disabled 
                                                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-bold" 
                                                value={oldDate ? new Date(oldDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Masukan kode...'} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Baru</label>
                                            <input 
                                                type="date" 
                                                className="w-full bg-white border border-eling-green rounded-xl px-4 py-3 focus:outline-none ring-2 ring-eling-green/20" 
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    {bookingData && (
                                        <div className="p-3 bg-eling-green/5 border border-eling-green/10 rounded-xl">
                                            <p className="text-[11px] text-eling-green font-bold">
                                                <i className="fas fa-user-circle mr-2"></i> Konfirmasi Booking A.N: {bookingData.booker_name}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400">*) Ketersediaan unit akan dicek secara real-time oleh tim kami.</p>
                                    <button
                                        onClick={handleRescheduleSubmit}
                                        disabled={isSubmitting || !bookingData}
                                        className={`w-full text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition mt-4 shadow-lg flex items-center justify-center gap-3 ${
                                            isSubmitting || !bookingData ? 'bg-gray-300 cursor-not-allowed' : 'bg-eling-green hover:bg-green-800 shadow-eling-green/20'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Memproses...
                                            </>
                                        ) : (
                                            'Ajukan Perubahan Jadwal'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
