import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatRupiah } from '../../utils/data';

export default function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const method = searchParams.get('method') || 'va';

    const [timeLeft, setTimeLeft] = useState(15 * 60 - 1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            alert('Waktu pembayaran habis.');
            navigate('/booking');
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const percentage = (timeLeft / (15 * 60)) * 100;

    const copyText = (txt) => {
        navigator.clipboard.writeText(txt);
        alert('Berhasil disalin: ' + txt);
    };

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setShowSuccess(true);
        }, 2000);
    };

    const cancelBooking = () => {
        if (window.confirm('Anda yakin ingin keluar? Status pesanan akan tetap "Menunggu Pembayaran". Anda bisa melihat statusnya di Riwayat Pesanan.')) {
            navigate('/profile');
        }
    };

    return (
        <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto animate-fade-in min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            {/* Timer Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                    <div className="h-full bg-eling-green transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Selesaikan Pembayaran Dalam</p>
                <div className="text-4xl font-bold text-gray-800 tracking-tight flex justify-center items-center gap-3">
                    <span>{mins < 10 ? '0' + mins : mins}</span>
                    <span className="opacity-30">:</span>
                    <span>{secs < 10 ? '0' + secs : secs}</span>
                </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                        <h2 className="text-2xl font-bold text-gray-800">{formatRupiah(1375000)}</h2>
                    </div>
                    <button onClick={() => copyText('1375000')} className="text-eling-green text-xs font-bold hover:underline flex items-center gap-1">
                        Detail <i className="fas fa-chevron-down text-[10px] opacity-50"></i>
                    </button>
                </div>

                <div className="p-10">
                    {method === 'va' || method === 'bank_transfer' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1280px-Bank_Central_Asia.svg.png" className="h-4 object-contain" alt="BCA" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nomor Virtual Account</p>
                                        <p className="text-xl font-bold text-gray-800 tracking-wider">8077 0811 2345 678</p>
                                    </div>
                                </div>
                                <button onClick={() => copyText('807708112345678')} className="w-10 h-10 rounded-full bg-white text-eling-green flex items-center justify-center shadow-sm border border-gray-100 hover:bg-eling-green hover:text-white transition-all cursor-pointer">
                                    <i className="far fa-copy text-sm"></i>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <i className="fas fa-list-ol text-eling-green opacity-50"></i>
                                    Cara Pembayaran
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                                        <div className="w-6 h-6 rounded-full bg-eling-green/10 text-eling-green flex flex-shrink-0 items-center justify-center font-bold text-xs">1</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">Pilih <span className="font-bold text-gray-800">Transfer &gt; Virtual Account</span> pada menu ATM atau Mobile Banking Anda.</p>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                                        <div className="w-6 h-6 rounded-full bg-eling-green/10 text-eling-green flex flex-shrink-0 items-center justify-center font-bold text-xs">2</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">Masukkan Nomor Virtual Account <span className="font-bold text-gray-800">8077 0811 2345 678</span>.</p>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                                        <div className="w-6 h-6 rounded-full bg-eling-green/10 text-eling-green flex flex-shrink-0 items-center justify-center font-bold text-xs">3</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">Periksa detail pembayaran, lalu masukkan PIN Anda untuk menyelesaikan transaksi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 animate-fade-in">
                            <p className="text-sm text-gray-500">Scan QR Code ini menggunakan aplikasi pembayaran favorit Anda</p>
                            <div className="inline-block p-4 bg-white rounded-3xl border-4 border-gray-50 shadow-inner">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ELINGBENING-RESORT-BOOKING" className="w-64 h-64 rounded-xl" alt="QRIS" />
                            </div>
                            <div className="flex justify-center gap-6 opacity-40">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/1024px-Logo_ovo_purple.svg.png" className="h-4 object-contain" alt="OVO" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Layanan_Pembayaran_Gopay.svg/1280px-Layanan_Pembayaran_Gopay.svg.png" className="h-4 object-contain" alt="Gopay" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/ShopeePay_logo.svg/1280px-ShopeePay_logo.svg.png" className="h-4 object-contain" alt="ShopeePay" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`w-full bg-eling-green text-white font-bold py-5 rounded-2xl shadow-xl shadow-green-900/10 hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300 text-lg ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                    {isProcessing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</> : 'Saya Sudah Bayar'}
                </button>
                <button
                    onClick={cancelBooking}
                    className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl hover:text-gray-600 transition-all text-sm cursor-pointer border border-transparent"
                >
                    Lihat Status Pesanan Nanti
                </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-12 uppercase tracking-[0.2rem]">
                © 2026 Eling Bening Resort & Spa. Secure Payment Gateway.
            </p>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl transition-transform duration-500 scale-100">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <i className="fas fa-check text-4xl"></i>
                        </div>
                        <h2 className="text-3xl font-bold font-serif text-gray-800 mb-4">Pembayaran Berhasil!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Terima kasih atas kepercayaan Anda. E-voucher hotel telah dikirimkan ke email Anda dan dapat diakses di menu Riwayat Transaksi.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/booking-details')}
                                className="w-full bg-eling-green text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all cursor-pointer"
                            >
                                Selesai
                            </button>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-eling-green opacity-70 cursor-pointer">
                                <i className="fas fa-print"></i> Simpan Bukti Pembayaran
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
