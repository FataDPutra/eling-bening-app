import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import { 
    Calendar, User, CreditCard, MapPin, 
    ArrowLeft, Printer, CheckCircle2, 
    Clock, Mail, Phone, Info, LayoutGrid, Package, Star
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { content } = useContent();
    const [transaction, setTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        axios.get(`/api/transactions/${id}`)
            .then(res => {
                setTransaction(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch transaction details", err);
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return (
            <div className="pt-32 flex flex-col items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-eling-green/20 border-t-eling-green rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Detail Pesanan...</p>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="pt-32 text-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-800 font-serif mb-4">Pesanan Tidak Ditemukan</h2>
                <button onClick={() => navigate('/profile')} className="text-eling-green font-bold">Kembali ke Riwayat</button>
            </div>
        );
    }

    const resortItem = transaction.items?.find(item => item.item_type.includes('Resort'));
    const resort = resortItem?.item;
    
    // Status Badge Helpers
    const getStatusStyle = (status) => {
        switch(status) {
            case 'success':
            case 'paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'failed':
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'success': return 'Pembayaran Berhasil';
            case 'paid': return 'Lunas';
            case 'pending': return 'Menunggu Pembayaran';
            case 'failed': return 'Gagal';
            case 'cancelled': return 'Dibatalkan';
            default: return status?.toUpperCase();
        }
    };

    // Calculate Prices
    const nights = Math.max(1, (new Date(transaction.check_out_date) - new Date(transaction.check_in_date)) / (1000 * 60 * 60 * 24));
    const roomSubtotal = (resortItem?.price || 0) * (resortItem?.quantity || 1) * nights;
    
    // Initial additional facilities calculation (Pre-checkin)
    const initialAddOnTotal = Array.isArray(transaction.additional_facilities) 
        ? transaction.additional_facilities.reduce((sum, f) => sum + (Number(f.price || 0)), 0)
        : 0;

    // Post-checkin addons (Stay Addons)
    const stayAddons = transaction.addons || [];
    const stayAddonsTotal = stayAddons.reduce((sum, addon) => sum + Number(addon.total_price || 0), 0);

    // Reschedule History & Fees
    const reschedules = (transaction.reschedules || []).filter(r => r.status === 'completed');
    const rescheduledTotal = reschedules.reduce((sum, r) => sum + Number(r.final_charge || 0), 0);

    const baseAmount = roomSubtotal + initialAddOnTotal;

    return (
        <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen bg-gray-50 animate-fade-in print:bg-white print:pt-0">
            {/* 0. Print Header (Logo Only) */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-eling-green pb-8 mb-12">
                <div className="flex items-center gap-4">
                    <img src={content.layout.logo || '/images/logo.png'} alt="Logo" className="h-20 w-auto object-contain" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Official Transaction Proof</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice ID</p>
                    <p className="text-xl font-bold font-serif text-gray-800">#{transaction.id}</p>
                </div>
            </div>

            {/* Status Header */}
            <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 print:hidden">
                <div>
                    <nav className="flex text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 gap-2">
                        <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/profile')}>Riwayat</span>
                        <span>/</span>
                        <span className="text-eling-green">Detail Pesanan #{transaction.id}</span>
                    </nav>
                    <h1 className="text-4xl font-bold font-serif text-gray-800">Detail Pemesanan</h1>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-sm ${getStatusStyle(transaction.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${transaction.status === 'success' || transaction.status === 'paid' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-xs font-black uppercase tracking-widest">{getStatusLabel(transaction.status)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Details Area */}
                <div className="lg:col-span-8 space-y-10">

                    {/* 1. Detail Pemesan */}
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-2xl bg-eling-green/10 text-eling-green flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <h2 className="text-2xl font-black font-serif text-gray-800">Informasi Pemesan</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Lengkap</span>
                                    <p className="font-bold text-gray-800 text-base">{transaction.booker_name}</p>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email</span>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Mail size={14} className="opacity-40" />
                                        <p>{transaction.booker_email}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Nomor Telepon</span>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Phone size={14} className="opacity-40" />
                                        <p>{transaction.booker_phone || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Waktu Kedatangan</span>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Clock size={14} className="opacity-40" />
                                        <p>{transaction.arrival_time || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Detail Resort */}
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-2xl bg-eling-green/10 text-eling-green flex items-center justify-center">
                                <Package size={20} />
                            </div>
                            <h2 className="text-2xl font-black font-serif text-gray-800">Detail Kamar & Resort</h2>
                        </div>

                        {resort ? (
                            <>
                                <div className="flex flex-col md:flex-row gap-8 mb-12">
                                    <div className="w-full md:w-56 h-36 rounded-3xl overflow-hidden shadow-lg group">
                                        <img 
                                            src={resort.gallery?.[0] || "/images/resort-room.png"} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                            alt={resort.name} 
                                        />
                                    </div>
                                    <div className="flex-grow py-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={10} fill={i < 4 ? "#FACC15" : "none"} className={i < 4 ? "text-yellow-400" : "text-gray-200"} />
                                            ))}
                                        </div>
                                        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tipe Kamar</span>
                                        <h3 className="text-3xl font-black text-gray-900 font-serif leading-none mb-4">{resort.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><LayoutGrid size={12} /> {resort.room_size || '32'} m²</span>
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><User size={12} /> {resort.capacity || '2'} Tamu</span>
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Package size={12} /> {resortItem?.quantity || 1} Unit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-dashed border-gray-100">
                                    <div className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-eling-green shadow-sm">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Check-In</span>
                                            <p className="text-base font-black text-gray-800">{new Date(transaction.check_in_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-eling-green shadow-sm">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Check-Out</span>
                                            <p className="text-base font-black text-gray-800">{new Date(transaction.check_out_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between px-2">
                                    <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Durasi</span>
                                    <span className="text-xl font-black text-gray-900 font-serif">{nights} Malam</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Data item resort tidak tersedia.</p>
                        )}
                    </div>

                    {/* 3. Fasilitas & Permintaan */}
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-2xl bg-eling-green/10 text-eling-green flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h2 className="text-2xl font-black font-serif text-gray-800">Layanan & Fasilitas</h2>
                        </div>

                        <div className="space-y-12">
                            {/* Original Addons */}
                            <div>
                                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Layanan Saat Reservasi Utama</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Array.isArray(transaction.additional_facilities) && transaction.additional_facilities.length > 0 ? (
                                        transaction.additional_facilities.map((fac, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-green-50 border border-eling-green/20 group">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 size={18} className="text-eling-green" />
                                                    <span className="text-sm font-bold text-gray-800">{fac.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-eling-green">{formatRupiah(fac.price)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tidak ada fasilitas tambahan saat reservasi</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stay Addons (ordered during check-in/stay) */}
                            {stayAddons.length > 0 && (
                                <div className="pt-10 border-t border-dashed border-gray-100">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-blue-600">Layanan Tambahan Selama Menginap</span>
                                    <div className="space-y-4">
                                        {stayAddons.map((addon, i) => (
                                            <div key={i} className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Order #{addon.id}</span>
                                                    <span className="text-xs font-black text-gray-400">{new Date(addon.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {addon.items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                <span className="text-sm font-bold text-gray-700">{item.item?.name || 'Item'} (x{item.quantity})</span>
                                                            </div>
                                                            <span className="text-sm font-black text-gray-900">{formatRupiah(item.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reschedule Log */}
                            {reschedules.length > 0 && (
                                <div className="pt-10 border-t border-dashed border-gray-100">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-orange-600">Riwayat Reschedule</span>
                                    <div className="space-y-4">
                                        {reschedules.map((r, i) => (
                                            <div key={i} className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600">Biaya Perubahan Jadwal</span>
                                                    <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-widest">Lunas</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dari</span>
                                                        <p className="text-xs font-black text-gray-600 line-through">{new Date(r.old_date).toLocaleDateString('id-ID')}</p>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-orange-400">Ke</span>
                                                        <p className="text-xs font-black text-gray-800">{new Date(r.new_date).toLocaleDateString('id-ID')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 border-t border-orange-200/50 pt-4">
                                                    {r.price_diff > 0 && (
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500">Selisih Harga Kamar</span>
                                                            <span className="font-bold text-gray-900">{formatRupiah(r.price_diff)}</span>
                                                        </div>
                                                    )}
                                                    {r.admin_fee > 0 && (
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500">Biaya Admin</span>
                                                            <span className="font-bold text-gray-900">{formatRupiah(r.admin_fee)}</span>
                                                        </div>
                                                    )}
                                                    {r.penalty_fee > 0 && (
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500">Biaya Denda</span>
                                                            <span className="font-bold text-gray-900">{formatRupiah(r.penalty_fee)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {transaction.special_requests && (
                                <div className="pt-10 border-t border-dashed border-gray-100">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Catatan Khusus Tamu</span>
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border-l-4 border-eling-green shadow-inner">
                                        <p className="text-gray-600 font-bold leading-relaxed italic text-sm">"{transaction.special_requests}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8 print:hidden">

                    {/* ID Card */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Invoice ID</p>
                        <h4 className="text-3xl font-bold font-serif mb-10 tracking-wider">#{transaction.id}</h4>

                        <div className="space-y-6 pt-10 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Dipesan pada</span>
                                <span className="font-bold">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Metode Bayar</span>
                                <span className="font-bold text-eling-green">{transaction.payment_method?.toUpperCase() || 'VA'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Detail */}
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-10 border-b border-gray-50 pb-6">
                            <div className="w-8 h-8 rounded-xl bg-eling-green/10 text-eling-green flex items-center justify-center">
                                <Calculator size={16} className="lucide-icon" />
                            </div>
                            <h2 className="text-base font-black font-serif text-gray-900">Rincian Pembayaran</h2>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kamar ({nights} Malam)</span>
                                <span className="text-sm font-black text-gray-800">{formatRupiah(roomSubtotal)}</span>
                            </div>
                            {initialAddOnTotal > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fasilitas Awal</span>
                                    <span className="text-sm font-black text-gray-800">+{formatRupiah(initialAddOnTotal)}</span>
                                </div>
                            )}
                            {stayAddonsTotal > 0 && (
                                <div className="flex justify-between items-center text-blue-600">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Layanan Saat Menginap</span>
                                    <span className="text-sm font-black">+{formatRupiah(stayAddonsTotal)}</span>
                                </div>
                            )}
                            {rescheduledTotal > 0 && (
                                <div className="flex justify-between items-center text-orange-600">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Biaya Reschedule</span>
                                    <span className="text-sm font-black">+{formatRupiah(rescheduledTotal)}</span>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-dashed border-gray-100"></div>
                            
                            {transaction.discount_amount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100/50 animate-fade-in mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Potongan Promo</span>
                                    <span className="text-sm font-black">-{formatRupiah(transaction.discount_amount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 border-t border-dashed border-gray-100">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Total Seluruh Tagihan</span>
                                <span className="text-3xl font-black text-eling-green font-serif">{formatRupiah(transaction.total_price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button onClick={() => window.print()} className="w-full bg-white border border-gray-200 text-gray-800 font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-sm hover:bg-gray-50 flex items-center justify-center gap-3 transition-all cursor-pointer">
                            <Printer size={16} /> Cetak Bukti Invoice
                        </button>
                        <button onClick={() => navigate('/profile')} className="w-full bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 cursor-pointer">
                            <ArrowLeft size={14} /> Kembali ke Daftar Transaksi
                        </button>
                    </div>

                </div>
            </div>

            <style>{`
                @media print {
                    .pt-32 { padding-top: 1rem !important; }
                    .mb-12, .print\\:hidden { display: none !important; }
                    .grid { display: block !important; }
                    .lg\\:col-span-8 { width: 100% !important; }
                    .bg-white { box-shadow: none !important; border: 1px solid #f1f1f1 !important; margin-bottom: 2rem; }
                    .rounded-\\[2rem\\] { border-radius: 1rem !important; }
                }
            `}</style>
        </main>
    );
}

// Added missing icon for sidebar breakdown
function Calculator({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}
