import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../../utils/data';

export default function Booking() {
    const navigate = useNavigate();
    const [guestType, setGuestType] = useState('self');
    const [promoCode, setPromoCode] = useState('');
    const [promoActive, setPromoActive] = useState(false);
    const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
    const [paymentMethod, setPaymentMethod] = useState('va');

    const basePrice = 1250000;
    const tax = 125000;
    const discountAmount = promoActive ? 50000 : 0;
    const total = basePrice + tax - discountAmount;

    // Hardcoded promo codes from data logic
    const PROMO_CODES = [
        { code: 'ELINGBENING10', discount: 10, type: 'percent', desc: 'Diskon 10%' },
        { code: 'HEBAT50K', discount: 50000, type: 'flat', desc: 'Potongan Rp 50.000' },
    ];

    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;

        const promo = PROMO_CODES.find(p => p.code === code);

        if (!promo) {
            setPromoMessage({ text: 'Kode promo tidak valid.', type: 'error' });
            setPromoActive(false);
            return;
        }

        setPromoMessage({ text: `Berhasil! ${promo.desc} diterapkan.`, type: 'success' });
        setPromoActive(true);
    };

    const handleConfirm = () => {
        navigate(`/payment?method=${paymentMethod}`);
    };

    return (
        <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto animate-fade-in bg-gray-50 min-h-screen relative z-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Form */}
                <div className="lg:col-span-8 space-y-8 relative z-10">

                    {/* 1. Detail Pemesan */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-eling-green text-white flex items-center justify-center font-bold text-sm">1</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Detail Pemesan</h2>
                        </div>

                        <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl text-sm mb-8 flex items-start gap-3 border border-emerald-100">
                            <i className="fas fa-info-circle mt-1 text-lg opacity-80"></i>
                            <p className="leading-relaxed">E-voucher akan dikirimkan ke alamat email ini. Mohon pastikan alamat email dan nomor telepon Anda sudah benar dan aktif.</p>
                        </div>

                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Titel</label>
                                    <div className="relative">
                                        <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none appearance-none transition-all">
                                            <option>Tuan</option>
                                            <option>Nyonya</option>
                                            <option>Nona</option>
                                        </select>
                                        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Nama Depan</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" defaultValue="Khoirul" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Nama Belakang</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" defaultValue="Anam" />
                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1"><i className="fas fa-info-circle opacity-50"></i> Sesuai KTP/Paspor/SIM</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Email</label>
                                    <div className="relative">
                                        <i className="far fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                        <input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" defaultValue="anam@example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Nomor Telepon / WhatsApp</label>
                                    <div className="flex group">
                                        <span className="bg-gray-100 border border-r-0 border-gray-100 rounded-l-xl px-4 py-3.5 text-gray-400 font-bold">+62</span>
                                        <input type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-r-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" defaultValue="8112345678" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* 2. Data Tamu */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${guestType === 'other' ? 'bg-eling-green text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Data Tamu</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`relative flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition bg-white ${guestType === 'self' ? 'border-primary' : 'border-gray-100 hover:border-eling-green/30'}`}>
                                <input type="radio" name="guest_type" className="w-6 h-6 border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green" checked={guestType === 'self'} onChange={() => setGuestType('self')} />
                                <div>
                                    <p className="font-bold text-gray-800">Diri Sendiri</p>
                                    <p className="text-xs text-gray-400">Saya yang akan menginap</p>
                                </div>
                            </label>
                            <label className={`relative flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition bg-white ${guestType === 'other' ? 'border-primary' : 'border-gray-100 hover:border-eling-green/30'}`}>
                                <input type="radio" name="guest_type" className="w-6 h-6 border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green" checked={guestType === 'other'} onChange={() => setGuestType('other')} />
                                <div>
                                    <p className="font-bold text-gray-800">Orang Lain</p>
                                    <p className="text-xs text-gray-400">Saya memesankan untuk orang lain</p>
                                </div>
                            </label>
                        </div>

                        {/* Hidden guest form */}
                        {guestType === 'other' && (
                            <div className="space-y-6 mt-8 pt-8 border-t border-dashed border-gray-100 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Nama Depan Tamu</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" placeholder="Contoh: Budi" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide">Nama Belakang Tamu</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all" placeholder="Contoh: Santoso" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Fasilitas & Permintaan Khusus */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">3</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Fasilitas & Permintaan Khusus</h2>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="far fa-clock text-eling-green"></i>
                                <h3 className="font-bold text-gray-800">Informasi Check-in Khusus</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">Waktu Check-in Standar: <span className="font-bold text-gray-700">14:00 - 22:00</span></p>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Perkiraan Waktu Kedatangan (Opsional)</label>
                                <div className="relative">
                                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none appearance-none transition-all">
                                        <option>Pilih waktu kedatangan</option>
                                        <option>14:00 - 15:00</option>
                                        <option>15:00 - 16:00</option>
                                        <option>16:00 - 17:00</option>
                                        <option>17:00 - 18:00</option>
                                    </select>
                                    <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wide">Pilih Fasilitas Tambahan</label>
                                <p className="text-[10px] text-gray-400 mb-4 inline-flex items-center gap-1"><i className="fas fa-info-circle opacity-50"></i> Tergantung ketersediaan saat check-in</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-eling-green/20 transition-all select-none group">
                                        <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green transition-all" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Kamar Bebas Rokok</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-eling-green/20 transition-all select-none group">
                                        <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green transition-all" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Lantai Atas</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-eling-green/20 transition-all select-none group">
                                        <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green transition-all" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Ranjang Besar (Large)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-eling-green/20 transition-all select-none group">
                                        <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-eling-green checked:border-transparent accent-eling-green transition-all" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Ranjang Twin (Sepisah)</span>
                                    </label>
                                </div>

                                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Catatan Lainnya</label>
                                <textarea rows="4" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 focus:outline-none transition-all resize-none" placeholder="Contoh: Rayakan hari ulang tahun, butuh kursi roda, dsb..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 4. Metode Pembayaran */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">4</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Metode Pembayaran</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'va' ? 'border-primary bg-green-50/50 shadow-sm shadow-green-900/5' : 'border-gray-100 bg-white hover:bg-gray-50/50 hover:border-gray-200'} group`}>
                                <input type="radio" name="payment" value="va" checked={paymentMethod === 'va'} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute top-6 right-6 w-6 h-6 accent-eling-green" />
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <i className={`fas fa-university text-xl ${paymentMethod === 'va' ? 'text-eling-green' : 'text-gray-400 group-hover:text-eling-green'}`}></i>
                                </div>
                                <span className="font-bold text-gray-800 text-lg">Virtual Account</span>
                                <span className="text-xs text-gray-400 mt-1">Transfer otomatis via BCA, Mandiri, BNI, BRI</span>
                            </label>
                            <label className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-primary bg-green-50/50 shadow-sm shadow-green-900/5' : 'border-gray-100 bg-white hover:bg-gray-50/50 hover:border-gray-200'} group`}>
                                <input type="radio" name="payment" value="qris" checked={paymentMethod === 'qris'} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute top-6 right-6 w-6 h-6 accent-eling-green" />
                                <div className="w-12 h-12 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <i className={`fas fa-qrcode text-xl ${paymentMethod === 'qris' ? 'text-eling-green' : 'text-gray-400 group-hover:text-eling-green'}`}></i>
                                </div>
                                <span className="font-bold text-gray-800 text-lg">QRIS / E-Wallet</span>
                                <span className="text-xs text-gray-400 mt-1">Gopay, OVO, ShopeePay, Transfer LinkAja</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-4 relative z-0">
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-28">
                        <div className="relative">
                            <img src="/images/resort-room.png" className="h-44 w-full object-cover" alt="Room" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-6">
                                <h3 className="font-serif font-bold text-xl text-white">Deluxe Mountain View</h3>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <i className="fas fa-calendar-check text-eling-green mt-1"></i>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Check-in / Out</p>
                                        <p className="text-[13px] font-bold text-gray-700 leading-tight">10 Mar 2026 - 11 Mar 2026</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">1 Malam • 1 Kamar</p>
                                    </div>
                                    <button onClick={() => navigate('/booking')} className="ml-auto text-xs font-bold text-eling-green bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-eling-green hover:text-white transition-all">Ubah</button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Rincian Biaya</h4>
                                <div className="space-y-3 px-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Kamar Deluxe (x1)</span>
                                        <span className="font-bold text-gray-700">{formatRupiah(basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Pajak (10%)</span>
                                        <span className="font-bold text-gray-700">{formatRupiah(tax)}</span>
                                    </div>
                                    {promoActive && (
                                        <div className="flex justify-between text-sm text-eling-green animate-fade-in">
                                            <span className="font-medium">Potongan Promo</span>
                                            <span className="font-bold">- {formatRupiah(50000)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-eling-green pt-4 border-t border-gray-100">
                                        <span>Total Bayar</span>
                                        <span>{formatRupiah(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mb-8 p-1">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <i className="fas fa-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                        <input type="text" placeholder="Punya Kode Promo?" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="w-full border border-gray-100 rounded-xl pl-11 pr-4 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-eling-green/10 focus:border-eling-green/30 uppercase tracking-widest bg-gray-50 transition-all" />
                                    </div>
                                    <button onClick={handleApplyPromo} className="bg-eling-green/10 text-eling-green font-bold px-6 rounded-xl hover:bg-eling-green hover:text-white transition-all text-xs border border-eling-green/10 shadow-sm shadow-green-900/10">Pakai</button>
                                </div>
                                {promoMessage.text && (
                                    <div className={`mt-3 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${promoMessage.type === 'error' ? 'text-rose-500 bg-rose-50 border border-rose-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                                        <i className={`fas max-w-none ${promoMessage.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}`}></i> {promoMessage.text}
                                    </div>
                                )}
                            </div>

                            <button onClick={handleConfirm} className="w-full bg-eling-green text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-900/10 hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300 text-lg flex items-center justify-center gap-3 cursor-pointer">
                                Selesaikan Pembayaran
                            </button>

                            <div className="flex items-center justify-center gap-3 mt-6 opacity-40">
                                <img src="/images/logo.png" className="h-4 grayscale invert brightness-50" alt="Secure Checkout" />
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Secure Checkout System</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
