import { useNavigate } from 'react-router-dom';

export default function BookingDetails() {
    const navigate = useNavigate();

    return (
        <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen bg-gray-50 animate-fade-in">
            {/* Status Header */}
            <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <nav className="flex text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 gap-2">
                        <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/profile')}>Riwayat</span>
                        <span>/</span>
                        <span className="text-eling-green">Detail Pesanan #EB-RES-99821</span>
                    </nav>
                    <h1 className="text-4xl font-bold font-serif text-gray-800">Review Pemesanan</h1>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Pembayaran Lunas</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Details Area */}
                <div className="lg:col-span-8 space-y-10">

                    {/* 1. Detail Pemesan */}
                    <div className="bg-white rounded-[1.5rem] p-10 border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                                <span className="w-10 h-10 rounded-full bg-eling-green text-white flex items-center justify-center font-bold text-sm">1</span>
                                <h2 className="text-2xl font-bold font-serif text-gray-800">Detail Pemesan</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Nama Lengkap Pemesan</span>
                                    <p className="font-bold text-gray-800 text-base">Tuan Khoirul Anam</p>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Status Pemesan</span>
                                    <p className="font-bold text-gray-800 text-base">Memesan untuk Diri Sendiri</p>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Alamat Email</span>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <i className="far fa-envelope text-xs opacity-50"></i>
                                        <p className="font-bold text-gray-800">anam@example.com</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Nomor Telepon / WhatsApp</span>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <i className="fab fa-whatsapp text-xs opacity-50"></i>
                                        <p className="font-bold text-gray-800">+62 8112345678</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Detail Menginap & Kamar */}
                    <div className="bg-white rounded-[1.5rem] p-10 border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                            <span className="w-10 h-10 rounded-full bg-eling-green text-white flex items-center justify-center font-bold text-sm">2</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Detail Kamar & Menginap</h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-12">
                            <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden shadow-md">
                                <img src="/images/resort-room.png" className="w-full h-full object-cover" alt="Kamar" />
                            </div>
                            <div className="flex-grow py-2">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Kamar Pilihan</span>
                                <h3 className="text-2xl font-bold text-gray-800 font-serif">Deluxe Mountain View</h3>
                                <div className="flex gap-4 mt-3 text-sm text-gray-500 font-medium overflow-x-auto pb-2">
                                    <span className="flex items-center gap-2 whitespace-nowrap"><i className="fas fa-expand text-[10px]"></i> 32 m²</span>
                                    <span className="flex items-center gap-2 whitespace-nowrap"><i className="fas fa-bed text-[10px]"></i> 1 Queen Bed</span>
                                    <span className="flex items-center gap-2 whitespace-nowrap"><i className="fas fa-wifi text-[10px]"></i> Free Wi-Fi</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100/50">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Check-In</span>
                                <p className="text-lg font-bold text-gray-800">Selasa, 10 Maret 2026</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Setelah Pukul 14:00</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100/50">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Check-Out</span>
                                <p className="text-lg font-bold text-gray-800">Rabu, 11 Maret 2026</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Sebelum Pukul 12:00</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between p-6 bg-eling-green/5 rounded-3xl border border-eling-green/10">
                            <span className="text-sm font-bold text-eling-green">Durasi Menginap</span>
                            <span className="text-lg font-bold text-eling-green">1 Malam</span>
                        </div>
                    </div>

                    {/* 3. Permintaan Khusus */}
                    <div className="bg-white rounded-[1.5rem] p-10 border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                            <span className="w-10 h-10 rounded-full bg-eling-green text-white flex items-center justify-center font-bold text-sm">3</span>
                            <h2 className="text-2xl font-bold font-serif text-gray-800">Fasilitas & Permintaan</h2>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-4">Fasilitas Tambahan yang Diminta</span>
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-5 py-3 rounded-2xl bg-white border border-eling-green text-eling-green font-bold text-xs flex items-center gap-2">
                                        <i className="fas fa-check-circle"></i> Lantai Atas
                                    </div>
                                    <div className="px-5 py-3 rounded-2xl bg-white border border-eling-green text-eling-green font-bold text-xs flex items-center gap-2">
                                        <i className="fas fa-check-circle"></i> Ranjang Besar (Large)
                                    </div>
                                    <div className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-300 font-bold text-xs flex items-center gap-2 line-through opacity-50">
                                        <i className="fas fa-times-circle"></i> Kamar Bebas Rokok
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Estimasi Waktu Tiba</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <i className="far fa-clock"></i>
                                        </div>
                                        <p className="font-bold text-gray-800 text-base">14:00 - 15:00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-dashed border-gray-100">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">Catatan Tambahan untuk Resort</span>
                                <blockquote className="bg-gray-50 border-l-4 border-eling-green p-6 rounded-r-3xl text-gray-600 font-medium leading-relaxed italic">
                                    "Mohon siapkan kamar dengan view terbaik dan jika memungkinkan di lantai yang lebih tinggi. Kami sedang merayakan ulang tahun pernikahan. Terima kasih."
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8">

                    {/* ID Card */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Booking ID</p>
                        <h4 className="text-3xl font-bold font-serif mb-10 tracking-wider">#EB-RES-99821</h4>

                        <div className="space-y-6 pt-10 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Dipesan pada</span>
                                <span className="font-bold">06 Mar 2026, 14:20</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Metode Bayar</span>
                                <span className="font-bold">Mandiri VA</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Detail */}
                    <div className="bg-white rounded-[1.5rem] p-10 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-8">
                            <i className="fas fa-receipt text-eling-green text-xl"></i>
                            <h2 className="text-lg font-bold font-serif text-gray-800">Rincian Harga</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Harga Kamar (x1)</span>
                                <span className="font-bold text-gray-700">Rp 1.250.000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Pajak (10%)</span>
                                <span className="font-bold text-gray-700">Rp 125.000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Biaya Layanan</span>
                                <span className="font-bold text-gray-700">Gratis</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-dashed border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Terbayar</span>
                                <span className="text-2xl font-bold text-eling-green">Rp 1.375.000</span>
                            </div>
                        </div>
                    </div>

                    {/* Directions & Help */}
                    <div className="grid grid-cols-1 gap-4">
                        <a href="#" className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fas fa-map-marked-alt"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Lokasi Resort</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Google Maps</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
                        </a>
                    </div>

                    {/* Action Buttons */}
                    <button onClick={() => window.print()} className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer">
                        <i className="fas fa-print"></i> Cetak Bukti Pesanan
                    </button>
                    <button onClick={() => navigate('/profile')} className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl hover:text-gray-600 transition-all text-sm cursor-pointer border border-transparent flex items-center justify-center gap-2">
                        <i className="fas fa-arrow-left"></i> Kembali ke Riwayat
                    </button>

                </div>
            </div>

            <style>{`
                @media print {
                    nav,
                    .lg\\:col-span-4,
                    .bg-gray-900 {
                        display: none !important;
                    }
                    body {
                        background: white;
                    }
                    main {
                        padding-top: 0;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        margin-bottom: 2rem;
                    }
                    .lg\\:col-span-8 {
                        width: 100% !important;
                    }
                }
            `}</style>
        </main>
    );
}
