import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../utils/AuthContext';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import { Calendar, Users, ShoppingCart, Tag, CreditCard, QrCode, University, CheckCircle, ArrowRight, Loader2, X } from 'lucide-react';
import '../../styles/guest.css';

export default function EventTicketing() {
    const navigate = useNavigate();
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
        const currentTotal = Object.values(qtys).reduce((acc, q) => acc + q, 0);
        const newQty = Math.max(0, (qtys[id] || 0) + delta);
        
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
            navigate('/login');
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
            await axios.post('/api/transactions', payload);
            setIsProcessing(false);
            setSuccessOrderInfo({
                id: transId,
                name: bookerName || user.name,
                items: orderItems
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
                    <span className="px-4 py-1.5 rounded-full bg-eling-green/10 text-eling-green text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Official Box Office</span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 font-serif text-gray-900">Tiket Event & Konser</h1>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Pilih paket event dan amankan e-ticket Anda sekarang.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Event Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {events.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center text-gray-500 shadow-xl border border-gray-100 flex flex-col items-center">
                                <div className="p-6 bg-gray-50 rounded-full mb-6">
                                    <ShoppingCart size={48} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Tersedia Event Berbayar</h3>
                                <p className="text-sm">Silakan cek kembali secara berkala untuk info event mendatang.</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div key={event.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green/30 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-eling-green/5 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-eling-green/10 transition-colors"></div>
                                    
                                    <div className="md:w-1/3 h-48 bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-50 shadow-inner">
                                        <img 
                                            src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : (event.image || "/images/hero-bg.png"))} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                                            alt={event.name} 
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-eling-green shadow-sm">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between relative z-10">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-black text-2xl font-serif text-gray-900 group-hover:text-eling-green transition-colors">{event.name}</h3>
                                                <div className="flex items-center gap-1.5 text-eling-red font-black text-[10px] uppercase tracking-widest">
                                                    <Calendar size={13} />
                                                    {event.date_info}
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Mulai Dari</p>
                                                <p className="text-2xl font-black text-eling-green">{formatRupiah(event.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                                <button onClick={() => updateQty(event.id, -1)} className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-eling-green hover:text-white transition-all text-gray-400 active:scale-95">
                                                    <b>-</b>
                                                </button>
                                                <span className="font-black text-lg w-6 text-center text-gray-900">{qtys[event.id] || 0}</span>
                                                <button onClick={() => updateQty(event.id, 1)} className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-eling-green hover:text-white transition-all text-gray-400 active:scale-95">
                                                    <b>+</b>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 sticky top-32">
                            <h3 className="font-black text-xl mb-8 font-serif text-gray-900">Ringkasan Pesanan</h3>

                            <div className="space-y-6 mb-8 text-sm min-h-[60px]">
                                {!hasItems ? (
                                    <div className="text-center py-6 flex flex-col items-center">
                                        <ShoppingCart size={32} className="text-gray-200 mb-3" />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Belum ada tiket terpilih</p>
                                    </div>
                                ) : (
                                    orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start animate-fade-in">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-800 text-sm leading-tight mb-1">{item.name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.qty}x {formatRupiah(item.price)}</span>
                                            </div>
                                            <span className="font-black text-gray-900">{formatRupiah(item.amount)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-8 space-y-4">
                                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">{formatRupiah(subtotal)}</span>
                                </div>
                                {activePromo && (
                                    <div className="flex justify-between text-eling-red font-bold uppercase tracking-widest text-[9px]">
                                        <span>Promo Discount</span>
                                        <span>-{formatRupiah(promoDiscountAmt)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                    <span>Biaya Layanan</span>
                                    <span className="text-gray-900">{formatRupiah(adminFee)}</span>
                                </div>
                                <div className="flex justify-between text-3xl font-black text-eling-green pt-6 border-t border-gray-100">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Tagihan</span>
                                    <span>{formatRupiah(total)}</span>
                                </div>
                            </div>

                            {/* Form Pilihan Tanggal dan Nama */}
                            {hasItems && (
                                <div className="space-y-6 pt-10 mt-10 border-t border-gray-100">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nama Pemesan Utama</label>
                                        <input
                                            type="text"
                                            placeholder={`Otomatis: ${user?.name || 'Nama Akun'}`}
                                            value={bookerName}
                                            onChange={(e) => setBookerName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-eling-green/10 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Individual Guest Name Inputs */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-1 bg-eling-green rounded-full"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Manifest Pengunjung</p>
                                        </div>
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="space-y-3">
                                                <p className="text-[11px] font-black text-eling-green uppercase tracking-wide px-3 py-1 bg-eling-green/5 rounded-lg inline-block">{item.name}</p>
                                                {Array.from({ length: item.qty }).map((_, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[10px] text-gray-300">#{idx+1}</div>
                                                        <input 
                                                            type="text"
                                                            placeholder="Nama Lengkap"
                                                            value={guestNamesData[item.id]?.[idx] || ''}
                                                            onChange={(e) => updateGuestName(item.id, idx, e.target.value)}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-xs font-bold focus:ring-2 focus:ring-eling-green/10 outline-none transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Promo Code */}
                            {hasItems && (
                                <div className="pt-8 mb-8 border-t border-gray-100">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Punya Kode Promo?</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            placeholder="MASUKKAN KODE"
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-eling-green/10 outline-none transition-all"
                                        />
                                        <button
                                            onClick={applyPromo}
                                            className="bg-gray-900 text-white font-black px-6 rounded-xl hover:bg-eling-green transition-all text-[10px] uppercase tracking-widest active:scale-95"
                                        >
                                            Klaim
                                        </button>
                                    </div>
                                    {promoMsg.show && (
                                        <div className={`mt-2 text-[10px] font-bold ${promoMsg.success ? 'text-eling-green' : 'text-eling-red'}`}>
                                            {promoMsg.text}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setShowPayment(true)}
                                disabled={!hasItems || isProcessing || isLoading}
                                className="w-full bg-eling-red text-white font-black py-5 rounded-2xl shadow-xl shadow-eling-red/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>Lanjut Pembayaran <ArrowRight size={14} /></>
                                )}
                            </button>
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
                <div className="fixed inset-0 z-[700] bg-eling-green/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-fade-in">
                    <div className="max-w-lg w-full text-center animate-scale-up">
                        <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
                            <CheckCircle size={56} className="text-white animate-bounce" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 font-serif leading-tight">Berhasil Terpesan!</h2>
                        <p className="text-green-100 font-bold text-sm mb-12 uppercase tracking-widest opacity-80">Terima kasih telah memesan di Eling Bening</p>

                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl mb-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-eling-green to-green-300"></div>
                            <div className="mb-6 flex justify-center transform hover:scale-105 transition-transform duration-500">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${successOrderInfo.id}&color=2E7D32`} alt="QR Code" className="w-48 h-48" />
                            </div>
                            <p className="text-gray-900 font-black text-xl mb-1 font-serif tracking-tight">{successOrderInfo.name}</p>
                            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-4">{successOrderInfo.id}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {successOrderInfo.items.map(item => (
                                    <div key={item.id} className="py-2 px-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-eling-green font-black text-[10px] uppercase tracking-widest">{item.qty}x {item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                            <button onClick={() => window.print()} className="bg-white text-eling-green px-10 py-4.5 rounded-[1.5rem] font-black hover:bg-gray-100 transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95">
                                Cetak Tiket
                            </button>
                            <button onClick={() => navigate('/profile')} className="bg-black/20 text-white px-10 py-4.5 rounded-[1.5rem] font-black hover:bg-black/30 transition-all text-[11px] uppercase tracking-[0.2em] border border-white/20 active:scale-95">
                                Ke Profil Saya
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
