import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { Search, MapPin, Calendar, Clock, ArrowRight, User, Mail, ShieldCheck, Ticket, QrCode, X, Download, BedDouble, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { formatRupiah } from '../../utils/data';
import { QRCodeCanvas } from 'qrcode.react';

export default function Profile() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rescheduleData, setRescheduleData] = useState(null); 
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/transactions');
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda akan keluar dari sesi ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            confirmButtonText: 'Ya, Logout',
            cancelButtonClass: 'rounded-xl',
            confirmButtonClass: 'rounded-xl',
            customClass: { popup: 'rounded-[2rem] font-serif' }
        });

        if (result.isConfirmed) {
            await logout();
            navigate('/');
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.newDate) return;
        try {
            await axios.post(`/api/transactions/${rescheduleData.id}/reschedule`, {
                new_check_in_date: rescheduleData.newDate
            });
            Swal.fire({
                title: 'Berhasil!',
                text: 'Permintaan reschedule telah diajukan ke admin.',
                icon: 'success',
                confirmButtonColor: '#2E7D32',
                customClass: { popup: 'rounded-[2rem]' }
            });
            setRescheduleData(null);
            fetchBookings();
        } catch (error) {
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Gagal merubah tanggal.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }
    };

    const filtered = bookings.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.items?.some(item => item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in bg-gray-50 pb-20 pt-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">Profil Saya</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-eling-green mb-4">
                                    <User size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 text-center">{user?.name || 'Guest User'}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>

                            <button onClick={handleLogout} className="w-full py-3 text-eling-red font-bold rounded-xl bg-red-50 hover:bg-red-100 transition">
                                Keluar Akun
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Riwayat & E-Tiket Saya</h2>
                                    <p className="text-gray-500 text-sm">Kelola tiket wisata dan reservasi resort Anda.</p>
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari ID / Item..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eling-green/50 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {filtered.map(booking => {
                                    const isResort = booking.booking_type === 'RESORT';
                                    const firstItem = booking.items?.[0]?.item || { name: 'Pemesanan Eling Bening' };
                                    
                                    return (
                                        <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-green-200 transition">
                                            <div className="flex-1 w-full flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isResort ? 'bg-green-50 text-eling-green' : 'bg-blue-50 text-blue-500'}`}>
                                                    {isResort ? <BedDouble size={24} /> : <Ticket size={24} />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{booking.id}</span>
                                                    <h3 className="text-xl font-bold text-gray-900 my-1">
                                                        {booking.items?.length > 1 ? `${firstItem.name} & ${booking.items.length - 1} lainnya` : firstItem.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                                                        <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.check_in_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                        {isResort && booking.check_out_date && (
                                                            <div className="text-xs italic bg-gray-50 px-2 py-0.5 rounded text-gray-400">s.d {new Date(booking.check_out_date).toLocaleDateString('id-ID')}</div>
                                                        )}
                                                        <div className="flex items-center gap-1"><User size={14} /> Atas Nama: <strong className="text-gray-700 font-bold ml-1">{booking.booker_name}</strong></div>
                                                        {booking.promo && (
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-eling-green/10 text-eling-green rounded-full text-[11px] font-bold border border-eling-green/20">
                                                                <Ticket size={12} /> Promo: {booking.promo.promo_code} (-{formatRupiah(booking.discount_amount)})
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                                <div className="text-xl font-bold text-gray-900">{formatRupiah(booking.total_price)}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${booking.status === 'success' || booking.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {booking.status}
                                                    </span>
                                                    <button 
                                                        onClick={() => setSelectedOrderDetail(booking)}
                                                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                    {isResort && (
                                                        <button 
                                                            onClick={() => setRescheduleData({ id: booking.id, oldDate: booking.check_in_date })}
                                                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                        >
                                                            <Clock size={10} className="inline mr-1" /> Reschedule
                                                        </button>
                                                    )}
                                                </div>
                                                {!isResort && booking.status === 'success' && (
                                                    <button onClick={() => setSelectedTicket(booking)} className="text-sm font-bold text-eling-green hover:underline flex items-center gap-2">
                                                        <QrCode size={16} /> Buka E-Tiket
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reschedule Modal */}
            {rescheduleData && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-serif">Reschedule Room</h3>
                            <button onClick={() => setRescheduleData(null)} className="text-gray-400 hover:text-gray-900"><X /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                                <AlertCircle className="text-blue-500 shrink-0" size={20} />
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Reschedule hanya dapat dilakukan ke tanggal setelah hari ini. Permintaan Anda akan ditinjau oleh tim kami.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Order ID</label>
                                <p className="font-bold text-gray-900">{rescheduleData.id}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Pilih Tanggal Baru</label>
                                <input 
                                    type="date" 
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-eling-green outline-none transition-all"
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                />
                            </div>
                            <button 
                                onClick={handleReschedule} 
                                className="w-full bg-eling-green text-white font-bold py-4 rounded-xl hover:bg-green-800 shadow-lg shadow-green-900/20 transition-all font-serif"
                            >
                                Ajukan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedTicket(null)}>
                    <div className="w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 px-4">
                            <h3 className="text-white text-3xl font-black font-serif uppercase tracking-tight">Access Passes</h3>
                            <button onClick={() => setSelectedTicket(null)} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"><X size={24} /></button>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-10 px-4 snap-x no-scrollbar">
                            {(selectedTicket.tickets?.length > 0 ? selectedTicket.tickets : [{ ticket_id: selectedTicket.id, guest_name: selectedTicket.booker_name }]).map((tick, idx) => (
                                <div key={tick.id || idx} className="snap-center shrink-0 w-[320px] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center">
                                    <div className="w-full bg-eling-green p-6 text-center relative">
                                        <div className="absolute -bottom-3 left-0 right-0 flex justify-center">
                                            <div className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-eling-green uppercase border border-eling-green/20 shadow-sm">PASS #{idx + 1}</div>
                                        </div>
                                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-1">Eling Bening Official</h4>
                                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">{selectedTicket.check_in_date ? new Date(selectedTicket.check_in_date).toLocaleDateString() : 'Active Pass'}</p>
                                    </div>
                                    <div className="p-10 flex flex-col items-center w-full text-center">
                                        <div className="p-6 bg-gray-50 rounded-[2.5rem] mb-8 border border-gray-100">
                                            <QRCodeCanvas 
                                                value={tick.ticket_id} 
                                                size={180}
                                                level="H"
                                                includeMargin={false}
                                                className="mix-blend-multiply"
                                            />
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visitor Name</p>
                                                <h5 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{tick.guest_name}</h5>
                                            </div>
                                            <div className="pt-4 border-t border-dashed border-gray-200">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 shadow-sm inline-block px-2 bg-gray-50 rounded">System UID</p>
                                                <p className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{tick.ticket_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                        <button className="flex-1 py-3 bg-white text-eling-green border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-eling-green hover:text-white transition-all shadow-sm">
                                            <Download size={14}/> Save Media
                                        </button>
                                        {tick.is_used && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                <div className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase text-xs rotate-[-15deg] border-4 border-white shadow-2xl">REDEEMED</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                            {(selectedTicket.tickets?.length || 1) > 1 && (
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Swipe for more ({selectedTicket.tickets?.length} tickets)</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Order Detail Modal */}
            {selectedOrderDetail && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedOrderDetail(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-gray-900">Detail Pesanan</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedOrderDetail.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrderDetail(null)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-eling-red transition"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-2xl flex items-center justify-between ${selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} />
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Status Transaksi</span>
                                </div>
                                <span className="font-black uppercase tracking-tight italic">{selectedOrderDetail.status}</span>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Item Terdaftar</h4>
                                {selectedOrderDetail.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-eling-green shadow-sm">
                                                {selectedOrderDetail.booking_type === 'RESORT' ? <BedDouble size={20} /> : <Ticket size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{item.item?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{item.quantity} Unit x {formatRupiah(item.price)}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-gray-900">{formatRupiah(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pemesan</p>
                                    <p className="font-bold text-gray-900">{selectedOrderDetail.booker_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tanggal Kunjungan</p>
                                    <p className="font-bold text-gray-900">{new Date(selectedOrderDetail.check_in_date).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
                                    <p className="font-bold text-gray-900 uppercase">{selectedOrderDetail.payment_method || 'Midtrans VA'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Waktu Transaksi</p>
                                    <p className="font-bold text-gray-900">{new Date(selectedOrderDetail.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Summary Section */}
                            <div className="pt-8 border-t border-dashed border-gray-200 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal Qty ({selectedOrderDetail.total_qty})</span>
                                    <span>{formatRupiah(selectedOrderDetail.total_price + selectedOrderDetail.discount_amount)}</span>
                                </div>
                                {selectedOrderDetail.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-eling-red font-bold">
                                        <span>Potongan Promo</span>
                                        <span>-{formatRupiah(selectedOrderDetail.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <span className="text-xl font-black font-serif text-gray-900">Total Pembayaran</span>
                                    <span className="text-xl font-black font-serif text-eling-green">{formatRupiah(selectedOrderDetail.total_price)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedOrderDetail.booking_type !== 'RESORT' && (selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid') && (
                            <div className="p-8 bg-gray-50 border-t border-gray-100">
                                <button 
                                    onClick={() => {
                                        setSelectedOrderDetail(null);
                                        setSelectedTicket(selectedOrderDetail);
                                    }}
                                    className="w-full bg-eling-green text-white font-black py-4 rounded-2xl shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 hover:bg-green-800 transition-all uppercase tracking-widest text-xs"
                                >
                                    <QrCode size={18} /> Buka Tiket Masuk
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
