import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../utils/AuthContext';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import { Calendar, Users, ShoppingCart, Tag, CreditCard, QrCode, University, CheckCircle, ArrowRight, Loader2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import '../../styles/guest.css';

export default function EventTicketing() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [qtys, setQtys] = useState({});
    const [promoInput, setPromoInput] = useState('');
    const [activePromo, setActivePromo] = useState(null);
    const [promoMsg, setPromoMsg] = useState({ show: false, success: false, text: '' });
    const [bookerName, setBookerName] = useState('');
    const [guestNamesData, setGuestNamesData] = useState({});

    // For payment modal
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successOrderInfo, setSuccessOrderInfo] = useState(null);

    useEffect(() => {
        if (user) {
            setBookerName(user.name);
        }
    }, [user]);

    useEffect(() => {
        axios.get('/api/events')
            .then(res => {
                const activeEvents = res.data.filter(e => e.is_active && e.is_ticketed);
                setEvents(activeEvents);
                
                // Initialize qtys state
                const initialQtys = {};
                activeEvents.forEach(e => initialQtys[e.id] = 0);
                setQtys(initialQtys);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch events", err);
                setIsLoading(false);
            });
    }, []);

    const updateQty = (id, delta) => {
        if (!user && delta > 0) { navigate('/login', { state: { from: location } }); return; }
        const event = events.find(e => e.id === id);
        const currentTotal = Object.values(qtys).reduce((acc, q) => acc + q, 0);
        const currentQty = qtys[id] || 0;
        const newQty = Math.max(0, currentQty + delta);
        
        if (delta > 0 && event.is_ticketed && newQty > (event.available_quota || 0)) {
            toast.error(`Maaf, sisa tiket yang tersedia hanya ${event.available_quota}.`);
            return;
        }

        if (delta > 0 && currentTotal >= 10) {
            toast.error('Maksimal pemesanan adalah 10 tiket per transaksi.');
            return;
        }

        setQtys(prev => ({ ...prev, [id]: newQty }));

        // Manage guest names array for this event
        setGuestNamesData(prev => {
            const currentNames = prev[id] || [];
            if (delta > 0) {
                return { ...prev, [id]: [...currentNames, ''] };
            } else if (newQty < currentNames.length) {
                return { ...prev, [id]: currentNames.slice(0, newQty) };
            }
            return prev;
        });
    };

    const updateGuestName = (eventId, index, name) => {
        setGuestNamesData(prev => {
            const names = [...(prev[eventId] || [])];
            names[index] = name;
            return { ...prev, [eventId]: names };
        });
    };

    const applyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if(!code) return;

        try {
            const res = await axios.post('/api/promos/validate', { 
                promo_code: code,
                booking_type: 'EVENT',
                total_amount: subtotal
            });
            setActivePromo(res.data);
            setPromoMsg({
                show: true,
                success: true,
                text: `Promo berhasil! ${res.data.name} diterapkan.`
            });
        } catch (error) {
            setActivePromo(null);
            setPromoMsg({
                show: true,
                success: false,
                text: error.response?.data?.message || 'Kode promo tidak valid.'
            });
        }
    };

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    events.forEach(e => {
        const qty = qtys[e.id] || 0;
        if (qty > 0) {
            const price = parseFloat(e.price || 0);
            const amount = qty * price;
            subtotal += amount;
            orderItems.push({ 
                id: e.id, 
                name: e.name, 
                qty, 
                price, 
                amount,
                event_date: e.event_date
            });
        }
    });

    const hasItems = orderItems.length > 0;
    const adminFee = (hasItems && subtotal > 0) ? 2500 : 0; 
    let promoDiscountAmt = 0;

    if (activePromo && hasItems) {
        if (subtotal >= activePromo.min_purchase) {
            const discountValue = parseFloat(activePromo.discount_value || 0);
            if (activePromo.discount_type === 'percentage') {
                promoDiscountAmt = subtotal * (discountValue / 100);
            } else {
                promoDiscountAmt = discountValue;
            }
        }
    }

    const total = Math.max(0, subtotal + adminFee - promoDiscountAmt);

    const simulatePayment = async (method) => {
        if (!hasItems) return;
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        setShowPayment(false);
        setIsProcessing(true);

        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const transId = `EVT-${dateStr}-MULTI-${Math.floor(Math.random() * 8999 + 1000)}`;
        
        const payload = {
            id: transId,
            booking_type: 'EVENT',
            booker_name: bookerName || user.name,
            payment_method: method,
            promo_id: activePromo?.id,
            check_in_date: orderItems[0]?.event_date || new Date().toISOString().split('T')[0],
            total_price: total,
            total_qty: orderItems.reduce((acc, item) => acc + item.qty, 0),
            discount_amount: promoDiscountAmt,
            items: orderItems.map(item => ({
                item_id: item.id,
                item_type: 'App\\Models\\Event',
                quantity: item.qty,
                price: item.price,
                guest_names: guestNamesData[item.id] || []
            }))
        };

        try {
            const res = await axios.post('/api/transactions', payload);
            setIsProcessing(false);
            setSuccessOrderInfo({
                id: res.data.id,
                name: res.data.booker_name,
                tickets: res.data.tickets // This contains individual guest names and actual ticket IDs
            });
            setShowSuccess(true);
        } catch (error) {
            setIsProcessing(false);
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan.',
                icon: 'error',
                confirmButtonColor: '#C62828',
                customClass: { popup: 'rounded-[2rem] font-serif' }
            });
        }
    };

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen pb-32">
            {/* Header / Hero */}
            <header className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="px-4 py-1.5 rounded-full bg-eling-green/10 text-eling-green text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Official Event Pass</span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 font-serif text-gray-900 leading-tight">Tiket Event & Konser</h1>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Pilih paket event dan amankan e-ticket Anda sekarang.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Event Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {events.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center text-gray-500 shadow-xl border border-gray-100 flex flex-col items-center">
                                <div className="p-6 bg-gray-50 rounded-full mb-6 text-gray-200">
                                    <ShoppingCart size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Belum Tersedia Event</h3>
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Silakan cek kembali secara berkala.</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div key={event.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green/30 transition-all group overflow-hidden relative">
                                    <div 
                                        className="md:w-1/3 h-52 bg-slate-100 rounded-3xl overflow-hidden relative border border-gray-50 uppercase font-black text-[10px] tracking-widest text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
                                        onClick={() => navigate('/events', { state: { openId: event.id } })}
                                    >
                                        <img 
                                            src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : (event.image || "/images/hero-bg.png"))} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                                            alt={event.name} 
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-eling-green shadow-sm border border-eling-green/10">
                                                 {event.category || 'Special Event'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between relative z-10">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 
                                                    className="font-black text-2xl font-serif text-gray-900 group-hover:text-eling-green transition-colors leading-tight cursor-pointer"
                                                    onClick={() => navigate('/events', { state: { openId: event.id } })}
                                                >
                                                    {event.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-eling-red font-black text-[10px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg">
                                                    <Calendar size={12} />
                                                    {event.date_info}
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">{event.description || 'Nikmati acara spesial di Eling Bening dengan pemandangan alam yang menakjubkan.'}</p>
                                            <button 
                                                onClick={() => navigate('/events', { state: { openId: event.id } })}
                                                className="text-[10px] font-black uppercase tracking-wider text-eling-green hover:underline flex items-center gap-1.5 mb-2 transition-all active:scale-95"
                                            >
                                                Lihat Detail Event <ArrowRight size={12} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5 leading-none">Mulai Dari</p>
                                                <p className="text-3xl font-black text-eling-green font-serif tracking-tight leading-none">
                                                    {formatRupiah(event.price)}
                                                </p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    {event.is_ticketed && event.available_quota > 0 && event.available_quota <= 50 && (
                                                        <div className="flex items-center gap-1 text-orange-600 animate-pulse">
                                                            <i className="fas fa-fire-alt text-[9px]"></i>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Hanya Tersisa {event.available_quota}! Buruan!</span>
                                                        </div>
                                                    )}
                                                    {event.is_ticketed && event.available_quota > 50 && (
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <div className="w-1 h-1 rounded-full bg-eling-green"></div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Tersedia {event.available_quota} Tiket</span>
                                                        </div>
                                                    )}
                                                    {event.is_ticketed && event.available_quota <= 0 && (
                                                        <div className="flex items-center gap-1 text-gray-400 opacity-50">
                                                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Tiket Habis Terjual</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-5 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 min-w-[140px]">
                                                {event.is_ticketed && event.available_quota <= 0 ? (
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">Tiket Habis</span>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => updateQty(event.id, -1)} 
                                                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-eling-red hover:text-white transition-all text-gray-400 active:scale-95 shadow-sm border border-gray-100"
                                                        >
                                                            <b className="text-xl leading-none">−</b>
                                                        </button>
                                                        <span className="font-black text-xl w-6 text-center text-gray-900">{qtys[event.id] || 0}</span>
                                                        <button 
                                                            onClick={() => updateQty(event.id, 1)} 
                                                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-eling-green hover:text-white transition-all text-gray-400 active:scale-95 shadow-sm border border-gray-100"
                                                        >
                                                            <b className="text-xl leading-none">+</b>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Guest Names Section (Manifest) */}
                        {hasItems && (
                            <div className="animate-slide-up bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl mt-12">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 font-serif leading-tight">Data Manifest Pengunjung</h2>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Detail identitas untuk e-ticket Anda</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-eling-green/10 flex items-center justify-center text-eling-green">
                                                    <Tag size={14} />
                                                </div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">{item.name}</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Array.from({ length: item.qty }).map((_, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[10px] text-gray-300 group-focus-within:text-eling-green transition-colors uppercase tracking-widest">
                                                            Pass #{idx+1}
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            placeholder="Nama Lengkap Pengunjung"
                                                            value={guestNamesData[item.id]?.[idx] || ''}
                                                            onChange={(e) => updateGuestName(item.id, idx, e.target.value)}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-20 pr-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-eling-green/10 focus:border-eling-green outline-none transition-all shadow-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-10 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-eling-green/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="font-black text-xl mb-8 font-serif text-gray-900 relative">Ringkasan Pesanan</h3>

                                <div className="space-y-6 mb-8 text-sm min-h-[60px] relative">
                                    {!hasItems ? (
                                        <div className="text-center py-6 flex flex-col items-center">
                                            <ShoppingCart size={32} className="text-gray-100 mb-3" />
                                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em] italic">Belum ada tiket terpilih</p>
                                        </div>
                                    ) : (
                                        orderItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start animate-fade-in group">
                                                <div className="flex flex-col flex-1">
                                                    <span className="font-black text-gray-800 text-sm leading-tight mb-0.5 group-hover:text-eling-green transition-colors">{item.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.qty}x Tiket</span>
                                                </div>
                                                <span className="font-black text-gray-900">{formatRupiah(item.amount)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-200 pt-8 space-y-4 relative">
                                    <div className="flex justify-between text-gray-400 font-black uppercase tracking-widest text-[9px]">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">{formatRupiah(subtotal)}</span>
                                    </div>
                                    {activePromo && (
                                        <div className="flex justify-between text-eling-red font-black uppercase tracking-widest text-[9px]">
                                            <span>Promo Discount</span>
                                            <span>-{formatRupiah(promoDiscountAmt)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-400 font-black uppercase tracking-widest text-[9px]">
                                        <span>Biaya Layanan</span>
                                        <span className="text-gray-900">{formatRupiah(adminFee)}</span>
                                    </div>
                                    <div className="flex flex-col pt-6 border-t border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 text-center">Total Tagihan</span>
                                        <span className="text-3xl font-black text-eling-green text-center font-serif tracking-tight">{formatRupiah(total)}</span>
                                    </div>
                                </div>

                                {/* Promo Code */}
                                {hasItems && (
                                    <div className="pt-8 mt-8 border-t border-gray-100 relative">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest ml-1 text-center">Punya Kode Promo?</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value)}
                                                placeholder="KODE"
                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-eling-green/10 outline-none transition-all"
                                            />
                                            <button
                                                onClick={applyPromo}
                                                className="bg-gray-900 text-white font-black px-5 rounded-xl hover:bg-eling-green transition-all text-[9px] uppercase tracking-widest active:scale-95 shadow-lg shadow-gray-900/10"
                                            >
                                                Klaim
                                            </button>
                                        </div>
                                        {promoMsg.show && (
                                            <div className={`mt-2 text-[9px] font-black uppercase text-center tracking-widest ${promoMsg.success ? 'text-eling-green' : 'text-eling-red'}`}>
                                                {promoMsg.text}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                onClick={() => {
                                    if (!user) { navigate('/login', { state: { from: location } }); return; }
                                    setShowPayment(true);
                                }}
                                    disabled={!hasItems || isProcessing || isLoading}
                                    className="w-full bg-eling-red text-white font-black py-5 rounded-2xl shadow-xl shadow-eling-red/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-8"
                                >
                                    {isProcessing ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>Lanjut Pembayaran <ArrowRight size={14} /></>
                                    )}
                                </button>
                            </div>

                            {/* Booking Policies Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                                <h4 className="text-xl font-black font-serif mb-3 leading-tight relative z-10">Kebijakan Tiket</h4>
                                <p className="text-blue-100 font-bold text-xs leading-relaxed relative z-10 opacity-80 uppercase tracking-wide">
                                    Data manifest harus sesuai e-ticket. Tiket event yang sudah dibeli tidak dapat di-reschedule.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[600] bg-black/70 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[3rem] max-w-md w-full p-10 relative shadow-2xl overflow-hidden animate-scale-up">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-eling-red/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                        <button onClick={() => setShowPayment(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors">
                            <X size={24} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-1 h-eling-red rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-eling-red">Secure Checkout</span>
                        </div>
                        <h3 className="text-2xl font-black mb-1 font-serif text-gray-900">Pembayaran</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">Pilih gerbang pembayaran aman</p>

                        <div className="space-y-4">
                            {[
                                { name: 'Virtual Account', icon: <University size={20} />, method: 'VA', color: 'bg-blue-50 text-blue-600' },
                                { name: 'QRIS / E-Wallet', icon: <QrCode size={20} />, method: 'QRIS', color: 'bg-eling-red/5 text-eling-red' },
                                { name: 'Kartu Kredit', icon: <CreditCard size={20} />, method: 'CC', color: 'bg-gray-100 text-gray-600' }
                            ].map(item => (
                                <button 
                                    key={item.method}
                                    onClick={() => simulatePayment(item.method)} 
                                    className="w-full flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-eling-green hover:bg-green-50 transition-all group group active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-black text-sm text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-eling-green group-hover:text-white group-hover:border-eling-green transition-all">
                                        <ArrowRight size={14} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && successOrderInfo && (
                <div className="fixed inset-0 z-[1000] bg-eling-green overflow-y-auto font-sans">
                    <div className="min-h-full flex flex-col items-center p-6 sm:p-12">
                        <div className="max-w-4xl w-full mx-auto my-auto py-10">
                            <div className="text-center text-white mb-6">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce text-4xl shadow-xl">
                                    <i className="fas fa-check"></i>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-2 font-serif leading-tight text-white">Berhasil Terpesan!</h2>
                                <p className="text-green-100 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Eling Bening Experience</p>
                            </div>

                            <div className="flex gap-6 overflow-x-auto pb-10 px-4 snap-x snap-mandatory no-scrollbar mb-8 text-left">
                                {successOrderInfo.tickets.map((ticket, idx) => (
                                    <div key={idx} className="shrink-0 w-[300px] sm:w-[320px] snap-center bg-white p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                                        <div className="p-4 bg-white rounded-3xl shadow-inner border border-gray-50 mb-6 w-fit mx-auto flex items-center justify-center">
                                             <QRCodeCanvas 
                                                  value={ticket.ticket_id} 
                                                  size={180}
                                                  level="H"
                                                  includeMargin={false}
                                                  imageSettings={{
                                                      src: "/images/logo.png",
                                                      height: 40,
                                                      width: 40,
                                                      excavate: true,
                                                  }}
                                             />
                                         </div>
                                         <h5 className="text-gray-900 font-black text-2xl mb-1 font-serif tracking-tight">{ticket.guest_name}</h5>
                                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4">{ticket.ticket_id}</p>
                                         <div className="inline-block py-2 px-6 bg-eling-green/5 rounded-2xl border border-eling-green/10">
                                             <p className="text-eling-green font-black text-[10px] uppercase tracking-widest text-center">
                                                 {ticket.transaction_item?.item?.name || 'Tiket Event'}
                                             </p>
                                         </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => window.print()} className="bg-white text-eling-green px-10 py-5 rounded-[1.5rem] font-black hover:bg-gray-100 transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95">
                                    <i className="fas fa-print mr-2"></i> Cetak Tiket
                                </button>
                                <button onClick={() => navigate('/profile')} className="bg-eling-green border-2 border-white/30 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-white/10 transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95">
                                    Ke Riwayat Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
