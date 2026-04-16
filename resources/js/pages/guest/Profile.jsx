import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { Search, MapPin, Calendar, Clock, ArrowRight, User, Mail, ShieldCheck, Ticket, QrCode, X, Download, BedDouble, AlertCircle, Camera, Phone, CreditCard, Sparkles, Check, Plus, Minus, Star, LogOut, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { formatRupiah } from '../../utils/data';
import { QRCodeCanvas } from 'qrcode.react';
import CountdownTimer from '../../components/CountdownTimer';

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
    const [isOrderingAddon, setIsOrderingAddon] = useState(false);
    const [addonFacilities, setAddonFacilities] = useState([]);
    const [addonQuantities, setAddonQuantities] = useState({});
    const [isSubmittingAddon, setIsSubmittingAddon] = useState(false);
    const [selectedAddonPayment, setSelectedAddonPayment] = useState(null);
    const [publicSettings, setPublicSettings] = useState({ max_reschedule_days: 7 });
    const [reschedules, setReschedules] = useState([]);
    const [selectedReschedulePayment, setSelectedReschedulePayment] = useState(null);
    const [isPayingReschedule, setIsPayingReschedule] = useState(false);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'addons'
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', media: [] });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        const formData = new FormData();
        formData.append('transaction_id', selectedReview.id);
        formData.append('rating', reviewForm.rating);
        formData.append('comment', reviewForm.comment);
        Array.from(reviewForm.media).forEach((file) => {
            formData.append('media[]', file);
        });

        try {
            await axios.post('/api/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Terima kasih atas ulasan Anda!');
            setSelectedReview(null);
            setReviewForm({ rating: 5, comment: '', media: [] });
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengirimkan ulasan.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchReschedules();
        fetchPublicSettings();
    }, []);

    const fetchReschedules = async () => {
        try {
            const res = await axios.get('/api/reschedules');
            setReschedules(res.data);
        } catch (error) {
            console.error("Failed to fetch reschedules", error);
        }
    };

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
            const response = await axios.get('/api/transactions?mine=1&include_addons=1');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda akan keluar dari sesi ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            confirmButtonClass: 'rounded-xl',
            cancelButtonClass: 'rounded-xl',
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

    const handlePayReschedule = async () => {
        if (!selectedReschedulePayment) return;
        setIsPayingReschedule(true);
        try {
            const response = await axios.post(`/api/reschedules/${selectedReschedulePayment.id}/pay`);
            
            if (response.data.snap_token) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: function() {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Jadwal Anda telah resmi diperbarui.',
                            icon: 'success',
                            confirmButtonColor: '#2E7D32',
                            customClass: { popup: 'rounded-[2rem]' }
                        });
                        setSelectedReschedulePayment(null);
                        fetchBookings();
                        fetchReschedules();
                        setIsPayingReschedule(false);
                    },
                    onPending: function() {
                        toast.info('Menunggu pembayaran diselesaikan.');
                        setIsPayingReschedule(false);
                    },
                    onError: function() {
                        toast.error('Pembayaran gagal.');
                        setIsPayingReschedule(false);
                    },
                    onClose: function() {
                        toast.error('Pembayaran dibatalkan.');
                        setIsPayingReschedule(false);
                    }
                });
            } else {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Jadwal Anda telah resmi diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    customClass: { popup: 'rounded-[2rem]' }
                });
                setSelectedReschedulePayment(null);
                fetchBookings();
                fetchReschedules();
                setIsPayingReschedule(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal memproses pembayaran.');
            setIsPayingReschedule(false);
        }
    };

    const handleCancelReschedule = async () => {
        if (!selectedReschedulePayment) return;

        const result = await Swal.fire({
            title: 'Batalkan Reschedule?',
            text: "Kamar yang sedang ditahan untuk Anda akan dilepas kembali untuk umum.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Kembali',
            customClass: { popup: 'rounded-[2rem]' }
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/api/reschedules/${selectedReschedulePayment.id}/cancel`);
                toast.success('Reschedule dibatalkan. Stok telah dilepas.');
                setSelectedReschedulePayment(null);
                fetchReschedules();
                fetchBookings();
            } catch (err) {
                toast.error('Gagal membatalkan reschedule.');
            }
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.newDate) return;
        try {
            await axios.post(`/api/transactions/${rescheduleData.id}/reschedule`, {
                new_check_in_date: rescheduleData.newDate,
                reason: rescheduleData.reason
            });
            toast.success('Permintaan reschedule diajukan. Tunggu konfirmasi admin.');
            fetchBookings();
            fetchReschedules();
            setRescheduleData(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengajukan reschedule.');
        }
    };

    const fetchAddonFacilities = async () => {
        try {
            const res = await axios.get('/api/addon-facilities');
            setAddonFacilities(res.data);
            const initialQuantities = {};
            res.data.forEach(f => initialQuantities[f.id] = 0);
            setAddonQuantities(initialQuantities);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOrderAddon = async () => {
        const orderItems = Object.entries(addonQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ item_id: parseInt(id), quantity: qty }));

        if (orderItems.length === 0) {
            toast.error('Pilih minimal 1 fasilitas.');
            return;
        }

        // Calculate total for confirmation
        const totalAddon = orderItems.reduce((sum, i) => {
            const facility = addonFacilities.find(f => f.id === i.item_id);
            return sum + (Number(facility?.price) || 0) * i.quantity;
        }, 0);

        const result = await Swal.fire({
            title: 'Konfirmasi Pesanan Tambahan',
            html: `Total tagihan: <strong>${formatRupiah(totalAddon)}</strong><br/><span style="font-size:12px;color:#666">Tagihan akan ditambahkan ke akun Anda dan dapat dibayar di tab Fasilitas Tambahan.</span>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Pesan Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#2E7D32',
            customClass: { popup: 'rounded-[2rem]' }
        });
        if (!result.isConfirmed) return;

        setIsSubmittingAddon(true);
        try {
            await axios.post(`/api/transactions/${selectedOrderDetail.id}/addons`, {
                items: orderItems,
                payment_method: 'Midtrans'
            });
            
            toast.success('Pesanan fasilitas telah dicatat. Silakan cek tab "Fasilitas Tambahan" untuk melakukan pembayaran.');
            setIsOrderingAddon(false);
            
            // Refresh data
            const res = await axios.get(`/api/transactions/${selectedOrderDetail.id}`);
            setSelectedOrderDetail(res.data);
            fetchBookings();
            
            // Switch to addons tab to show the pending bill
            setActiveTab('addons');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan.');
        } finally {
            setIsSubmittingAddon(false);
        }
    };

    // PAY ADDON VIA MIDTRANS
    const handlePayAddon = async (addon) => {
        setIsSubmittingAddon(true);
        try {
            // Get fresh token if needed
            const response = await axios.post(`/api/transactions/${addon.id}/pay-token`);
            const snapToken = response.data.snap_token;

            if (snapToken) {
                window.snap.pay(snapToken, {
                    onSuccess: function() {
                        toast.success('Pembayaran addon berhasil!');
                        setSelectedAddonPayment(null);
                        if (selectedOrderDetail) {
                            axios.get(`/api/transactions/${selectedOrderDetail.id}`).then(res => {
                                setSelectedOrderDetail(res.data);
                            });
                        }
                        fetchBookings();
                    },
                    onPending: function() {
                        toast.info('Menunggu pembayaran addon.');
                    },
                    onError: function() {
                        toast.error('Pembayaran addon gagal.');
                    },
                    onClose: function() {
                        toast.warning('Anda menutup pembayaran.');
                    }
                });
            } else {
                toast.error('Gagal mendapatkan token pembayaran.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memproses pembayaran.');
        } finally {
            setIsSubmittingAddon(false);
        }
    };

    // Helper: calculate grand total including all paid addons
    const getGrandTotal = (booking) => {
        const basePrice = Number(booking.total_price || 0);
        const addonsPrice = (booking.addons
            ?.filter(a => ['paid', 'success'].includes(a.status))
            .reduce((acc, curr) => acc + Number(curr.total_price), 0) || 0);
        const reschedulesPrice = (reschedules
            ?.filter(r => r.transaction_id === booking.id && r.status === 'completed')
            .reduce((acc, curr) => acc + Number(curr.final_charge), 0) || 0);
        
        return basePrice + addonsPrice + reschedulesPrice;
    };

    // Open detail modal and fetch fresh data from the server
    const handleOpenDetail = async (booking) => {
        setSelectedOrderDetail(booking); // show immediately with cached data
        try {
            const res = await axios.get(`/api/transactions/${booking.id}`);
            setSelectedOrderDetail(res.data); // overwrite with fresh data
        } catch (err) {
            console.error('Failed to refresh booking detail', err);
        }
    };

    const filtered = bookings.filter(booking => {
        // Search filter
        const matchSearch = (
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.items?.some(item => item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (activeTab === 'tickets') {
            // Show main stays AND finished addons
            return matchSearch && (!booking.parent_id || ['success', 'paid'].includes(booking.status));
        } else {
            // Only show PENDING addons
            return matchSearch && (booking.parent_id && booking.status === 'pending');
        }
    });

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

                            {user?.role === 'admin' && (
                                <Link 
                                    to="/admin"
                                    className="w-full py-3 mb-3 text-eling-red font-black rounded-xl bg-eling-red/5 hover:bg-eling-red/10 transition flex items-center justify-center gap-2 border border-eling-red/10 uppercase tracking-widest text-[10px]"
                                >
                                    <ShieldCheck size={16} /> Panel Admin
                                </Link>
                            )}

                            <button 
                                onClick={() => {
                                    setEditForm({ name: user?.name, email: user?.email });
                                    setIsEditingProfile(true);
                                }}
                                className="w-full py-3 mb-3 text-eling-green font-bold rounded-xl bg-green-50 hover:bg-green-100 transition flex items-center justify-center gap-2"
                            >
                                <User size={16} /> Edit Profil
                            </button>

                            <button 
                                onClick={handleLogout} 
                                className="w-full py-4 text-eling-red font-bold rounded-xl bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} /> Keluar Akun
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                                        {activeTab === 'tickets' ? 'Riwayat & E-Tiket Saya' : 'Tagihan Fasilitas Tambahan'}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {activeTab === 'tickets' ? 'Kelola tiket wisata dan reservasi resort Anda.' : 'Selesaikan biaya tambahan layanan stay Anda.'}
                                    </p>
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

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                                <button
                                    onClick={() => setActiveTab('tickets')}
                                    className={`w-full sm:w-auto px-6 py-4 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'tickets' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <Ticket size={14} /> Tiket & Resort
                                </button>
                                <button
                                    onClick={() => setActiveTab('addons')}
                                    className={`w-full sm:w-auto px-6 py-4 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2 ${activeTab === 'addons' ? 'bg-eling-green text-white shadow-lg shadow-green-900/10' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <Package size={14} /> Fasilitas Tambahan
                                    {bookings.filter(b => b.parent_id && b.status === 'pending').length > 0 && (
                                        <span className="absolute -top-1 right-0 sm:-top-2 sm:-right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce-slow">
                                            {bookings.filter(b => b.parent_id && b.status === 'pending').length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {filtered.map(booking => {
                                    const isResort = booking.booking_type === 'RESORT';
                                    const firstItem = booking.items?.[0]?.item || { name: 'Pemesanan Eling Bening' };
                                    const grandTotal = getGrandTotal(booking);
                                    
                                    return (
                                        <div key={booking.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-eling-green/20 transition-all duration-500 overflow-hidden group">
                                            {/* Minimal Header */}
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{booking.id}</span>
                                                <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                                                    booking.status === 'success' || booking.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100')
                                                }`}>
                                                    {booking.status}
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex items-start gap-4 sm:gap-6 mb-8">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 ${booking.parent_id ? 'bg-purple-50 text-purple-600' : (isResort ? 'bg-green-50 text-eling-green' : 'bg-blue-50 text-blue-500')}`}>
                                                    {booking.parent_id ? <Sparkles size={24} /> : (isResort ? <BedDouble size={24} /> : <Ticket size={24} />)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-2 truncate">
                                                        {booking.items?.length > 1 ? `${firstItem.name} & ${booking.items.length - 1} lainnya` : firstItem.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-sm font-bold text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-300 shrink-0" />
                                                            <span>{new Date(booking.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                            {isResort && booking.check_out_date && <span className="font-normal text-gray-400">-{new Date(booking.check_out_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                                                        </div>
                                                        <div className="w-1 h-1 bg-gray-200 rounded-full hidden sm:block"></div>
                                                        <div className="flex items-center gap-2">
                                                            <User size={14} className="text-gray-300 shrink-0" />
                                                            <span className="truncate">{booking.booker_name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px bg-gray-50 mb-8"></div>

                                            {/* Footer Area */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Transaksi</span>
                                                    <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter leading-none block">{formatRupiah(grandTotal)}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                                                    {(() => {
                                                        const activeReschedule = reschedules.find(r => r.transaction_id === booking.id && r.status === 'approved_awaiting_payment');
                                                        if (activeReschedule) {
                                                            return (
                                                                <button onClick={() => setSelectedReschedulePayment(activeReschedule)} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-eling-green text-white font-black text-[10px] uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                                                                    <CreditCard size={14} /> Bayar
                                                                </button>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {booking.status === 'pending' && (
                                                        <button onClick={() => setSelectedAddonPayment(booking)} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-eling-green text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
                                                            <CreditCard size={14} /> Bayar
                                                        </button>
                                                    )}
                                                    
                                                    <button onClick={() => setSelectedOrderDetail(booking)} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white text-gray-700 hover:bg-gray-50 transition text-[10px] font-black uppercase tracking-widest border border-gray-100 flex items-center justify-center gap-2">
                                                        Detail
                                                    </button>

                                                    {(booking.status === 'success' || booking.status === 'paid') && (
                                                        <button onClick={() => setSelectedReview(booking)} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center justify-center gap-2">
                                                            <Star size={14} className="fill-amber-600" /> Ulasan
                                                        </button>
                                                    )}

                                                    {isResort && !reschedules.find(r => r.transaction_id === booking.id && r.status !== 'rejected') && booking.reschedule_count === 0 && (
                                                        <button onClick={() => setRescheduleData({ ...booking, id: booking.id, oldDate: booking.check_in_date })} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center justify-center gap-2">
                                                            <Clock size={14} /> Reschedule
                                                        </button>
                                                    )}

                                                    {!isResort && (booking.status === 'success' || booking.status === 'paid') && (
                                                        <button onClick={() => setSelectedTicket(booking)} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-eling-green text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
                                                            <QrCode size={14} /> Tiket
                                                        </button>
                                                    )}
                                                </div>
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
            {rescheduleData && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-up">
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
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Durasi Menginap (Original)</label>
                                <p className="font-black text-gray-900">
                                    {Math.round((new Date(rescheduleData.check_out_date) - new Date(rescheduleData.check_in_date)) / (1000 * 60 * 60 * 24))} Malam
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Pilih Tanggal Check-In Baru</label>
                                <input 
                                    type="date" 
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-eling-green outline-none transition-all mb-4 font-bold"
                                    min={
                                        new Date(new Date().getTime() + (publicSettings.min_reschedule_lead_days || 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                    }
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                />
                                {rescheduleData.newDate && (
                                    <div className="mt-2 text-[11px] font-black uppercase tracking-widest text-eling-green bg-green-50 p-3 rounded-xl border border-green-100 animate-fade-in">
                                        Check-Out Otomatis: {(() => {
                                            const d = new Date(rescheduleData.newDate);
                                            const nights = Math.round((new Date(rescheduleData.check_out_date) - new Date(rescheduleData.check_in_date)) / (1000 * 60 * 60 * 24));
                                            d.setDate(d.getDate() + nights);
                                            return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                                        })()}
                                    </div>
                                )}
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

                            {rescheduleData.reschedule_count > 0 && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                                    <p className="text-[10px] text-red-600 font-bold leading-tight">
                                        Peringatan: Pemesanan ini sudah pernah di-reschedule. Permintaan baru akan ditolak otomatis oleh sistem.
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={handleReschedule} 
                                disabled={rescheduleData.reschedule_count > 0}
                                className={`w-full text-white font-bold py-4 rounded-xl transition-all font-serif ${
                                    rescheduleData.reschedule_count > 0 
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                    : 'bg-eling-green hover:bg-green-800 shadow-lg shadow-green-900/20'
                                }`}
                            >
                                {rescheduleData.reschedule_count > 0 ? 'Quota Reschedule Habis' : 'Ajukan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Ticket Modal */}
            {selectedTicket && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedTicket(null)}>
                    <div className="w-full max-w-sm sm:max-w-md relative" onClick={e => e.stopPropagation()}>
                        <div className="relative flex justify-center items-center mb-6 px-2">
                            <h3 className="text-white text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-center">Access Passes</h3>
                            <button onClick={() => setSelectedTicket(null)} className="absolute right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"><X size={18} /></button>
                        </div>

                        <div className={`flex gap-4 sm:gap-6 overflow-x-auto pb-4 px-2 snap-x no-scrollbar ${(selectedTicket.tickets?.length || 1) <= 1 ? 'justify-center' : ''}`}>
                            {(selectedTicket.tickets?.length > 0 ? selectedTicket.tickets : [{ ticket_id: selectedTicket.id, guest_name: selectedTicket.booker_name }]).map((tick, idx) => (
                                <div key={tick.id || idx} className="snap-center shrink-0 w-[260px] sm:w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center relative isolation-auto">
                                    {/* Header Section */}
                                    <div className={`w-full ${selectedTicket.booking_type === 'EVENT' ? 'bg-eling-red' : 'bg-eling-green'} pb-6 pt-5 px-4 text-center relative`}>
                                        <div className="absolute -bottom-3 left-0 right-0 flex justify-center z-10">
                                            <div className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-eling-green uppercase border border-gray-100 shadow-sm">PASS #{idx + 1}</div>
                                        </div>
                                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[12px] mb-1">Eling Bening Official</h4>
                                        <p className="text-white/80 text-[9px] font-bold uppercase tracking-widest">{selectedTicket.check_in_date ? new Date(selectedTicket.check_in_date).toLocaleDateString() : 'Active Pass'}</p>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="px-6 py-8 flex flex-col items-center w-full text-center">
                                        <div className="p-4 bg-white rounded-3xl mb-6 shadow-[0_0_20px_rgba(0,0,0,0.04)] border border-gray-100/50 flex items-center justify-center relative">
                                            <QRCodeCanvas 
                                                value={tick.ticket_id} 
                                                size={180}
                                                level="H"
                                                includeMargin={false}
                                                imageSettings={{
                                                    src: "/images/logo.png",
                                                    x: undefined, y: undefined,
                                                    height: 40, width: 40,
                                                    excavate: true,
                                                }}
                                                className="relative z-10 mix-blend-multiply"
                                            />
                                        </div>
                                        <div className="space-y-3 w-full">
                                            <div className="bg-gray-50/50 py-3 px-4 rounded-xl border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Visitor Name</p>
                                                <h5 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight truncate">{tick.guest_name}</h5>
                                            </div>
                                            <div className="pt-3 border-t-2 border-dashed border-gray-200 relative">
                                                {/* Dashed line effect visually supported by border-dashed */}
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entry UID</p>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-eling-green animate-pulse"></div>
                                                </div>
                                                <p className="font-mono text-[10px] sm:text-[11px] text-gray-800 font-bold uppercase tracking-widest bg-gray-50 py-2.5 px-3 rounded-lg border border-gray-100">{tick.ticket_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="w-full px-6 pb-6 pt-2 bg-white flex gap-3">
                                        <button className="w-full py-3 bg-white text-eling-green shadow-sm border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-eling-green hover:text-white transition-all">
                                            <Download size={14}/> Save Media
                                        </button>
                                        {tick.is_used && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                                                <div className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase text-xs rotate-[-15deg] border-4 border-white shadow-2xl">REDEEMED</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Perforation Hole effect left/right */}
                                    <div className="absolute top-[75px] -left-3 w-6 h-6 bg-slate-900/40 rounded-full mix-blend-overlay"></div>
                                    <div className="absolute top-[75px] -right-3 w-6 h-6 bg-slate-900/40 rounded-full mix-blend-overlay"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-2">
                            {(selectedTicket.tickets?.length || 1) > 1 && (
                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm">Swipe for {selectedTicket.tickets?.length} passes</p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Review Modal */}
            {selectedReview && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedReview(null)}>
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-serif">Berikan Ulasan</h3>
                            <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-900"><X /></button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={40}
                                        className={`cursor-pointer transition-colors ${reviewForm.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    />
                                ))}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Ceritakan Pengalaman Anda</label>
                                <textarea
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-eling-green outline-none transition-all resize-none font-bold text-sm"
                                    rows="4"
                                    placeholder="Apa yang paling Anda sukai tentang kunjungan ini?"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Upload Foto/Video (Opsional)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        const newFiles = Array.from(e.target.files);
                                        setReviewForm({ ...reviewForm, media: [...reviewForm.media, ...newFiles] });
                                        // clear the input so user can add identically named files again if needed
                                        e.target.value = null;
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-eling-green hover:file:bg-green-100 transition-all font-bold"
                                />
                                {reviewForm.media && reviewForm.media.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {reviewForm.media.map((file, idx) => {
                                            const isVideo = file.type?.startsWith('video/');
                                            const objectUrl = URL.createObjectURL(file);
                                            return (
                                                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                    {isVideo ? (
                                                        <video src={objectUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={objectUrl} className="w-full h-full object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex justify-center items-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const newArr = [...reviewForm.media];
                                                                newArr.splice(idx, 1);
                                                                setReviewForm({...reviewForm, media: newArr});
                                                            }}
                                                            className="bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition text-white shadow-md">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full text-white font-bold py-4 rounded-xl transition-all font-serif bg-eling-green hover:bg-green-800 shadow-lg shadow-green-900/20 disabled:opacity-50"
                            >
                                {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {/* Order Detail Modal */}
            {selectedOrderDetail && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedOrderDetail(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedOrderDetail.booking_type === 'RESORT' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-eling-green'}`}>
                                    {selectedOrderDetail.booking_type === 'RESORT' ? <BedDouble size={20} className="sm:hidden" /> : <Ticket size={20} className="sm:hidden" />}
                                    {selectedOrderDetail.booking_type === 'RESORT' ? <BedDouble size={24} className="hidden sm:block" /> : <Ticket size={24} className="hidden sm:block" />}
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black font-serif text-gray-900 tracking-tight leading-none">Detail Pesanan</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 sm:mt-1.5">{selectedOrderDetail.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrderDetail(null)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-eling-red transition"><X size={18}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:y-8">
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
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informasi Reservasi</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tgl Terpilih</p>
                                            <p className="text-xs font-bold text-gray-900 mt-0.5">{new Date(selectedOrderDetail.check_in_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kapasitas</p>
                                            <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedOrderDetail.items[0]?.item?.capacity || '-'} Orang</p>
                                        </div>
                                        
                                        {/* ORDER ADDON BUTTON (BEFORE CHECKOUT) */}
                                        {selectedOrderDetail.booking_type === 'RESORT' && 
                                         selectedOrderDetail.stay_status !== 'checked_out' && 
                                         (selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid') && (
                                             <button 
                                                onClick={() => {
                                                    fetchAddonFacilities();
                                                    setIsOrderingAddon(true);
                                                }}
                                                className="col-span-2 py-4 bg-eling-green/10 text-eling-green text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-eling-green/20 hover:bg-eling-green hover:!text-white transition-all duration-300 flex items-center justify-center gap-3 group shadow-sm hover:shadow-lg hover:shadow-green-900/20 active:scale-95"
                                            >
                                                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Pesan Fasilitas Tambahan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Daftar Fasilitas & Item (Terbayar)</h4>
                                <div className="space-y-3">
                                    {[
                                        ...(selectedOrderDetail.items || []),
                                        ...((selectedOrderDetail.addons || [])
                                            .filter(a => a.status === 'paid' || a.status === 'success')
                                            .flatMap(a => a.items || []))
                                    ].map((item, i) => {
                                        const isFacility = item.item_type?.includes('Facility');
                                        const isResort = item.item_type?.includes('Resort');
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => {
                                                    if (isResort && item.item?.id) {
                                                        navigate(`/rooms/${item.item.id}`);
                                                    }
                                                }}
                                                className={`flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 group transition-all ${isResort ? 'cursor-pointer hover:border-eling-green/30 hover:bg-white' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-12 rounded-xl bg-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center shrink-0 border border-gray-100">
                                                        {isResort && item.item?.gallery?.[0] ? (
                                                            <img src={item.item.gallery[0]} className="w-full h-full object-cover" alt={item.item.name} />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center ${isResort ? 'text-blue-500 bg-blue-50' : (isFacility ? 'text-purple-500 bg-purple-50' : 'text-eling-green bg-green-50')}`}>
                                                                {isResort ? <BedDouble size={20} /> : (isFacility ? <Sparkles size={20} /> : <Ticket size={20} />)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-gray-900 leading-tight tracking-tight uppercase text-sm">{item.item?.name || 'Item Pesanan'}</p>
                                                            {isFacility && (
                                                                <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-purple-100">EXTRA</span>
                                                            )}
                                                        </div>
                                                        
                                                        {isResort && item.item && (
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 opacity-80">
                                                                {item.item.bed_type && (
                                                                    <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                        <i className="fas fa-bed text-[8px] text-eling-green"></i> {item.item.bed_type}
                                                                    </span>
                                                                )}
                                                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                    <i className="fas fa-user-friends text-[8px] text-eling-green"></i> {item.item.capacity || 2} Tamu
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">{item.quantity} Unit x {formatRupiah(item.price)}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-gray-900 font-serif tracking-tight">{formatRupiah(item.subtotal)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* EXTRA ORDERS (ADDONS) */}
                            {selectedOrderDetail.addons && selectedOrderDetail.addons.length > 0 && (
                                <div className="pt-4 border-t-2 border-dashed border-gray-200">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informasi Tagihan Tambahan (Extra Bill)</h4>
                                    <div className="space-y-4">
                                        {selectedOrderDetail.addons.map((addon) => (
                                            <div key={addon.id} className="p-6 bg-white border border-gray-100 rounded-3xl group transition-all shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{addon.id}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${addon.status === 'paid' || addon.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{addon.status}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">{formatRupiah(addon.total_price)}</span>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    {addon.items?.map((it) => (
                                                        <div key={it.id} className="flex justify-between text-xs font-bold text-gray-600">
                                                            <span>{it.item?.name} x{it.quantity}</span>
                                                            <span className="text-gray-400">{formatRupiah(it.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {addon.status === 'pending' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedAddonPayment(addon);
                                                        }}
                                                        className="w-full py-3 bg-eling-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-900/10 hover:scale-[1.02] transition-all"
                                                    >
                                                        Bayar Tagihan Ini
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                            {/* Financial Summary Breakdown - Refactored for Categorized View */}
                            <div className="pt-8 border-t border-dashed border-gray-200 space-y-8 pb-12">
                            {/* 1. RESERVASI UTAMA (AWAL) - Matching Admin Look */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-eling-green rounded-full"></div>
                                    <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em]">1. Reservasi Utama (Awal)</h4>
                                </div>
                                <div className="space-y-4 px-2">
                                    {(() => {
                                        const nights = Math.ceil(Math.abs(new Date(selectedOrderDetail.check_out_date) - new Date(selectedOrderDetail.check_in_date)) / (1000 * 60 * 60 * 24)) || 1;
                                        const isResort = selectedOrderDetail.booking_type === 'RESORT';
                                        
                                        const itemsList = (selectedOrderDetail.items || []).map((tItem, idx) => {
                                            const visualSubtotal = isResort && tItem.item_type?.includes('Resort') 
                                                ? Number(tItem.subtotal) * nights 
                                                : Number(tItem.subtotal);
                                            
                                            return (
                                                <div key={idx} className="flex justify-between items-start border-b border-gray-100 pb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                                            {tItem.item?.name || 'Item Pesanan'} x{tItem.quantity}
                                                        </span>
                                                        {isResort && tItem.item_type?.includes('Resort') && (
                                                            <span className="text-[10px] text-gray-400 font-bold mt-1 italic flex items-center gap-1.5 uppercase tracking-wide">
                                                                <Clock size={12} /> {nights} Malam (Stay) • {formatRupiah(tItem.subtotal)} / malam
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">{formatRupiah(visualSubtotal)}</span>
                                                </div>
                                            );
                                        });

                                        let facilitiesRaw = selectedOrderDetail.additional_facilities || selectedOrderDetail.facilities || [];
                                        if (typeof facilitiesRaw === 'string') {
                                            try { facilitiesRaw = JSON.parse(facilitiesRaw); } catch(e) { facilitiesRaw = []; }
                                        }
                                        
                                        const facilitiesList = (Array.isArray(facilitiesRaw) ? facilitiesRaw : []).map((fac, i) => {
                                            const facPrice = Number(fac.price || fac.amount || 0);
                                            const totalFacPrice = (isResort) ? facPrice * nights : facPrice;

                                            return (
                                                <div key={`fac-${i}`} className="flex justify-between items-start border-b border-gray-100 pb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">• {fac.name || fac.label || 'Fasilitas Tambahan'}</span>
                                                        {isResort && (
                                                            <span className="text-[10px] text-gray-400 font-bold mt-1 italic flex items-center gap-1.5 uppercase tracking-wide">
                                                                {nights} Malam • {formatRupiah(facPrice)} / malam
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">{formatRupiah(totalFacPrice)}</span>
                                                </div>
                                            );
                                        });

                                        return <>{itemsList}{facilitiesList}</>;
                                    })()}
                                </div>

                                <div className="mt-8 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-200">
                                    <div className="flex justify-between text-[10px] font-black text-gray-400 mb-4 border-b border-gray-200/50 pb-3">
                                        <span className="uppercase tracking-widest opacity-60">Audit Keseimbangan Nilai</span>
                                        <span className="uppercase tracking-widest opacity-60">Nilai</span>
                                    </div>

                                    {(() => {
                                        const totalPrice = Number(selectedOrderDetail.total_price || 0);
                                        const discountAmount = Number(selectedOrderDetail.discount_amount || 0);
                                        const nights = (selectedOrderDetail.check_in_date && selectedOrderDetail.check_out_date) 
                                            ? Math.ceil(Math.abs(new Date(selectedOrderDetail.check_out_date) - new Date(selectedOrderDetail.check_in_date)) / (1000 * 60 * 60 * 24)) || 1 
                                            : 1;
                                        const isAddon = !!selectedOrderDetail.parent_id;
                                        const isResort = selectedOrderDetail.booking_type === 'RESORT' && !isAddon;

                                        let f = selectedOrderDetail.additional_facilities || selectedOrderDetail.facilities || [];
                                        if (typeof f === 'string') try { f = JSON.parse(f); } catch(e) { f = []; }
                                        const facilitiesSum = (Array.isArray(f) ? f : []).reduce((acc, curr) => acc + ( (isResort) ? Number(curr.price || curr.amount || 0) * nights : Number(curr.price || curr.amount || 0) ), 0);

                                        // Use database sums to guarantee accuracy despite past DB item pricing inaccuracies (weekend rates)
                                        const hasTax = isResort || selectedOrderDetail.booking_type === 'TICKET';
                                        const dbNetTotal = Number(selectedOrderDetail.net_total || (hasTax ? Math.round(totalPrice * (100 / 110)) : totalPrice));
                                        const taxAmount = Number(selectedOrderDetail.tax_total || (hasTax ? Math.round(totalPrice * (10 / 110)) : 0));
                                        
                                        // Deduct known components from net_total to accurately reverse-engineer the base price
                                        const itemPriceSum = (isResort || selectedOrderDetail.booking_type === 'TICKET' || isAddon)
                                            ? (dbNetTotal + discountAmount - facilitiesSum) 
                                            : (selectedOrderDetail.items?.reduce((acc, curr) => acc + Number(curr.subtotal), 0) || 0);

                                        return (
                                            <>
                                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                                    <span className="opacity-70 font-medium tracking-tight">
                                                        {isResort ? `Harga Unit Resort (${nights} Malam)` : (isAddon ? 'Tagihan Fasilitas Tambahan' : 'Subtotal Item')}
                                                    </span>
                                                    <span className="text-gray-900">{formatRupiah(itemPriceSum)}</span>
                                                </div>

                                                {facilitiesSum > 0 && (
                                                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                                        <span className="opacity-70 font-medium tracking-tight">Layanan & Fasilitas Tambahan</span>
                                                        <span className="text-gray-900">{formatRupiah(facilitiesSum)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-xs font-bold text-gray-600 pt-3 border-t border-gray-100 mb-2">
                                                    <span className="opacity-70 font-medium">Pajak Pemerintah & Layanan (10%)</span>
                                                    <span className="text-gray-900">{formatRupiah(taxAmount)}</span>
                                                </div>

                                                {discountAmount > 0 && (
                                                    <div className="flex justify-between text-[11px] font-black text-emerald-600 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 mt-4 mb-4">
                                                        <span className="uppercase tracking-widest text-[9px]">Potongan Promo / Diskon</span>
                                                        <span className="tabular-nums">- {formatRupiah(discountAmount)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between pt-6 border-t border-gray-200 mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-gray-950 uppercase tracking-widest">Total Akhir Tagihan</span>
                                                        <span className="text-[9px] opacity-40 font-bold uppercase tracking-[0.2em] mt-1">METODE: {selectedOrderDetail.payment_method || 'MIDTRANS'}</span>
                                                    </div>
                                                    <span className="text-eling-green text-3xl font-black font-serif tracking-tight">{formatRupiah(totalPrice)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                                 {/* SECTION 2: LAYANAN MENUNGGU PEMBAYARAN (PENDING ADDONS) */}
                                {selectedOrderDetail.addons?.some(a => a.status === 'pending') && (
                                    <div className="space-y-4 bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">2. Tagihan Layanan Menunggu Pembayaran</h4>
                                        </div>
                                        <div className="space-y-4 mt-4">
                                            {selectedOrderDetail.addons
                                                .filter(a => a.status === 'pending')
                                                .map(addon => (
                                                    <div key={addon.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 py-1 px-3 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest">Awaiting Payment</div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID: {addon.id}</span>
                                                                <span className="text-lg font-black text-gray-900">{formatRupiah(addon.total_price)}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handlePayAddon(addon)}
                                                                className="px-6 py-2.5 bg-eling-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                            >
                                                                <CreditCard size={12} /> Bayar Sekarang
                                                            </button>
                                                        </div>
                                                        <div className="pl-3 space-y-1 opacity-70">
                                                            {addon.items?.map(it => (
                                                                <div key={it.id} className="flex justify-between text-[10px] font-bold text-gray-500">
                                                                    <span>• {it.item?.name} x{it.quantity}</span>
                                                                    <span>{formatRupiah(it.subtotal)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 3: LAYANAN SUDAH TERBAYAR (PAID ADDONS) */}
                                {selectedOrderDetail.addons?.some(a => ['paid', 'success'].includes(a.status)) && (
                                    <div className="space-y-4 bg-blue-50/20 p-6 rounded-[2rem] border border-blue-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">3. Layanan Terbayar & Lunas</h4>
                                        </div>
                                        <div className="space-y-4 mt-4">
                                            {selectedOrderDetail.addons
                                                .filter(a => ['paid', 'success'].includes(a.status))
                                                .map(addon => (
                                                    <div key={addon.id} className="bg-white/80 p-4 rounded-2xl border border-blue-100 shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tagihan #{addon.id}</span>
                                                            <span className="text-xs font-black text-blue-600">{formatRupiah(addon.total_price)}</span>
                                                        </div>
                                                        <div className="pl-3 space-y-1">
                                                            {addon.items?.map(it => (
                                                                <div key={it.id} className="flex justify-between text-[10px] font-bold text-gray-500">
                                                                    <span>• {it.item?.name} x{it.quantity}</span>
                                                                    <span>{formatRupiah(it.subtotal)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 3: RIWAYAT RESCHEDULE & FEES */}
                                {selectedOrderDetail.reschedules?.some(r => r.status === 'completed') && (
                                    <div className="space-y-4 bg-orange-50/20 p-6 rounded-[2rem] border border-orange-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                                            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">3. Rincian Biaya Perubahan Jadwal</h4>
                                        </div>
                                        <div className="space-y-4 mt-4">
                                            {selectedOrderDetail.reschedules.filter(r => r.status === 'completed').map((r, i) => (
                                                <div key={i} className="bg-white/80 p-4 rounded-2xl border border-orange-100 shadow-sm">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Reschedule Success</span>
                                                        <span className="text-xs font-black text-gray-900">{formatRupiah(r.final_charge)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-3 border-b border-orange-50 pb-3">
                                                        <div>
                                                            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jadwal Lama</span>
                                                            <p className="text-[10px] font-black text-gray-500 line-through">{new Date(r.old_date).toLocaleDateString('id-ID')}</p>
                                                        </div>
                                                        <div>
                                                            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jadwal Baru</span>
                                                            <p className="text-[10px] font-black text-gray-900">{new Date(r.new_date).toLocaleDateString('id-ID')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {r.price_diff > 0 && <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>Selisih Harga Kamar</span><span>{formatRupiah(r.price_diff)}</span></div>}
                                                        {r.admin_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>Biaya Layanan Admin</span><span>{formatRupiah(r.admin_fee)}</span></div>}
                                                        {r.penalty_fee > 0 && <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>Biaya Denda (Penalty)</span><span>{formatRupiah(r.penalty_fee)}</span></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CONSOLIDATED TOTAL FOOTER */}
                                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-gray-900/20 gap-4 mt-8">
                                    <div className="text-center sm:text-left">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-1">Grand Total Transaksi</p>
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
                                            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Seluruh Tagihan Lunas</h5>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto">
                                        <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">{formatRupiah(
                                            Number(selectedOrderDetail.total_price || 0) +
                                            (selectedOrderDetail.addons?.filter(a => ['paid', 'success'].includes(a.status)).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) || 0) +
                                            (selectedOrderDetail.reschedules?.filter(r => r.status === 'completed').reduce((acc, curr) => acc + Number(curr.final_charge || 0), 0) || 0)
                                        )}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Actions inside Panel */}
                        {selectedOrderDetail.booking_type !== 'RESORT' && (selectedOrderDetail.status === 'success' || selectedOrderDetail.status === 'paid') && (
                            <div className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
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
                </div>,
                document.body
            )}

            {/* Edit Profile Modal */}
            {isEditingProfile && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsEditingProfile(false)}>
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
                </div>,
                document.body
            )}
            {/* Reschedule Payment Modal */}
            {selectedReschedulePayment && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedReschedulePayment(null)}>
                    <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setSelectedReschedulePayment(null)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm rotate-3">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-3xl font-black font-serif text-gray-900 leading-tight">Konfirmasi Pembayaran</h3>
                            <div className="flex gap-2 mt-2">
                                {selectedReschedulePayment.expires_at && (
                                    <div className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5 animate-pulse">
                                        <Clock size={10} /> Batas Pembayaran: <CountdownTimer expiryDate={selectedReschedulePayment.expires_at} onExpire={() => { setSelectedReschedulePayment(null); fetchReschedules(); }} />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 font-bold mt-3">Selesaikan biaya tambahan untuk memindahkan jadwal Anda.</p>
                        </div>

                        <div className="space-y-4 mb-8 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Selisih Harga</span>
                                <span className="font-bold text-gray-900">{formatRupiah(selectedReschedulePayment.price_diff)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Biaya Admin</span>
                                <span className="font-bold text-gray-900">{formatRupiah(selectedReschedulePayment.admin_fee)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Denda / Penalty</span>
                                <span className="font-bold text-gray-900">{formatRupiah(selectedReschedulePayment.penalty_fee)}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-black uppercase tracking-widest text-[11px]">Total Bayar</span>
                                <span className="text-2xl font-black text-eling-green font-serif">{formatRupiah(selectedReschedulePayment.final_charge)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                                    Setelah Anda mengklik tombol bayar, jadwal pesanan akan langsung berubah secara permanen.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={handlePayReschedule}
                                    disabled={isPayingReschedule}
                                    className="w-full py-5 bg-eling-green text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isPayingReschedule ? (
                                        'Memproses...'
                                    ) : (
                                        <>
                                            Bayar & Selesaikan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={handleCancelReschedule}
                                    className="w-full py-4 text-gray-400 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                                >
                                    Batalkan Pengajuan Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Addon Order Modal */}
            {isOrderingAddon && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsOrderingAddon(false)}>
                    <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 p-6 sm:p-8">
                            <button onClick={() => setIsOrderingAddon(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="mb-6 sm:mb-8">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm rotate-3">
                                <Plus size={24} className="sm:hidden" />
                                <Plus size={32} className="hidden sm:block" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black font-serif text-gray-900 leading-tight">Pesan Fasilitas</h3>
                            <p className="text-gray-500 font-bold mt-2 text-sm">Pilih fasilitas tambahan untuk menemani masa stay Anda.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {addonFacilities.map(f => (
                                <div key={f.id} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all">
                                    <div className="flex-1">
                                        <h5 className="font-black text-gray-900 text-sm tracking-tight">{f.name}</h5>
                                        <p className="text-xs font-bold text-eling-green mt-1">{formatRupiah(f.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100">
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: Math.max(0, addonQuantities[f.id] - 1)})}
                                            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-eling-red transition"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center font-black text-sm text-gray-900">{addonQuantities[f.id]}</span>
                                        <button 
                                            onClick={() => setAddonQuantities({...addonQuantities, [f.id]: addonQuantities[f.id] + 1})}
                                            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-eling-green transition"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimasi Tambahan</span>
                                <span className="text-2xl font-black text-gray-900">
                                    {formatRupiah(addonFacilities.reduce((acc, f) => acc + (f.price * (addonQuantities[f.id] || 0)), 0))}
                                </span>
                            </div>
                            <button 
                                onClick={handleOrderAddon}
                                disabled={isSubmittingAddon}
                                className="w-full py-5 bg-eling-green text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {isSubmittingAddon ? 'Memproses...' : 'Konfirmasi & Pesan'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Addon Payment Modal */}
            {selectedAddonPayment && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedAddonPayment(null)}>
                    <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up p-6 sm:p-10 flex flex-col relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedAddonPayment(null)} className="absolute top-6 sm:top-8 right-6 sm:right-8 text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
                        
                        <div className="mb-6 sm:mb-10 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm rotate-3">
                                <CreditCard size={28} className="sm:hidden" />
                                <CreditCard size={32} className="hidden sm:block" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black font-serif text-gray-900 leading-tight">Selesaikan Pembayaran</h3>
                            <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-[9px] sm:text-[10px]">Tagihan Tambahan: {selectedAddonPayment.id}</p>
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 mb-8 space-y-4">
                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                {selectedAddonPayment.items?.map(it => (
                                    <div key={it.id} className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <span>{it.item?.name} x{it.quantity}</span>
                                        <span className="text-gray-900">{formatRupiah(it.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-900 font-black uppercase tracking-widest text-[11px]">Total Tagihan</span>
                                <span className="text-2xl font-black text-eling-green font-serif">{formatRupiah(selectedAddonPayment.total_price)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handlePayAddon(selectedAddonPayment)}
                            disabled={isSubmittingAddon}
                            className="w-full py-5 bg-eling-green text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {isSubmittingAddon ? 'Memproses...' : 'Lakukan Pembayaran Secepatnya'}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
