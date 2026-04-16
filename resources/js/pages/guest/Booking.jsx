import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Users, CreditCard, Calendar, Tag, Info, BedDouble, ShieldCheck, ChevronDown, MessageSquare, Sparkles, Mail, Phone, Clock, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../utils/AuthContext';
import { formatRupiah, calculateTotalStayPrice } from '../../utils/data';
import IconRenderer from '../../components/IconRenderer';

export default function Booking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const bookingData = location.state || {
        room: { id: 1, name: 'Deluxe Room', price: 1250000, image: '/images/resort-room.png' },
        checkIn: '2026-03-27',
        checkOut: '2026-03-28',
        guests: 2,
        roomsNeeded: 1,
        totalNights: 1
    };

    const roomsNeeded = Number(bookingData.roomsNeeded || 1);
    const [guestType, setGuestType] = useState('self');
    const [promoCode, setPromoCode] = useState('');
    const [activePromo, setActivePromo] = useState(null);
    const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
    const [paymentMethod, setPaymentMethod] = useState('va');
    const [specialRequest, setSpecialRequest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [title, setTitle] = useState('Tuan');
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [guestFirstName, setGuestFirstName] = useState('');
    const [guestLastName, setGuestLastName] = useState('');
    const [arrivalTime, setArrivalTime] = useState('Pilih waktu kedatangan');

    const rooms_price = Number(bookingData.room?.weekday_price || bookingData.room?.price || 0);
    const nights = Number(bookingData.totalNights || 1);
    const basePrice = calculateTotalStayPrice(bookingData.room, bookingData.checkIn, bookingData.checkOut) * roomsNeeded;

    // Helper to get day breakdown for detailed display
    const getStayBreakdown = () => {
        let weekdaysCount = 0;
        let weekendsCount = 0;
        const start = new Date(bookingData.checkIn);
        for (let i = 0; i < nights; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            const day = current.getDay();
            if (day === 6 || day === 0) weekendsCount++;
            else weekdaysCount++;
        }
        return { weekdaysCount, weekendsCount };
    };
    const { weekdaysCount, weekendsCount } = getStayBreakdown();

    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const additionalPrice = selectedFacilities.reduce((sum, f) => sum + Number(f.price || 0), 0);
    
    const basePriceWithAddons = basePrice + (additionalPrice * nights * roomsNeeded);
    const tax = basePriceWithAddons * 0.1;
    
    let minPurchaseError = false;
    let discountAmount = 0;
    if (activePromo) {
        const minPurch = Number(activePromo.min_purchase || 0);
        const discVal = Number(activePromo.discount_value || 0);

        if (basePriceWithAddons >= minPurch) {
            if (activePromo.discount_type === 'percentage') {
                discountAmount = basePriceWithAddons * (discVal / 100);
            } else {
                discountAmount = discVal;
            }
        } else {
            minPurchaseError = true;
        }
    }

    const total = basePriceWithAddons + tax - discountAmount;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleApplyPromo = async () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;

        try {
            const res = await axios.post('/api/promos/validate', { 
                promo_code: code,
                booking_type: 'RESORT',
                total_amount: basePrice
            });
            setActivePromo(res.data);
            setPromoMessage({ text: `Berhasil! ${res.data.name} diterapkan.`, type: 'success' });
        } catch (error) {
            setActivePromo(null);
            setPromoMessage({ text: error.response?.data?.message || 'Kode promo tidak valid.', type: 'error' });
        }
    };

    const toggleFacility = (f) => {
        setSelectedFacilities(prev => 
            prev.find(x => x.id === f.id) 
                ? prev.filter(x => x.id !== f.id) 
                : [...prev, f]
        );
    };

    const handleConfirm = async () => {
        if (!user) {
            Swal.fire({
                title: 'Harap Login',
                text: 'Silakan login terlebih dahulu untuk memesan.',
                icon: 'warning',
                confirmButtonColor: '#2E7D32',
                customClass: { popup: 'rounded-[2rem]' }
            });
            return;
        }

        setIsSubmitting(true);
        const transId = `EB-RES-${Math.floor(Math.random() * 899999 + 100000)}`;

        const payload = {
            id: transId,
            booking_type: 'RESORT',
            booker_name: `${firstName} ${lastName}`.trim(), 
            booker_email: email,
            booker_phone: phone,
            payment_method: 'Midtrans',
            promo_id: activePromo?.id,
            check_in_date: bookingData.checkIn,
            check_out_date: bookingData.checkOut,
            arrival_time: arrivalTime,
            additional_facilities: selectedFacilities.map(f => ({ id: f.id, name: f.name, price: f.price })),
            total_price: total,
            total_qty: roomsNeeded,
            discount_amount: discountAmount,
            special_requests: specialRequest,
            items: [
                {
                    item_id: bookingData.room?.id,
                    item_type: 'App\\Models\\Resort',
                    quantity: roomsNeeded,
                    price: basePrice / roomsNeeded / nights
                }
            ]
        };

        try {
            const response = await axios.post('/api/transactions', payload);
            const data = response.data;

            if (data.snap_token) {
                window.snap.pay(data.snap_token, {
                    onSuccess: function(result){
                        Swal.fire({
                            title: 'Pembayaran Berhasil!',
                            text: 'Pesanan resort Anda telah dibayar.',
                            icon: 'success',
                            confirmButtonColor: '#2E7D32',
                            customClass: { popup: 'rounded-[2rem]' }
                        }).then(() => navigate('/profile'));
                    },
                    onPending: function(result){
                        Swal.fire({
                            title: 'Menunggu Pembayaran',
                            text: 'Selesaikan pembayaran Anda segera.',
                            icon: 'info',
                            confirmButtonColor: '#2E7D32',
                            customClass: { popup: 'rounded-[2rem]' }
                        }).then(() => navigate('/profile'));
                    },
                    onError: function(result){
                        Swal.fire({
                            title: 'Pembayaran Gagal',
                            text: 'Terjadi kesalahan saat memproses pembayaran.',
                            icon: 'error',
                            customClass: { popup: 'rounded-[2rem]' }
                        });
                        setIsSubmitting(false);
                    },
                    onClose: function(){
                        Swal.fire({
                            title: 'Pembayaran Tertunda',
                            text: 'Anda menutup popup. Selesaikan pembayaran di halaman profil.',
                            icon: 'warning',
                            confirmButtonColor: '#2E7D32',
                            customClass: { popup: 'rounded-[2rem]' }
                        }).then(() => navigate('/profile'));
                    }
                });
            } else {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pesanan resort Anda telah dikonfirmasi.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    customClass: { popup: 'rounded-[2rem]' }
                }).then(() => {
                    navigate('/profile');
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
            setIsSubmitting(false);
        }
    };

    return (
        <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto animate-fade-in bg-gray-50 min-h-screen relative z-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left: Interactive Form */}
                <div className="lg:col-span-8 space-y-8 relative z-10">

                    {/* 1. Detail Pemesan */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-eling-green flex items-center justify-center shadow-sm">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-serif text-gray-900 tracking-tight">Detail Pemesan</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Contact Information</p>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center font-black text-xs border border-gray-100 italic">01</span>
                        </div>

                        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-sm mb-10 flex items-start gap-4 border border-emerald-100/50 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                <Info size={18} />
                            </div>
                            <p className="leading-relaxed font-medium">E-voucher akan dikirimkan ke alamat email ini. Mohon pastikan alamat email dan nomor telepon Anda sudah benar dan aktif.</p>
                        </div>

                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Titel</label>
                                    <div className="relative">
                                        <select 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none appearance-none transition-all font-bold text-gray-700"
                                        >
                                            <option>Tuan</option>
                                            <option>Nyonya</option>
                                            <option>Nona</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Nama Depan</label>
                                    <input 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none transition-all font-bold text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Nama Belakang</label>
                                    <input 
                                        type="text" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none transition-all font-bold text-gray-700"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1 font-bold italic tracking-tighter opacity-70">
                                        <ShieldCheck size={10} /> Sesuai KTP/Paspor/SIM
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Alamat Email</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none transition-all font-bold text-gray-700"
                                            placeholder="anam@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Nomor HP / WhatsApp</label>
                                    <div className="flex group relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none transition-all font-bold text-gray-700"
                                            placeholder="8112345678"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* 2. Data Tamu */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-eling-green flex items-center justify-center shadow-sm">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-serif text-gray-900 tracking-tight">Data Tamu</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Guest Information</p>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center font-black text-xs border border-gray-100 italic">02</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <label className={`relative flex flex-col p-8 border-2 rounded-[2rem] cursor-pointer transition-all ${guestType === 'self' ? 'border-eling-green bg-green-50/50' : 'border-gray-50 hover:border-gray-100 bg-white'}`}>
                                <input type="radio" checked={guestType === 'self'} onChange={() => setGuestType('self')} className="absolute top-6 right-6 w-6 h-6 accent-eling-green" />
                                <h4 className="font-black text-gray-900 text-lg mb-1">Diri Sendiri</h4>
                                <p className="text-sm text-gray-400 font-medium">Saya yang akan menginap</p>
                            </label>
                            
                            <label className={`relative flex flex-col p-8 border-2 rounded-[2rem] cursor-pointer transition-all ${guestType === 'other' ? 'border-eling-green bg-green-50/30' : 'border-gray-50 hover:border-gray-100 bg-white'}`}>
                                <input type="radio" checked={guestType === 'other'} onChange={() => setGuestType('other')} className="absolute top-6 right-6 w-6 h-6 accent-eling-green" />
                                <h4 className="font-black text-gray-900 text-lg mb-1">Orang Lain</h4>
                                <p className="text-sm text-gray-400 font-medium">Memesan untuk orang lain</p>
                            </label>
                        </div>

                        {guestType === 'other' && (
                            <div className="mt-10 pt-10 border-t border-dashed border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Nama Depan Tamu</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-eling-green/5 focus:bg-white transition-all font-bold text-gray-700" 
                                            placeholder="Contoh: Budi"
                                            value={guestFirstName}
                                            onChange={(e) => setGuestFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Nama Belakang Tamu</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-eling-green/5 focus:bg-white transition-all font-bold text-gray-700" 
                                            placeholder="Contoh: Santoso"
                                            value={guestLastName}
                                            onChange={(e) => setGuestLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Fasilitas & Permintaan Khusus */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-eling-green flex items-center justify-center shadow-sm">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-serif text-gray-900 tracking-tight">Fasilitas & Permintaan</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Stay Preferences</p>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center font-black text-xs border border-gray-100 italic">03</span>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] mb-10 border border-slate-100/50 shadow-inner">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-full bg-eling-green text-white flex items-center justify-center">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800 tracking-tight">Informasi Check-in Khusus</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest tracking-tight">Standar: 14:00 - 22:00</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200/50">
                                <label className="block text-xs font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Perkiraan Waktu Kedatangan (Opsional)</label>
                                <div className="relative">
                                    <select 
                                        value={arrivalTime}
                                        onChange={(e) => setArrivalTime(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-6 py-4 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none appearance-none transition-all font-black text-sm text-gray-700"
                                    >
                                        <option>Pilih waktu kedatangan</option>
                                        <option>14:00 - 15:00</option>
                                        <option>15:00 - 16:00</option>
                                        <option>16:00 - 17:00</option>
                                        <option>17:00 - 18:00</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-6 ml-1 tracking-widest">Pilih Fasilitas Tambahan</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(bookingData.room?.facilities || []).filter(f => f.is_addon).map((facility, idx) => (
                                        <label key={idx} className={`flex items-center justify-between gap-4 cursor-pointer p-5 border rounded-2xl transition-all group ${selectedFacilities.find(x => x.id === facility.id) ? 'border-eling-green bg-green-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!selectedFacilities.find(x => x.id === facility.id)}
                                                    onChange={() => toggleFacility(facility)}
                                                    className="w-6 h-6 rounded-lg border-2 border-gray-100 checked:bg-eling-green checked:border-transparent accent-eling-green transition-all cursor-pointer" 
                                                />
                                                <div>
                                                    <span className="text-sm font-black text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                                                        <IconRenderer icon={facility.icon} size={18} className="text-eling-green" /> {facility.name}
                                                    </span>
                                                    {facility.price > 0 && (
                                                        <p className="text-[10px] font-bold text-eling-green mt-0.5">+{formatRupiah(facility.price)} /malam</p>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                    {(bookingData.room?.facilities || []).filter(f => f.is_addon).length === 0 && (
                                        <div className="col-span-2 p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tidak ada fasilitas tambahan berbayar</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-4 ml-1 tracking-widest">Catatan Lainnya</label>
                                <textarea 
                                    rows="4" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 focus:outline-none transition-all resize-none font-bold text-sm text-gray-700 placeholder:text-gray-300" 
                                    placeholder="Contoh: Rayakan hari ulang tahun, butuh kursi roda, dsb..."
                                    value={specialRequest}
                                    onChange={(e) => setSpecialRequest(e.target.value)}
                                ></textarea>
                        </div>
                    </div>
                </div>
                </div>

                {/* Right: Summary Sidebar */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-28 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="relative h-48 overflow-hidden group">
                                <img src={bookingData.room.gallery?.[0] || bookingData.room.image || "/images/resort-room.png"} className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-1000" alt="Room" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="font-serif font-black text-2xl text-white tracking-tight leading-tight">{bookingData.room.name}</h3>
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="space-y-6 mb-10">
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-eling-green shadow-sm shrink-0">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Check-in / Out</p>
                                            <p className="text-sm font-black text-gray-700 leading-tight">
                                                {new Date(bookingData.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(bookingData.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 opacity-50">
                                                <span className="text-[10px] font-bold text-gray-500">{bookingData.totalNights} Malam</span>
                                                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                                <span className="text-[10px] font-bold text-gray-500">{roomsNeeded} Kamar ({bookingData.guests} Tamu)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10 pt-2">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Biaya Layanan</h4>
                                        <div className="h-[1px] flex-1 bg-gray-100 mx-4"></div>
                                    </div>
                                    
                                    <div className="space-y-3 px-1">
                                        <div className="flex flex-col gap-2 pb-3 border-b border-gray-50 mb-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">{weekdaysCount}x Weekday Stay</span>
                                                <span className="font-black text-gray-900">{formatRupiah(weekdaysCount * rooms_price * roomsNeeded)}</span>
                                            </div>
                                            {weekendsCount > 0 && bookingData.room?.price_weekend > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-orange-400 font-bold uppercase tracking-widest text-[9px]">{weekendsCount}x Weekend Stay</span>
                                                    <span className="font-black text-gray-900">{formatRupiah(weekendsCount * bookingData.room.price_weekend * roomsNeeded)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {additionalPrice > 0 && (
                                            <div className="flex justify-between items-center text-sm animate-fade-in">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Fasilitas Tambahan</span>
                                                <span className="font-black text-gray-900">+{formatRupiah(additionalPrice * nights * roomsNeeded)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Pajak & Layanan (10%)</span>
                                            <span className="font-black text-gray-900">{formatRupiah(tax)}</span>
                                        </div>
                                        {activePromo && (
                                            <div className="flex justify-between items-center text-sm text-emerald-600 animate-fade-in bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30">
                                                <span className="font-black uppercase tracking-widest text-[9px]">Potongan Promo</span>
                                                <span className="font-black">- {formatRupiah(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-2xl font-black text-eling-green pt-6 border-t border-gray-100 mt-6">
                                            <span className="tracking-tighter">Total Bayar</span>
                                            <span className="tracking-tight">{formatRupiah(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Promo Interaction */}
                                <div className="mb-10 group">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-eling-green transition-colors">
                                                <Tag size={16} />
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Punya Kode Promo?" 
                                                value={promoCode} 
                                                onChange={(e) => setPromoCode(e.target.value)} 
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-eling-green/5 focus:border-eling-green/30 uppercase tracking-widest transition-all" 
                                            />
                                        </div>
                                        <button 
                                            onClick={handleApplyPromo} 
                                            className="bg-eling-green text-white font-black px-6 rounded-2xl hover:bg-green-800 transition-all text-xs shadow-lg shadow-green-900/20 active:scale-95"
                                        >
                                            PAKAI
                                        </button>
                                    </div>
                                    {promoMessage.text && (
                                        <div className={`mt-3 text-[10px] font-black px-4 py-3 rounded-xl flex items-center gap-2 border animate-in slide-in-from-top-2 duration-300 ${promoMessage.type === 'error' ? 'text-rose-500 bg-rose-50 border-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                            <Info size={12} /> {promoMessage.text}
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleConfirm} 
                                    disabled={isSubmitting}
                                    className="w-full bg-eling-green text-white font-black py-6 rounded-3xl shadow-xl shadow-green-900/20 hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300 text-lg flex items-center justify-center gap-3 cursor-pointer disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    <ShoppingCart size={20} />
                                    {isSubmitting ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                                </button>

                                <div className="flex flex-col items-center gap-1 mt-10 opacity-40">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-gray-600" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Secure Checkout System</span>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">© 2026 ELING BENING APP. ALL RIGHTS RESERVED.</p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Policies Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                            <h4 className="text-xl font-black font-serif mb-4 leading-tight relative z-10 font-serif">Kebijakan Reschedule</h4>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-blue-100 font-bold text-[10px] leading-relaxed uppercase tracking-wider">Maksimal reschedule H-7 sebelum kedatangan.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-blue-100 font-bold text-[10px] leading-relaxed uppercase tracking-wider">Tergantung ketersediaan unit dalam 3 bulan ke depan.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-blue-100 font-bold text-[10px] leading-relaxed uppercase tracking-wider">Pemesanan ini tidak dapat dibatalkan / refund.</p>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
            </div>
        </main>
    );
}
