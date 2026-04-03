import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../utils/AuthContext';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2 } from 'lucide-react';
import '../../styles/guest.css';

export default function Ticketing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [qtys, setQtys] = useState({});
    const [promoInput, setPromoInput] = useState('');
    const [activePromo, setActivePromo] = useState(null);
    const [promoMsg, setPromoMsg] = useState({ show: false, success: false, text: '' });
    const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookerName, setBookerName] = useState('');

    // For payment modal
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [ticketDate, setTicketDate] = useState('');

    useEffect(() => {
        if (user) {
            setBookerName(user.name);
        }
    }, [user]);

    useEffect(() => {
        axios.get('/api/tickets')
            .then(res => {
                const activeTickets = res.data.filter(t => t.is_active);
                setTickets(activeTickets);
                
                // Initialize qtys state
                const initialQtys = {};
                activeTickets.forEach(t => initialQtys[t.id] = 0);
                setQtys(initialQtys);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch tickets", err);
                setIsLoading(false);
            });
    }, []);

    const [guestNamesData, setGuestNamesData] = useState({});

    const location = useLocation();
    const updateQty = (id, delta) => {
        if (!user && delta > 0) {
            navigate('/login', { state: { from: location } });
            return;
        }

        const currentTotal = Object.values(qtys).reduce((acc, q) => acc + q, 0);
        const newQty = Math.max(0, (qtys[id] || 0) + delta);
        
        if (delta > 0 && currentTotal >= 10) {
            toast.error('Maksimal pemesanan adalah 10 tiket per transaksi.');
            return;
        }

        setQtys(prev => ({ ...prev, [id]: newQty }));

        // Manage guest names array for this ticket type
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

    const updateGuestName = (ticketId, index, name) => {
        setGuestNamesData(prev => {
            const names = [...(prev[ticketId] || [])];
            names[index] = name;
            return { ...prev, [ticketId]: names };
        });
    };

    const applyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if(!code) return;

        try {
            const res = await axios.post('/api/promos/validate', { 
                promo_code: code,
                booking_type: 'TICKET',
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

    tickets.forEach(t => {
        const qty = qtys[t.id] || 0;
        if (qty > 0) {
            const amount = qty * t.price;
            subtotal += amount;
            orderItems.push({ id: t.id, name: t.name, qty, price: t.price, amount });
        }
    });

    const hasItems = orderItems.length > 0;
    const adminFee = hasItems ? 2500 : 0;
    let promoDiscountAmt = 0;
    let minPurchaseError = false;

    if (activePromo && hasItems) {
        if (subtotal >= activePromo.min_purchase) {
            if (activePromo.discount_type === 'percentage') {
                promoDiscountAmt = subtotal * (activePromo.discount_value / 100);
            } else {
                promoDiscountAmt = parseFloat(activePromo.discount_value);
            }
        } else {
            minPurchaseError = true;
        }
    }

    const total = Math.max(0, subtotal + adminFee - promoDiscountAmt);

    const simulatePayment = async (method) => {
        if (!hasItems) return;
        if (!user) {
            Swal.fire({
                title: 'Harap Login',
                text: 'Silakan login terlebih dahulu untuk melakukan pemesanan.',
                icon: 'warning',
                confirmButtonColor: '#2E7D32',
                confirmButtonText: 'Login Sekarang',
                showCancelButton: true,
                customClass: { popup: 'rounded-[2rem] font-serif' }
            }).then(res => {
                if (res.isConfirmed) navigate('/login', { state: { from: location } });
            });
            return;
        }

        setShowPayment(false);
        setIsProcessing(true);

        const transId = `EB-TICK-${Math.floor(Math.random() * 899999 + 100000)}`;
        
        const payload = {
            id: transId,
            booking_type: 'TICKET',
            booker_name: bookerName,
            payment_method: method,
            promo_id: activePromo?.id,
            check_in_date: bookDate,
            total_price: total,
            total_qty: orderItems.reduce((acc, item) => acc + item.qty, 0),
            discount_amount: promoDiscountAmt,
            items: orderItems.map(item => ({
                item_id: item.id,
                item_type: 'App\\Models\\Ticket',
                quantity: item.qty,
                price: item.price,
                guest_names: guestNamesData[item.id] || []
            }))
        };

        try {
            const res = await axios.post('/api/transactions', payload);
            setSuccessData(res.data);
            setIsProcessing(false);
            const formattedDate = bookDate ? new Date(bookDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('id-ID');
            setTicketDate(`Berlaku untuk: ${formattedDate}`);
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

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen">
            {/* Header / Hero */}
            <header className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 font-serif">Pesan Tiket Online</h1>
                    <p className="text-gray-500">Pilih paket tiket Anda dan nikmati akses instan via QR Code.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Ticket Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading ? (
                            <div className="text-center py-20 text-gray-500 text-xl font-bold">Memuat tiket...</div>
                        ) : tickets.length === 0 ? (
                            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                                Saat ini tidak ada tiket yang tersedia.
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <div key={ticket.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green transition-all group overflow-hidden">
                                    <div className="md:w-1/3 h-52 bg-slate-100 rounded-2xl overflow-hidden relative border border-gray-50 uppercase font-black text-[10px] tracking-widest text-slate-300 flex items-center justify-center">
                                        <img src={ticket.image || "/images/hero-bg.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ticket.name} />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-2xl font-serif">{ticket.name}</h3>
                                                {ticket.validity_day === 'weekend' && (
                                                    <span className="bg-green-100 text-eling-green text-[10px] uppercase font-bold px-2 py-1 rounded">Weekend</span>
                                                )}
                                                {ticket.validity_day === 'weekday' && (
                                                    <span className="bg-blue-100 text-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded">Weekday</span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm mb-6">{ticket.description}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Harga Per Orang</p>
                                                <p className="text-4xl font-black text-eling-green font-serif tracking-tight leading-none">
                                                    {formatRupiah(ticket.price)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 min-w-[140px]">
                                                <button 
                                                    onClick={() => updateQty(ticket.id, -1)} 
                                                    className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-eling-red hover:text-white transition-all active:scale-95 border border-gray-100"
                                                >
                                                    <i className="fas fa-minus text-xs"></i>
                                                </button>
                                                <span className="font-black text-xl w-6 text-center text-gray-900">{qtys[ticket.id] || 0}</span>
                                                <button 
                                                    onClick={() => updateQty(ticket.id, 1)} 
                                                    className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition-all active:scale-95 border border-gray-100"
                                                >
                                                    <i className="fas fa-plus text-xs"></i>
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
                        <div className="sticky top-10 space-y-6">
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-eling-green/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="font-bold text-xl mb-6 font-serif relative">Ringkasan Pesanan</h3>

                                <div className="space-y-4 mb-6 text-sm min-h-[60px] relative">
                                    {!hasItems ? (
                                        <p className="text-center text-gray-400 italic py-4">Belum ada tiket yang dipilih</p>
                                    ) : (
                                        orderItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 group-hover:text-eling-green transition-colors">{item.name}</span>
                                                    <span className="text-xs text-gray-400">{item.qty}x {formatRupiah(item.price)}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{formatRupiah(item.amount)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-200 pt-6 space-y-3 relative">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span>{formatRupiah(subtotal)}</span>
                                    </div>
                                    {activePromo && (
                                        <div className="flex justify-between text-red-500">
                                            <span>Diskon ({activePromo.promo_code})</span>
                                            <span>-{formatRupiah(promoDiscountAmt)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-500">
                                        <span>Biaya Admin (Payment)</span>
                                        <span>{formatRupiah(adminFee)}</span>
                                    </div>
                                    <div className="flex flex-col pt-4 border-t border-gray-100 mt-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 text-center font-sans">Total Tagihan</span>
                                        <span className="text-3xl font-black text-eling-green text-center font-serif tracking-tight">{formatRupiah(total)}</span>
                                    </div>
                                </div>

                                {/* Form Pilihan Tanggal dan Nama (hanya tampil jika ada tiket dipilih) */}
                                {hasItems && (
                                    <div className="border-t border-gray-100 pt-6 mb-6 mt-6 space-y-4 relative">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">
                                                Tanggal Kunjungan
                                            </label>
                                            <input
                                                type="date"
                                                value={bookDate}
                                                onChange={(e) => setBookDate(e.target.value)}
                                                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-eling-green/10 focus:border-eling-green outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">
                                                Nama Pemesan Utama
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={`Otomatis: ${user?.name || 'Nama Akun'}`}
                                                value={bookerName}
                                                onChange={(e) => setBookerName(e.target.value)}
                                                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-eling-green/10 focus:border-eling-green outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-gray-400 italic mt-1.5 opacity-70">*Biarkan kosong untuk menggunakan nama akun Anda.</p>
                                        </div>

                                        {/* Manifest Header */}
                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg inline-block">Manifest Pengunjung & QR Code</p>
                                        </div>
                                    </div>
                                )}

                                {/* Promo Code */}
                                <div className="border-t border-gray-100 pt-6 mb-6 relative">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide text-center">
                                        <i className="fas fa-tag mr-1"></i> Kode Promo
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            placeholder="KODE"
                                            className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-eling-green/10 outline-none transition-all"
                                        />
                                        <button
                                            onClick={applyPromo}
                                            className="bg-gray-900 text-white font-black px-5 rounded-xl hover:bg-eling-green transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-lg shadow-gray-900/10"
                                        >
                                            Pakai
                                        </button>
                                    </div>
                                    {promoMsg.show && !minPurchaseError && (
                                        <div className={`mt-2 text-[9px] font-black uppercase text-center tracking-widest ${promoMsg.success ? 'text-eling-green' : 'text-eling-red'}`}>
                                            {promoMsg.text}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        if (!user) { navigate('/login', { state: { from: location } }); return; }
                                        if (!bookDate) return alert('Silakan pilih tanggal kunjungan terlebih dahulu.');
                                        setShowPayment(true);
                                    }}
                                    disabled={!hasItems || isProcessing || isLoading}
                                    className="w-full bg-eling-red text-white font-black py-5 rounded-2xl shadow-xl shadow-eling-red/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-4"
                                >
                                    {isProcessing ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        'Lanjut Pembayaran'
                                    )}
                                </button>
                            </div>

                            {/* Ticket Policies Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                                <h4 className="text-xl font-black font-serif mb-3 leading-tight relative z-10 font-serif">Kebijakan Tiket</h4>
                                <p className="text-blue-100 font-bold text-xs leading-relaxed relative z-10 opacity-80 uppercase tracking-wide">
                                    Tiket yang sudah dibeli tidak dapat di-reschedule atau di-refund. Mohon pastikan data kunjungan sudah sesuai.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
                        <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <h3 className="font-bold text-2xl mb-2 font-serif">Pilih Metode Pembayaran</h3>
                        <p className="text-sm text-gray-500 mb-8">Pembayaran aman dan integrasi otomatis.</p>

                        <div className="space-y-4">
                            <button onClick={() => simulatePayment('VA')} className="w-full flex items-center justify-between p-4 border rounded-2xl hover:border-eling-green hover:bg-green-50 transition group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <i className="fas fa-university"></i>
                                    </div>
                                    <span className="font-bold">Virtual Account (VA)</span>
                                </div>
                                <i className="fas fa-chevron-right text-gray-300 group-hover:text-eling-green"></i>
                            </button>
                            <button onClick={() => simulatePayment('QRIS')} className="w-full flex items-center justify-between p-4 border rounded-2xl hover:border-eling-green hover:bg-green-50 transition group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                        <i className="fas fa-qrcode"></i>
                                    </div>
                                    <span className="font-bold">QRIS / E-Wallet</span>
                                </div>
                                <i className="fas fa-chevron-right text-gray-300 group-hover:text-eling-green"></i>
                            </button>
                            <button onClick={() => simulatePayment('CC')} className="w-full flex items-center justify-between p-4 border rounded-2xl hover:border-eling-green hover:bg-green-50 transition group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <span className="font-bold">Kartu Kredit</span>
                                </div>
                                <i className="fas fa-chevron-right text-gray-300 group-hover:text-eling-green"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && successData && (
                <div className="fixed inset-0 z-[1000] bg-eling-green overflow-y-auto">
                    <div className="min-h-full flex flex-col items-center p-6 sm:p-12">
                        <div className="max-w-4xl w-full my-auto py-10">
                        <div className="text-center text-white mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce text-4xl shadow-xl">
                                <i className="fas fa-check"></i>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-2 font-serif leading-tight">Berhasil Terpesan!</h2>
                            <p className="text-green-100 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Eling Bening Experience</p>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-10 px-4 snap-x snap-mandatory no-scrollbar mb-8">
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
                                    <div className="inline-block py-2 px-6 bg-eling-green/5 rounded-2xl border border-eling-green/10">
                                        <p className="text-eling-green font-black text-[10px] uppercase tracking-widest text-center">
                                            {ticket.transaction_item?.item?.name || 'Tiket Wisata'}
                                        </p>
                                    </div>
                                    <p className="text-gray-400 text-[10px] mt-4 font-bold italic tracking-wide">{ticketDate}</p>
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
