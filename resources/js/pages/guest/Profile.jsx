import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { Search, MapPin, Calendar, Clock, ArrowRight, User, Mail, ShieldCheck, Ticket, QrCode, X, Download, BedDouble, AlertCircle, Camera, Phone, CreditCard, Sparkles, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { formatRupiah } from '../../utils/data';
import { QRCodeCanvas } from 'qrcode.react';

export default function Profile() {
    const { user, logout, updateProfile, updatePassword, updatePhoto } = useAuth();
    const navigate = useNavigate();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rescheduleData, setRescheduleData] = useState(null); 
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [publicSettings, setPublicSettings] = useState({ max_reschedule_days: 7 });

    useEffect(() => {
        fetchBookings();
        fetchPublicSettings();
    }, []);

    const fetchPublicSettings = async () => {
        try {
            const res = await axios.get('/api/settings/public');
            setPublicSettings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/transactions?mine=1');
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(editForm);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Profil Anda telah diperbarui.',
                icon: 'success',
                confirmButtonColor: '#2E7D32',
                customClass: { popup: 'rounded-[2rem]' }
            });
            setIsEditingProfile(false);
        } catch (error) {
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Gagal memperbarui profil.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }
    };

    const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await updatePassword(passwordForm);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Kata sandi telah diperbarui.',
                icon: 'success',
                confirmButtonColor: '#2E7D32',
                customClass: { popup: 'rounded-[2rem]' }
            });
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Gagal memperbarui kata sandi.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.newDate) return;
        try {
            await axios.post(`/api/transactions/${rescheduleData.id}/reschedule`, {
                new_check_in_date: rescheduleData.newDate,
                reason: rescheduleData.reason
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
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-eling-green mb-4 overflow-hidden border-4 border-white shadow-lg">
                                    {user?.profile_photo_path ? (
                                        <img src={`/storage/${user.profile_photo_path}`} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <User size={40} />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 text-center">{user?.name || 'Guest User'}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>

                            <button 
                                onClick={() => {
                                    setEditForm({ name: user?.name, email: user?.email });
                                    setIsEditingProfile(true);
                                }}
                                className="w-full py-3 mb-3 text-eling-green font-bold rounded-xl bg-green-50 hover:bg-green-100 transition flex items-center justify-center gap-2"
                            >
                                <User size={16} /> Edit Profil
                            </button>

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
                                                            onClick={() => {
                                                                const checkIn = new Date(booking.check_in_date);
                                                                checkIn.setHours(0,0,0,0);
                                                                const now = new Date();
                                                                now.setHours(0,0,0,0);
                                                                const diff = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
                                                                const maxDays = Number(publicSettings.max_reschedule_days || 7);
                                                                
                                                                if (diff < maxDays) {
                                                                    Swal.fire({
                                                                        title: 'Maaf',
                                                                        text: `Reschedule sudah tidak dapat dilakukan. Batas waktu maksimal adalah ${maxDays} hari sebelum check-in.`,
                                                                        icon: 'error',
                                                                        confirmButtonColor: '#C62828',
                                                                        customClass: { popup: 'rounded-[2rem]' }
                                                                    });
                                                                    return;
                                                                }
                                                                setRescheduleData({ id: booking.id, oldDate: booking.check_in_date });
                                                            }}
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
                                <div className="space-y-1">
                                    <p className="text-sm text-blue-800 leading-tight font-bold">
                                        Kebijakan Reschedule
                                    </p>
                                    <p className="text-[11px] text-blue-800/70 leading-relaxed">
                                        Reschedule hanya dapat dilakukan maksimal {publicSettings.max_reschedule_days || 7} hari sebelum kedatangan. Permintaan Anda akan ditinjau oleh admin.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Order ID</label>
                                <p className="font-bold text-gray-900">{rescheduleData.id}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Pilih Tanggal Baru</label>
                                <input 
                                    type="date" 
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-eling-green outline-none transition-all mb-4"
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Alasan / Catatan</label>
                                <textarea 
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-eling-green outline-none transition-all resize-none font-bold text-sm"
                                    rows="3"
                                    placeholder="Kenapa Anda ingin menjadwalkan ulang?"
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                                ></textarea>
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
                                    <div className={`w-full ${selectedTicket.booking_type === 'EVENT' ? 'bg-eling-red' : 'bg-eling-green'} p-6 text-center relative`}>
                                        <div className="absolute -bottom-3 left-0 right-0 flex justify-center">
                                            <div className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-eling-green uppercase border border-eling-green/20 shadow-sm">PASS #{idx + 1}</div>
                                        </div>
                                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-1">Eling Bening Official</h4>
                                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">{selectedTicket.check_in_date ? new Date(selectedTicket.check_in_date).toLocaleDateString() : 'Active Pass'}</p>
                                    </div>
                                    <div className="p-10 flex flex-col items-center w-full text-center">
                                        <div className="p-8 bg-white rounded-[3rem] mb-8 border-4 border-gray-50 shadow-inner flex items-center justify-center relative group">
                                            <div className="absolute inset-0 bg-eling-green/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.8rem]"></div>
                                            <QRCodeCanvas 
                                                value={tick.ticket_id} 
                                                size={200}
                                                level="H"
                                                includeMargin={false}
                                                imageSettings={{
                                                    src: "/images/logo.png",
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 45,
                                                    width: 45,
                                                    excavate: true,
                                                }}
                                                className="relative z-10"
                                            />
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <div className="bg-gray-50 py-4 px-6 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visitor Name</p>
                                                <h5 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{tick.guest_name}</h5>
                                            </div>
                                            <div className="pt-4 border-t-4 border-dotted border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry UID</p>
                                                    <div className="w-2 h-2 rounded-full bg-eling-green animate-pulse"></div>
                                                </div>
                                                <p className="font-mono text-[11px] text-gray-900 font-black uppercase tracking-tighter bg-gray-50 p-3 rounded-xl border border-gray-100">{tick.ticket_id}</p>
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
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedOrderDetail.booking_type === 'RESORT' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-eling-green'}`}>
                                    {selectedOrderDetail.booking_type === 'RESORT' ? <BedDouble size={24} /> : <Ticket size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-serif text-gray-900 tracking-tight leading-none">Detail Pesanan</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{selectedOrderDetail.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrderDetail(null)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-eling-red transition"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Status Banner */}
                            <div className={`p-5 rounded-2xl flex items-center justify-between border-2 ${
                                selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid' 
                                ? 'bg-green-50/50 border-green-100 text-green-700' 
                                : 'bg-amber-50/50 border-amber-100 text-amber-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} className="shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 opacity-60">Status Pembayaran</p>
                                        <p className="font-black uppercase tracking-widest text-sm leading-none">{selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid' ? 'LUNAS (PAID)' : 'MENUNGGU'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 opacity-60">Waktu Transaksi</p>
                                    <p className="font-bold text-xs">{new Date(selectedOrderDetail.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Booker Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Pemesan</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><User size={14} /></div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Nama Lengkap</p>
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{selectedOrderDetail.booker_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14} /></div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Alamat Email</p>
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{selectedOrderDetail.booker_email || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={14} /></div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Nomor WhatsApp</p>
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{selectedOrderDetail.booker_phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Context (Dates/Times) */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informasi Kunjungan</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Calendar size={14} /></div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                                                    {selectedOrderDetail.booking_type === 'RESORT' ? 'Check-in (Rencana)' : 'Tanggal Kunjungan'}
                                                </p>
                                                <p className="font-black text-gray-900 text-sm tracking-tight leading-tight">
                                                    {new Date(selectedOrderDetail.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    {selectedOrderDetail.check_out_date && (
                                                        <> - {new Date(selectedOrderDetail.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrderDetail.booking_type === 'RESORT' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Clock size={14} /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Perkiraan Tiba</p>
                                                    <p className="font-black text-gray-900 text-sm tracking-tight">
                                                        {selectedOrderDetail.arrival_time && selectedOrderDetail.arrival_time !== 'Pilih waktu kedatangan' ? selectedOrderDetail.arrival_time : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><CreditCard size={14} /></div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Metode Pembayaran</p>
                                                <p className="font-black text-gray-900 text-sm tracking-tight uppercase">{selectedOrderDetail.payment_method || 'Midtrans VA'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Item Dalam Pesanan</h4>
                                <div className="space-y-3">
                                    {selectedOrderDetail.items?.map((item, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => {
                                                if (selectedOrderDetail.booking_type === 'RESORT' && item.item?.id) {
                                                    navigate(`/rooms/${item.item.id}`);
                                                }
                                            }}
                                            className={`flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 group transition-all ${selectedOrderDetail.booking_type === 'RESORT' ? 'cursor-pointer hover:border-eling-green/30 hover:bg-white' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-xl bg-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center shrink-0 border border-gray-100">
                                                    {selectedOrderDetail.booking_type === 'RESORT' && item.item?.gallery?.[0] ? (
                                                        <img src={item.item.gallery[0]} className="w-full h-full object-cover" alt={item.item.name} />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center ${selectedOrderDetail.booking_type === 'RESORT' ? 'text-blue-500 bg-blue-50' : 'text-eling-green bg-green-50'}`}>
                                                            {selectedOrderDetail.booking_type === 'RESORT' ? <BedDouble size={20} /> : <Ticket size={20} />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-tight tracking-tight uppercase text-sm">{item.item?.name || 'Tiket Wisata'}</p>
                                                    
                                                    {selectedOrderDetail.booking_type === 'RESORT' && item.item && (
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 opacity-80">
                                                            {item.item.bed_type && (
                                                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                    <i className="fas fa-bed text-[8px] text-eling-green"></i> {item.item.bed_type}
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                <i className="fas fa-user-friends text-[8px] text-eling-green"></i> {item.item.capacity || 2} Tamu
                                                            </span>
                                                            {item.item.room_size && (
                                                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                    <i className="fas fa-expand text-[8px] text-eling-green"></i> {item.item.room_size} m&sup2;
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">{item.quantity} Unit x {formatRupiah(item.price)}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-gray-900 font-serif tracking-tight">{formatRupiah(item.subtotal)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info (Check-in time, Facilities, Requests) */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                                <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Sparkles size={12} className="text-eling-green" />
                                    Informasi Tambahan & Permintaan
                                </h4>
                                <div className="space-y-4">
                                    {/* Facilities */}
                                    {selectedOrderDetail.additional_facilities && selectedOrderDetail.additional_facilities.length > 0 && (
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mb-2">Fasilitas Tambahan:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOrderDetail.additional_facilities.map((f, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 flex items-center gap-2">
                                                        <Check size={10} className="text-eling-green" />
                                                        {typeof f === 'object' ? f.name : f}
                                                        {typeof f === 'object' && f.price > 0 && (
                                                            <span className="text-eling-green opacity-70">({formatRupiah(f.price)})</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Requests */}
                                    {selectedOrderDetail.special_requests && (
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mb-1 font-serif">Permintaan Khusus Tamu:</p>
                                            <p className="text-xs text-slate-600 font-bold leading-relaxed italic bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                                                "{selectedOrderDetail.special_requests}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Financial Summary Breakdown */}
                            <div className="pt-8 border-t border-dashed border-gray-200 space-y-4">
                                <div className="space-y-3">
                                    {/* 1. Harga Kamar / Tiket */}
                                    <div className="flex justify-between text-xs font-bold text-gray-400">
                                        <span className="uppercase tracking-widest">Harga Kamar / Tiket</span>
                                        <span className="text-gray-900">{formatRupiah(selectedOrderDetail.items?.reduce((acc, curr) => acc + Number(curr.subtotal), 0) || 0)}</span>
                                    </div>

                                    {/* 2. Fasilitas Tambahan (Jika ada) */}
                                    {selectedOrderDetail.additional_facilities && selectedOrderDetail.additional_facilities.length > 0 && (
                                        <div className="flex justify-between text-xs font-bold text-gray-400">
                                            <span className="uppercase tracking-widest">Biaya Fasilitas Tambahan</span>
                                            <span className="text-gray-900">{formatRupiah(selectedOrderDetail.additional_facilities.reduce((acc, curr) => acc + (typeof curr === 'object' ? Number(curr.price) : 0), 0))}</span>
                                        </div>
                                    )}

                                    {/* 3. Pajak (Dihitung dari Dasar) */}
                                    <div className="flex justify-between text-xs font-bold text-gray-400">
                                        <span className="uppercase tracking-widest">Pajak (10%)</span>
                                        <span className="text-gray-900">{formatRupiah(
                                            ( (selectedOrderDetail.items?.reduce((acc, curr) => acc + Number(curr.subtotal), 0) || 0) + 
                                              (selectedOrderDetail.additional_facilities?.reduce((acc, curr) => acc + (typeof curr === 'object' ? Number(curr.price) : 0), 0) || 0) 
                                            ) * 0.1
                                        )}</span>
                                    </div>

                                    {/* 4. Potongan Promo */}
                                    {selectedOrderDetail.discount_amount > 0 && (
                                        <div className="flex justify-between text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100/30">
                                            <span className="uppercase tracking-widest">Potongan Promo</span>
                                            <span className="font-black text-sm">- {formatRupiah(selectedOrderDetail.discount_amount)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center bg-gray-900 p-6 rounded-[2rem] text-white shadow-xl shadow-gray-900/10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Dibayar</p>
                                        <h5 className="text-sm font-bold text-white/60">Lunas & Dikonfirmasi</h5>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black font-serif tracking-tight">{formatRupiah(selectedOrderDetail.total_price)}</span>
                                    </div>
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

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditingProfile(false)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-gray-900">Pengaturan Akun</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Update data diri & keamanan</p>
                            </div>
                            <button onClick={() => setIsEditingProfile(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-eling-red transition"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                            {/* Photo Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Camera size={18} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Foto Profil</h4>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                    <div className="w-28 h-28 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-white shrink-0">
                                        {user?.profile_photo_path ? (
                                            <img src={`/storage/${user.profile_photo_path}`} className="w-full h-full object-cover" alt="Profile" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3 flex-1 text-center md:text-left">
                                        <h5 className="font-bold text-gray-900">Ubah Foto Profil</h5>
                                        <p className="text-xs text-gray-500 max-w-xs mx-auto md:mx-0">Pilih foto terbaik Anda. Ukuran maksimal 2MB dengan format JPG atau PNG.</p>
                                        <label className="inline-flex py-2 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition cursor-pointer shadow-sm">
                                            Pilih Berkas
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                
                                                const formData = new FormData();
                                                formData.append('photo', file);
                                                
                                                try {
                                                    await updatePhoto(formData);
                                                    toast.success('Foto profil berhasil diperbarui');
                                                } catch (error) {
                                                    toast.error('Gagal memperbarui foto');
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Profile Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-green-50 text-eling-green rounded-lg flex items-center justify-center">
                                        <User size={18} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Informasi Dasar</h4>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                value={editForm.name} 
                                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-eling-green/20 outline-none transition-all font-bold text-sm"
                                                placeholder="Nama Anda"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
                                            <input 
                                                type="email" 
                                                value={editForm.email} 
                                                onChange={e => setEditForm({...editForm, email: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-eling-green/20 outline-none transition-all font-bold text-sm"
                                                placeholder="email@anda.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-eling-green text-white font-black py-4 rounded-2xl shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all uppercase tracking-widest text-xs mt-2">
                                        Simpan Perubahan
                                    </button>
                                </form>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Password Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-red-50 text-eling-red rounded-lg flex items-center justify-center">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Keamanan & Sandi</h4>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                                        <input 
                                            type="password" 
                                            value={passwordForm.current_password}
                                            onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-eling-red/10 outline-none transition-all font-bold text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={passwordForm.password}
                                                onChange={e => setPasswordForm({...passwordForm, password: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-eling-red/10 outline-none transition-all font-bold text-sm"
                                                placeholder="Minimal 8 karakter"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Sandi</label>
                                            <input 
                                                type="password" 
                                                value={passwordForm.password_confirmation}
                                                onChange={e => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-eling-red/10 outline-none transition-all font-bold text-sm"
                                                placeholder="Ulangi sandi baru"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-eling-red text-white font-black py-4 rounded-2xl shadow-lg shadow-red-900/10 hover:bg-red-800 transition-all uppercase tracking-widest text-xs mt-2">
                                        Ganti Kata Sandi
                                    </button>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
