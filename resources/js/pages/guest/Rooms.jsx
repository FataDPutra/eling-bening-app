import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah, calculateTotalStayPrice } from '../../utils/data';
import toast from 'react-hot-toast';
import { useAuth } from '../../utils/AuthContext';
import IconRenderer from '../../components/IconRenderer';
import { Calendar, Search, ChevronRight, X, AlertTriangle, Info, Loader2, Clock } from 'lucide-react';
import CountdownTimer from '../../components/CountdownTimer';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReschedule, setShowReschedule] = useState(false);
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
    
    // Refs
    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);
    
    // Reschedule states
    const [bookingCode, setBookingCode] = useState('');
    const [oldDate, setOldDate] = useState('');
    const [newDate, setNewDate] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [feeSettings, setFeeSettings] = useState({ reschedule_admin_fee: 0, reschedule_penalty: 0 });
    const [costPreview, setCostPreview] = useState(null); // { isWeekendChange, priceDiff, adminFee, penalty, finalCharge }
    const { user } = useAuth();
    const navigate = useNavigate();

    const isWeekend = (date) => {
        if (!date) return false;
        const d = new Date(date);
        const day = d.getDay();
        return day === 0 || day === 6;
    };

    const hasWeekend = (start, end) => {
        if (!start || !end) return false;
        let curr = new Date(start);
        const finish = new Date(end);
        while (curr < finish) {
            const day = curr.getDay();
            if (day === 0 || day === 6) return true;
            curr.setDate(curr.getDate() + 1);
        }
        return false;
    };

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
        fetchRooms(checkIn.toISOString().split('T')[0], checkOut.toISOString().split('T')[0]);
    }, []);

    // Fetch public fee settings when reschedule modal opens
    useEffect(() => {
        if (showReschedule) {
            axios.get('/api/settings/public').then(res => {
                setFeeSettings({
                    reschedule_admin_fee: Number(res.data.reschedule_admin_fee ?? 0),
                    reschedule_penalty: Number(res.data.reschedule_penalty ?? 0),
                    min_reschedule_lead_days: Number(res.data.min_reschedule_lead_days ?? 2),
                });
            }).catch(() => {});
        }
    }, [showReschedule]);

    // Recalculate cost preview whenever newDate changes
    useEffect(() => {
        if (!newDate || !bookingData) { setCostPreview(null); return; }
        const adminFee = feeSettings.reschedule_admin_fee;
        const penalty  = feeSettings.reschedule_penalty;
        const weekendChange = !isWeekend(oldDate) && isWeekend(newDate);
        // We don't have price detail here — just show fees; backend calculates priceDiff
        setCostPreview({
            isWeekendChange: weekendChange,
            adminFee,
            penalty,
            note: weekendChange
                ? 'Tanggal baru jatuh pada akhir pekan (weekend). Kemungkinan ada selisih harga yang perlu dibayar.'
                : 'Tanggal baru adalah weekday. Tidak ada selisih harga.'
        });
    }, [newDate, bookingData, feeSettings]);

    const handleRoomSelect = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    const handleCheckInChange = (date) => {
        setCheckIn(date);
        // If check out is not after check in, set it to ci + 1 day
        if (checkOut <= date) {
            const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
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

        if (bookingData?.reschedule_count > 0) {
            toast.error('Reschedule hanya dapat dilakukan maksimal satu kali per transaksi.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post(`/api/transactions/${bookingCode}/reschedule`, {
                new_check_in_date: newDate?.toISOString().split('T')[0],
                reason: 'Reschedule from guest dashboard'
            });

            const cb = data.cost_breakdown;
            if (cb && cb.final_charge > 0) {
                toast.success(
                    `Reschedule diajukan! Tagihan tambahan: ${formatRupiah(cb.final_charge)}`,
                    { duration: 6000, icon: '💰' }
                );
            } else {
                toast.success('Permintaan reschedule berhasil dikirim! Tidak ada biaya tambahan.');
            }

            setShowReschedule(false);
            setBookingCode('');
            setOldDate('');
            setNewDate('');
            setBookingData(null);
            setCostPreview(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengajukan reschedule');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start md:items-center lg:items-end mb-12 gap-6">
                <div className="text-left md:text-center lg:text-left">
                    <h1 className="text-4xl font-bold mb-4 font-serif">Pilih Villa & Resort</h1>
                    <p className="text-gray-500">Temukan kenyamanan istirahat di tengah alam Ambarawa.</p>
                </div>
                <div className="bg-white p-6 lg:p-4 rounded-3xl shadow-xl border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-max relative z-10 transition-all hover:shadow-2xl">
                    {/* Check In */}
                    <div 
                        onClick={() => checkInRef.current?.setOpen(true)}
                        className="flex flex-1 items-center gap-4 p-4 lg:p-3 bg-gray-50/50 hover:bg-white hover:border-eling-green/30 hover:shadow-lg hover:shadow-eling-green/5 rounded-2xl border border-gray-100 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-eling-green shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar size={22} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1.5 border-b border-gray-100 pb-1.5 group-hover:text-eling-green transition-colors">Check In</span>
                            <DatePicker
                                selected={checkIn}
                                onChange={handleCheckInChange}
                                selectsStart
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={new Date()}
                                locale={id}
                                dateFormat="dd MMMM yyyy"
                                ref={checkInRef}
                                className="font-black text-md focus:outline-none bg-transparent text-gray-800 w-full cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-12 bg-gray-100 shrink-0"></div>

                    {/* Check Out */}
                    <div 
                        onClick={() => checkOutRef.current?.setOpen(true)}
                        className="flex flex-1 items-center gap-4 p-4 lg:p-3 bg-gray-50/50 hover:bg-white hover:border-eling-green/30 hover:shadow-lg hover:shadow-eling-green/5 rounded-2xl border border-gray-100 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-eling-green shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar size={22} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1.5 border-b border-gray-100 pb-1.5 group-hover:text-eling-green transition-colors">Check Out</span>
                            <DatePicker
                                selected={checkOut}
                                onChange={(date) => setCheckOut(date)}
                                selectsEnd
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)}
                                locale={id}
                                dateFormat="dd MMMM yyyy"
                                ref={checkOutRef}
                                className="font-black text-md focus:outline-none bg-transparent text-gray-800 w-full cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => fetchRooms(checkIn.toISOString().split('T')[0], checkOut.toISOString().split('T')[0])}
                        className="bg-eling-green text-white px-10 h-14 lg:h-[72px] rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-800 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-eling-green/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap lg:ml-2"
                    >
                        <Search size={18} strokeWidth={3} />
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
                    const badgeText = isMaintenance ? 'Perbaikan' : isFull ? 'Habis Terpesan' : `${stockToShow} Unit Tersisa`;

                    const currentPrice = r.price;

                    return (
                        <div key={idx} className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group flex flex-col h-full hover:-translate-y-3 hover:shadow-2xl hover:border-eling-green/20 transition-all duration-500 ${unavailable ? 'grayscale-[0.5] opacity-90' : ''}`}>
                            <div className="h-64 overflow-hidden relative shrink-0">
                                <img 
                                    src={(Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery[0] : null) || defaultImages[idx % defaultImages.length]} 
                                    className={`w-full h-full object-cover group-hover:scale-110 transition duration-700 ${unavailable ? 'grayscale' : ''}`} 
                                    alt={r.name} 
                                />
                                {unavailable ? (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6">
                                        <div className="bg-white/10 border border-white/20 backdrop-blur-md px-8 py-3 rounded-2xl flex flex-col items-center gap-2 shadow-2xl animate-scale-up">
                                            <span className="text-white font-black uppercase tracking-[0.2em] text-xs drop-shadow-lg">{badgeText}</span>
                                            <div className="h-0.5 w-12 bg-white/30 rounded-full"></div>
                                        </div>
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
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Harga Per Malam</p>
                                            {hasWeekend(checkIn, checkOut) && (
                                                <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Ada Tarif Akhir Pekan</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Weekday</span>
                                                        <div className="flex items-baseline gap-1 text-eling-green">
                                                            <span className="text-sm font-black font-serif">Rp</span>
                                                            <span className="text-xl font-black font-serif tracking-tight">{Number(r.weekday_price || r.price).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {r.price_weekend > 0 && (
                                                        <div className="flex flex-col lg:items-end lg:text-right pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                                                            <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest leading-none mb-2">Weekend</span>
                                                            <div className="flex items-baseline gap-1 text-orange-600">
                                                                <span className="text-sm font-black font-serif">Rp</span>
                                                                <span className="text-xl font-black font-serif tracking-tight">{Number(r.price_weekend).toLocaleString('id-ID')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center px-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-eling-green">Total Est. {Math.max(1, Math.floor((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))} Malam</span>
                                                    <span className="text-sm font-black text-gray-900">{formatRupiah(calculateTotalStayPrice(r, checkIn, checkOut))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 px-1 py-1">
                                        {r.available_stock > 0 && r.available_stock <= 3 && (
                                            <div className="flex items-center gap-1.5 text-orange-600 animate-pulse">
                                                <AlertTriangle size={12} className="shrink-0" />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                    Hanya Tersisa {r.available_stock} Unit! Pesan Sekarang!
                                                </span>
                                            </div>
                                        )}
                                        {r.available_stock > 3 && (
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-eling-green shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                    Tersedia {r.available_stock} Unit
                                                </span>
                                            </div>
                                        )}
                                        {r.available_stock <= 0 && !r.is_on_hold && (
                                            <div className="flex items-center gap-1.5 text-gray-400 opacity-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Unit Habis Dipesan</span>
                                            </div>
                                        )}
                                    </div>

                                    {unavailable ? (
                                        r.is_on_hold ? (
                                            <div className="space-y-3 w-full">
                                                <button disabled className="bg-amber-50 text-amber-600 font-black py-4 px-8 rounded-2xl cursor-wait w-full border border-amber-200 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                                                    <Clock size={14} className="animate-pulse" /> {r.hold_expiry ? 'Ditahan Sementara' : 'Menunggu Review'}
                                                </button>
                                                <p className="text-[9px] text-amber-600/70 font-bold text-center leading-relaxed italic px-2">
                                                    {r.hold_expiry ? (
                                                        <>Unit sedang ditahan karena reschedule.<br/>Mohon tunggu <CountdownTimer expiryDate={r.hold_expiry} onExpire={() => fetchRooms(checkIn, checkOut)} /> ya!</>
                                                    ) : (
                                                        "Unit sedang ditahan karena reschedule.<br/>Mohon tunggu review admin ya!"
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <button disabled className="bg-gray-100 text-gray-400 font-bold py-4 px-8 rounded-2xl cursor-not-allowed w-full border border-gray-200 uppercase tracking-widest text-[11px]">Stok Habis</button>
                                        )
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
                                            <DatePicker
                                                selected={newDate}
                                                onChange={(date) => setNewDate(date)}
                                                minDate={new Date(new Date().getTime() + (feeSettings.min_reschedule_lead_days || 2) * 24 * 60 * 60 * 1000)}
                                                locale={id}
                                                placeholderText="Pilih tanggal baru"
                                                dateFormat="dd MMMM yyyy"
                                                className="w-full bg-white border border-eling-green rounded-xl px-4 py-3 focus:outline-none ring-2 ring-eling-green/20 font-bold"
                                            />
                                        </div>
                                    </div>

                                    {bookingData && bookingData.reschedule_count > 0 && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                                            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-red-700">Peringatan: Kuota Habis</p>
                                                <p className="text-[10px] text-red-600 mt-1">Anda sudah pernah melakukan reschedule untuk kode booking ini. Perubahan jadwal hanya diizinkan satu kali.</p>
                                            </div>
                                        </div>
                                    )}

                                    {bookingData && (
                                        <div className="p-3 bg-eling-green/5 border border-eling-green/10 rounded-xl">
                                            <p className="text-[11px] text-eling-green font-bold">
                                                <i className="fas fa-user-circle mr-2"></i> Konfirmasi Booking A.N: {bookingData.booker_name}
                                            </p>
                                        </div>
                                    )}

                                    {/* Cost Preview Alert */}
                                    {costPreview && (
                                        <div className={`rounded-2xl p-5 border ${costPreview.isWeekendChange ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-100'}`}>
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={18} className={`mt-0.5 flex-shrink-0 ${costPreview.isWeekendChange ? 'text-orange-500' : 'text-blue-400'}`} />
                                                <div className="flex-1">
                                                    <p className={`text-sm font-black mb-3 ${costPreview.isWeekendChange ? 'text-orange-700' : 'text-blue-700'}`}>
                                                        {costPreview.isWeekendChange ? '⚠️ Perubahan ke Akhir Pekan (Weekend)' : 'ℹ️ Estimasi Biaya Reschedule'}
                                                    </p>
                                                    <p className={`text-[11px] mb-3 leading-relaxed ${costPreview.isWeekendChange ? 'text-orange-600' : 'text-blue-600'}`}>
                                                        {costPreview.note}
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {costPreview.isWeekendChange && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-500">Selisih harga (dihitung backend)</span>
                                                                <span className="font-black text-orange-600">Ditentukan saat proses</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Biaya Admin</span>
                                                            <span className="font-black text-gray-800">{formatRupiah(costPreview.adminFee)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Penalty Reschedule</span>
                                                            <span className="font-black text-gray-800">{formatRupiah(costPreview.penalty)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs pt-2 border-t border-gray-200 mt-2">
                                                            <span className="font-black text-gray-700">Min. Total Biaya Tambahan</span>
                                                            <span className="font-black text-eling-green">{formatRupiah(costPreview.adminFee + costPreview.penalty)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                        ) : costPreview && (costPreview.adminFee + costPreview.penalty) > 0 ? (
                                            `Ajukan & Bayar Min. ${formatRupiah(costPreview.adminFee + costPreview.penalty)}`
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
