import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import '../../styles/guest.css';

export default function Ticketing() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [qtys, setQtys] = useState({});
    const [promoInput, setPromoInput] = useState('');
    const [activePromo, setActivePromo] = useState(null);
    const [promoMsg, setPromoMsg] = useState({ show: false, success: false, text: '' });
    const [bookDate, setBookDate] = useState('');
    const [bookerName, setBookerName] = useState('');

    // For payment modal
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ticketDate, setTicketDate] = useState('');

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

    const updateQty = (id, delta) => {
        setQtys(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const applyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if(!code) return;

        try {
            const res = await axios.post('/api/promos/validate', { promo_code: code });
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

    if (activePromo && hasItems) {
        if (subtotal >= activePromo.min_purchase) {
            if (activePromo.discount_type === 'percentage') {
                promoDiscountAmt = subtotal * (activePromo.discount_value / 100);
            } else {
                promoDiscountAmt = parseFloat(activePromo.discount_value);
            }
        }
    }

    const total = Math.max(0, subtotal + adminFee - promoDiscountAmt);

    const simulatePayment = (method) => {
        if (!hasItems) return;

        // Note: For real integration, we should post trans to backend.
        // For guest, let's assume they must login first to hit transactions.
        // We'll simulate here, then direct to profile.
        // Real logic: axios.post('/api/transactions', { items, promo, etc... })

        setShowPayment(false);
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            const formattedDate = bookDate ? new Date(bookDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('id-ID');
            setTicketDate(`Berlaku untuk: ${formattedDate}`);
            setShowSuccess(true);
        }, 1500);
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
                                <div key={ticket.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green transition group">
                                    <div className="md:w-1/3 h-48 bg-gray-200 rounded-2xl overflow-hidden relative">
                                        <img src="/images/hero-bg.png" className="w-full h-full object-cover" alt={ticket.name} />
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
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-3xl font-bold text-eling-green">{formatRupiah(ticket.price)}<span className="text-sm text-gray-400 ml-1">/org</span></p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                                                <button onClick={() => updateQty(ticket.id, -1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <span className="font-bold text-xl w-6 text-center">{qtys[ticket.id] || 0}</span>
                                                <button onClick={() => updateQty(ticket.id, 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                                    <i className="fas fa-plus"></i>
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
                        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-32">
                            <h3 className="font-bold text-xl mb-6 font-serif">Ringkasan Pesanan</h3>

                            <div className="space-y-4 mb-6 text-sm min-h-[60px]">
                                {!hasItems ? (
                                    <p className="text-center text-gray-400 italic py-4">Belum ada tiket yang dipilih</p>
                                ) : (
                                    orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">{item.name}</span>
                                                <span className="text-xs text-gray-400">{item.qty}x {formatRupiah(item.price)}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{formatRupiah(item.amount)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
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
                                <div className="flex justify-between text-2xl font-bold text-eling-green pt-4">
                                    <span>Total</span>
                                    <span>{formatRupiah(total)}</span>
                                </div>
                            </div>

                            {/* Form Pilihan Tanggal dan Nama (hanya tampil jika ada tiket dipilih) */}
                            {hasItems && (
                                <div className="border-t border-gray-100 pt-6 mb-6 mt-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">
                                            Tanggal Kunjungan
                                        </label>
                                        <input
                                            type="date"
                                            value={bookDate}
                                            onChange={(e) => setBookDate(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">
                                            Nama Pemesan / Pengunjung
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Cth: Budi Santoso"
                                            value={bookerName}
                                            onChange={(e) => setBookerName(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Jika memesan untuk orang lain, masukkan nama perwakilan rombongan.</p>
                                    </div>
                                </div>
                            )}

                            {/* Promo Code */}
                            <div className="border-t border-gray-100 pt-6 mb-6">
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">
                                    <i className="fas fa-tag mr-1"></i> Kode Promo
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value)}
                                        placeholder="Masukkan kode promo..."
                                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 uppercase tracking-widest"
                                    />
                                    <button
                                        onClick={applyPromo}
                                        className="bg-eling-green text-white font-bold px-5 rounded-xl hover:opacity-90 transition text-sm flex items-center gap-1 whitespace-nowrap"
                                    >
                                        <i className="fas fa-check"></i> Pakai
                                    </button>
                                </div>
                                {promoMsg.show && (
                                    <div className={`mt-2 text-xs font-bold flex items-center gap-2 ${promoMsg.success ? 'text-green-600' : 'text-red-500'}`}>
                                        <i className={`fas ${promoMsg.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                        {promoMsg.text}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (!bookDate) return alert('Silakan pilih tanggal kunjungan terlebih dahulu.');
                                    if (!bookerName) return alert('Silakan masukkan nama pemesan terlebih dahulu.');
                                    setShowPayment(true);
                                }}
                                disabled={!hasItems || isProcessing || isLoading}
                                className="w-full bg-eling-red text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-800 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Memproses...</>
                                ) : (
                                    'Lanjut Pembayaran'
                                )}
                            </button>
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
            {showSuccess && (
                <div className="fixed inset-0 z-[70] bg-eling-green flex flex-col items-center justify-center p-6 bg-opacity-95 text-white animate-fade-in">
                    <div className="max-w-lg w-full text-center">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <i className="fas fa-check text-5xl"></i>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 font-serif">Pembayaran Berhasil!</h2>
                        <p className="text-green-100 mb-12">Simpan QR Code di bawah untuk discan di pintu masuk Eling Bening.</p>

                        <div className="bg-white p-8 rounded-3xl inline-block shadow-2xl mb-12 text-center">
                            <div className="mb-4 flex justify-center bg-white p-2">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EB-TICK-${Math.floor(Math.random() * 1000000)}&color=2E7D32`} alt="QR Code" width={200} height={200} />
                            </div>
                            <p className="text-gray-900 font-bold text-lg mb-1">{bookerName || 'Guest'}</p>
                            <p className="text-gray-600 font-bold text-sm">EB-TICK-{Math.floor(Math.random() * 1000000)}</p>
                            <p className="text-gray-500 text-xs mt-2">{ticketDate}</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={() => window.print()} className="bg-white text-eling-green px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition">
                                <i className="fas fa-download mr-2"></i> Simpan PDF
                            </button>
                            <button onClick={() => { setShowSuccess(false); navigate('/profile'); }} className="bg-black/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-black/30 transition">
                                Lihat Riwayat Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
