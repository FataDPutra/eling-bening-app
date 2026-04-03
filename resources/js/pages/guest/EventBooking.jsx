import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../utils/AuthContext';
import { formatRupiah } from '../../utils/data';
import {
    Calendar, Users, ShieldCheck, ArrowRight, Loader2, Tag,
    ChevronLeft, CreditCard, QrCode, University, CheckCircle,
    Ticket, Info, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import '../../styles/guest.css';

const getEventImage = (event) => {
    if (Array.isArray(event?.images) && event.images.length > 0) return event.images[0];
    if (event?.image) return event.image;
    return '/images/hero-bg.png';
};

export default function EventBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [bookerName, setBookerName] = useState('');
    const [guestNames, setGuestNames] = useState(['']);
    const [promoInput, setPromoInput] = useState('');
    const [activePromo, setActivePromo] = useState(null);
    const [promoMsg, setPromoMsg] = useState({ show: false, success: false, text: '' });
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        if (user) setBookerName(user.name);
    }, [user]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`/api/events/${id}`);
                setEvent(data);
            } catch (error) {
                toast.error('Event tidak ditemukan');
                navigate('/events');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const maxQty = () => {
        if (!event) return 10;
        if (event.ticket_quota && event.ticket_quota > 0) return Math.min(10, event.ticket_quota);
        return 10;
    };

    const handleQtyChange = (delta) => {
        if (!user && delta > 0) { navigate('/login', { state: { from: location } }); return; }
        const newQty = qty + delta;
        if (newQty < 1) return;
        if (newQty > maxQty()) {
            toast.error(`Maksimal ${maxQty()} tiket per transaksi.`);
            return;
        }
        setQty(newQty);
        if (delta > 0) {
            setGuestNames(prev => [...prev, '']);
        } else {
            setGuestNames(prev => prev.slice(0, newQty));
        }
    };

    const updateGuestName = (index, name) => {
        setGuestNames(prev => {
            const next = [...prev];
            next[index] = name;
            return next;
        });
    };

    // ── Calculations ──────────────────────────────────────────────
    const price = parseFloat(event?.price || 0);
    const subtotal = price * qty;
    const adminFee = (price > 0) ? 2500 : 0; 

    let promoDiscountAmt = 0;
    if (activePromo && subtotal >= parseFloat(activePromo.min_purchase || 0)) {
        const dv = parseFloat(activePromo.discount_value || 0);
        promoDiscountAmt = activePromo.discount_type === 'percentage'
            ? subtotal * (dv / 100)
            : dv;
    }


    const total = Math.max(0, subtotal + adminFee - promoDiscountAmt);

    const applyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        try {
            const res = await axios.post('/api/promos/validate', {
                promo_code: code, booking_type: 'EVENT', total_amount: subtotal
            });
            setActivePromo(res.data);
            setPromoMsg({ show: true, success: true, text: `Promo "${res.data.name}" berhasil diterapkan!` });
        } catch (err) {
            setActivePromo(null);
            setPromoMsg({ show: true, success: false, text: err.response?.data?.message || 'Kode promo tidak valid.' });
        }
    };

    const simulatePayment = async (method) => {
        if (!user) { navigate('/login', { state: { from: location } }); return; }
        setShowPayment(false);
        setIsProcessing(true);

        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const txId = `EB-EVT-${dateStr}-${id}-${Math.floor(Math.random() * 8999 + 1000)}`;

        const payload = {
            id: txId,
            booking_type: 'EVENT',
            booker_name: bookerName || user.name,
            payment_method: method,
            promo_id: activePromo?.id,
            check_in_date: event.event_date || new Date().toISOString().split('T')[0],
            total_price: total,
            total_qty: qty,
            discount_amount: promoDiscountAmt,
            items: [{
                item_id: event.id,
                item_type: 'App\\Models\\Event',
                quantity: qty,
                price: price,
                guest_names: guestNames,
            }]
        };

        try {
            const res = await axios.post('/api/transactions', payload);
            setSuccessData(res.data);
            setIsProcessing(false);
            setShowSuccess(true);
        } catch (err) {
            setIsProcessing(false);
            Swal.fire({
                title: 'Gagal!',
                text: err.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan.',
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

    const eventImage = getEventImage(event);
    const quotaRemaining = event.ticket_quota ? event.ticket_quota : null;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-10 hover:text-eling-green transition-colors group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Detail Event
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* ─── LEFT COLUMN ─── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Event Hero Card */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
                            {/* Image */}
                            <div className="relative h-56 md:h-72">
                                <img
                                    src={eventImage}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8">
                                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-3 inline-block">
                                        {event.category}
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black text-white font-serif leading-tight">
                                        {event.name}
                                    </h1>
                                </div>
                                {/* Quota badge */}
                                {quotaRemaining !== null && (
                                    <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg border border-gray-100 text-center">
                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Kuota</p>
                                        <p className="text-lg font-black text-eling-red leading-none mt-0.5">{quotaRemaining}</p>
                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">tiket tersedia</p>
                                    </div>
                                )}
                            </div>

                            {/* Info strips */}
                            <div className="p-8">
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                        <Calendar size={14} className="text-eling-red" />
                                        <span className="text-xs font-black text-gray-700">{event.date_info}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                        <Ticket size={14} className="text-eling-green" />
                                        <span className="text-xs font-black text-gray-700">
                                            {price > 0 ? formatRupiah(price) + ' / tiket' : 'Tiket Gratis'}
                                        </span>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="flex gap-3 p-4 bg-eling-green/5 border border-eling-green/10 rounded-2xl">
                                        <Info size={16} className="text-eling-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>
                                )}

                                {/* Qty selector */}
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-8 pt-8 border-t border-gray-100 relative">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Jumlah Tiket</p>
                                        <p className="text-4xl font-black text-eling-green font-serif tracking-tight leading-none">
                                            {qty} <span className="text-sm text-gray-400 font-bold">tiket</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-5 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 shadow-inner min-w-[160px]">
                                        <button
                                            onClick={() => handleQtyChange(-1)}
                                            disabled={qty <= 1}
                                            className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-eling-red hover:text-white transition-all text-gray-400 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-100"
                                        >
                                            <b className="text-xl">−</b>
                                        </button>
                                        <span className="font-black text-2xl w-8 text-center text-gray-900">{qty}</span>
                                        <button
                                            onClick={() => handleQtyChange(1)}
                                            disabled={qty >= maxQty()}
                                            className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition-all text-gray-400 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-100"
                                        >
                                            <b className="text-xl">+</b>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Manifest */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3.5 bg-eling-green/10 rounded-2xl text-eling-green">
                                    <Users size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Manifest Pengunjung</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Data untuk e-ticket &amp; QR Code</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
                                    Nama Pemesan Utama
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                                        <Tag size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={bookerName}
                                        onChange={e => setBookerName(e.target.value)}
                                        placeholder={user?.name || 'Nama Pemesan'}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-eling-green/20 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {guestNames.map((name, idx) => (
                                    <div key={idx}>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
                                            Pengunjung #{idx + 1}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                                                <Tag size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap Sesuai ID"
                                                value={name}
                                                onChange={e => updateGuestName(idx, e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-eling-green/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN (Sticky Summary) ─── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-10 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                                <h3 className="text-xl font-black text-gray-900 mb-8 font-serif">Ringkasan Pesanan</h3>

                                {/* Item row */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="font-black text-gray-800 text-sm leading-tight mb-1">{event.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{qty} × {formatRupiah(price)}</p>
                                    </div>
                                    <p className="font-black text-gray-900">{formatRupiah(subtotal)}</p>
                                </div>

                                {/* Breakdown */}
                                <div className="pt-6 border-t border-dashed border-gray-200 space-y-4 text-sm mb-6">
                                    <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                        <span>Biaya Layanan</span>
                                        <span className="text-gray-900">{formatRupiah(adminFee)}</span>
                                    </div>
                                    {activePromo && (
                                        <div className="flex justify-between text-eling-red font-bold uppercase tracking-widest text-[9px]">
                                            <span>Diskon Promo</span>
                                            <span>−{formatRupiah(promoDiscountAmt)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Tagihan</span>
                                    <span className="text-3xl font-black text-eling-green">{formatRupiah(total)}</span>
                                </div>

                                {/* Promo */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-[0.2em]">
                                        Kode Promo
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && applyPromo()}
                                            placeholder="KODE PROMO"
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-eling-green/10 outline-none"
                                        />
                                        <button
                                            onClick={applyPromo}
                                            className="bg-gray-900 text-white font-black px-4 rounded-xl hover:bg-eling-green transition-all text-[10px] uppercase tracking-widest active:scale-95"
                                        >
                                            Klaim
                                        </button>
                                    </div>
                                    {promoMsg.show && (
                                        <p className={`mt-2 text-[10px] font-bold ${promoMsg.success ? 'text-eling-green' : 'text-eling-red'}`}>
                                            {promoMsg.text}
                                        </p>
                                    )}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => {
                                        if (!user) { navigate('/login', { state: { from: location } }); return; }
                                        setShowPayment(true);
                                    }}
                                    disabled={isProcessing}
                                    className="w-full bg-eling-red text-white font-black py-5 rounded-2xl shadow-xl shadow-eling-red/20 hover:bg-eling-red/90 hover:scale-[1.02] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isProcessing
                                        ? <Loader2 className="animate-spin" size={16} />
                                        : <><span>Lanjut Pembayaran</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                                    }
                                </button>

                                <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <ShieldCheck className="text-eling-green flex-shrink-0" size={18} />
                                    <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
                                        Transaksi aman &amp; terenkripsi. E-Ticket langsung tersimpan di profil Anda.
                                    </p>
                                </div>
                            </div>

                            {/* Booking Policies Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                                <h4 className="text-xl font-black font-serif mb-3 leading-tight relative z-10 font-serif">Kebijakan Tiket</h4>
                                <p className="text-blue-100 font-bold text-xs leading-relaxed relative z-10 opacity-80 uppercase tracking-wide">
                                    Data manifest harus sesuai e-ticket. Tiket event yang sudah dibeli tidak dapat di-reschedule.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── PAYMENT MODAL ─── */}
            {showPayment && (
                <div className="fixed inset-0 z-[600] bg-black/70 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[3rem] max-w-md w-full p-10 relative shadow-2xl overflow-hidden animate-scale-up">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-eling-red/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <button onClick={() => setShowPayment(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors">
                            <X size={22} />
                        </button>

                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-eling-red block mb-1">Secure Checkout</span>
                        <h3 className="text-2xl font-black mb-1 font-serif text-gray-900">Pilih Pembayaran</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                            Total: <span className="text-eling-green">{formatRupiah(total)}</span>
                        </p>

                        <div className="space-y-3">
                            {[
                                { name: 'Virtual Account', icon: <University size={20} />, method: 'VA', color: 'bg-blue-50 text-blue-600' },
                                { name: 'QRIS / E-Wallet', icon: <QrCode size={20} />, method: 'QRIS', color: 'bg-eling-red/5 text-eling-red' },
                                { name: 'Kartu Kredit', icon: <CreditCard size={20} />, method: 'CC', color: 'bg-gray-100 text-gray-600' },
                            ].map(item => (
                                <button
                                    key={item.method}
                                    onClick={() => simulatePayment(item.method)}
                                    className="w-full flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-eling-green hover:bg-green-50 transition-all group active:scale-95"
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
            {showSuccess && (
                <div className="fixed inset-0 z-[1000] bg-eling-green overflow-y-auto font-sans text-center">
                    <div className="min-h-full flex flex-col items-center p-6 sm:p-12">
                        <div className="max-w-4xl w-full mx-auto my-auto py-10">
                            <div className="text-center text-white mb-6">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce text-4xl shadow-xl">
                                    <i className="fas fa-check"></i>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-2 font-serif leading-tight">Berhasil Terpesan!</h2>
                                <p className="text-green-100 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Eling Bening Experience</p>
                            </div>

                            <div className="flex gap-6 overflow-x-auto pb-10 px-4 snap-x snap-mandatory no-scrollbar mb-2 text-left">
                                {successData.tickets.map((ticket, idx) => (
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
                                        <div className="py-2 px-6 bg-eling-green/5 rounded-2xl inline-block border border-eling-green/10">
                                            <p className="text-eling-green font-black text-[10px] uppercase tracking-widest text-center">
                                                {event.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {successData.tickets.length > 1 && (
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-pulse text-center">
                                    ⟵ Geser untuk tiket lainnya ⟶
                                </p>
                            )}

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
