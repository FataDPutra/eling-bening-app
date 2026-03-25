import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets, formatRupiah } from '../../utils/data';
import '../../styles/guest.css';

export default function Ticketing() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);

    // Define initial promo codes from HTML logic
    const PROMO_CODES = [
        { code: 'ELINGBENING10', discount: 10, type: 'percent', desc: 'Diskon 10%' },
        { code: 'HEBAT50K', discount: 50000, type: 'flat', desc: 'Potongan Rp 50.000' },
    ];

    const [qtys, setQtys] = useState({
        'ticket-main': 0,
        'ticket-pool': 0
    });

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
        const activeTickets = getTickets().filter(t => t.status === 'active');
        setTickets(activeTickets);
    }, []);

    const updateQty = (id, delta) => {
        setQtys(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    // Calculate Dynamic Prices
    const today = new Date().getDay();
    const isWeekend = today === 0 || today === 5 || today === 6;

    const getTicketPrice = (name) => {
        const ticket = tickets.find(t => t.name.includes(name));
        if (!ticket) return name.includes('Utama') ? 25000 : 20000;
        return isWeekend && ticket.priceWeekend ? ticket.priceWeekend : ticket.price;
    };

    const currentPrices = {
        'ticket-main': getTicketPrice('Utama'),
        'ticket-pool': getTicketPrice('Kolam')
    };

    const applyPromo = () => {
        const code = promoInput.trim().toUpperCase();
        const promo = PROMO_CODES.find(p => p.code === code);

        if (!promo) {
            setActivePromo(null);
            setPromoMsg({
                show: true,
                success: false,
                text: 'Kode promo tidak valid.'
            });
            return;
        }

        setActivePromo(promo);
        setPromoMsg({
            show: true,
            success: true,
            text: `Promo berhasil! ${promo.desc} diterapkan.`
        });
    };

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    if (qtys['ticket-main'] > 0) {
        const amount = qtys['ticket-main'] * currentPrices['ticket-main'];
        subtotal += amount;
        orderItems.push({ name: 'Tiket Masuk Utama', qty: qtys['ticket-main'], price: currentPrices['ticket-main'], amount });
    }
    if (qtys['ticket-pool'] > 0) {
        const amount = qtys['ticket-pool'] * currentPrices['ticket-pool'];
        subtotal += amount;
        orderItems.push({ name: 'Akses Kolam Renang', qty: qtys['ticket-pool'], price: currentPrices['ticket-pool'], amount });
    }

    const hasItems = orderItems.length > 0;
    const adminFee = hasItems ? 2500 : 0;
    let promoDiscountAmt = 0;

    if (activePromo && hasItems) {
        if (activePromo.type === 'percent') {
            promoDiscountAmt = subtotal * (activePromo.discount / 100);
        } else {
            promoDiscountAmt = activePromo.discount;
        }
    }

    const total = Math.max(0, subtotal + adminFee - promoDiscountAmt);

    const simulatePayment = (method) => {
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
                        {/* Ticket Card 1 */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green transition group">
                            <div className="md:w-1/3 h-48 bg-gray-200 rounded-2xl overflow-hidden relative">
                                <img src="/images/hero-bg.png" className="w-full h-full object-cover" alt="Tiket Utama" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-2xl mb-2 font-serif">Tiket Masuk Utama</h3>
                                    <p className="text-gray-500 text-sm mb-6">Akses ke area taman, spot foto skydeck, musholla, dan seluruh area publik Eling Bening.</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        {isWeekend && <p className="text-gray-400 line-through text-sm">{formatRupiah(getTicketPrice('Utama') / 1.2)}</p>}
                                        <p className="text-3xl font-bold text-eling-green">{formatRupiah(currentPrices['ticket-main'])}<span className="text-sm text-gray-400 ml-1">/org</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                                        <button onClick={() => updateQty('ticket-main', -1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="font-bold text-xl w-6 text-center">{qtys['ticket-main']}</span>
                                        <button onClick={() => updateQty('ticket-main', 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Card 2 */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 hover:border-eling-green transition group">
                            <div className="md:w-1/3 h-48 bg-gray-200 rounded-2xl overflow-hidden relative">
                                <img src="/images/hero-bg.png" className="w-full h-full object-cover brightness-75" alt="Akses Kolam" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-2xl mb-2 font-serif">Akses Kolam Renang</h3>
                                    <p className="text-gray-500 text-sm mb-6">Nikmati pengalaman berenang di infinity pool dengan pemandangan pegunungan yang menakjubkan.</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-3xl font-bold text-eling-green">{formatRupiah(currentPrices['ticket-pool'])}<span className="text-sm text-gray-400 ml-1">/org</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                                        <button onClick={() => updateQty('ticket-pool', -1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="font-bold text-xl w-6 text-center">{qtys['ticket-pool']}</span>
                                        <button onClick={() => updateQty('ticket-pool', 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-eling-green hover:text-white transition">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                                <span className="font-semibold">{item.name}</span>
                                                <span className="text-xs text-gray-400">{item.qty}x {formatRupiah(item.price)}</span>
                                            </div>
                                            <span className="font-bold">{formatRupiah(item.amount)}</span>
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
                                        <span>Diskon ({activePromo.code})</span>
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
                                <div className="border-t border-gray-100 pt-6 mb-6 space-y-4">
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
                                disabled={!hasItems || isProcessing}
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
                                {/* Dummy QR using an image from dicebear or just an icon for visual sake */}
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
