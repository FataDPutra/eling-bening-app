import { useState, useEffect } from 'react';
import { getBookings, formatRupiah } from '../../utils/data';
import { useAuth } from '../../utils/AuthContext';
import { Search, MapPin, Calendar, Clock, ArrowRight, User, Mail, ShieldCheck, Ticket, QrCode, X, Download, BedDouble } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Profile() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda akan keluar dari sesi ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            cancelButtonColor: '#2E7D32',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-[2rem] font-serif',
                title: 'font-bold text-gray-800',
            }
        });

        if (result.isConfirmed) {
            await logout();
            Swal.fire({
                title: 'Logged Out!',
                text: 'Sampai jumpa kembali di Eling Bening.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                borderRadius: '2rem'
            });
            navigate('/');
        }
    };
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setBookings(getBookings().reverse()); // latest first
    }, []);

    const [selectedTicket, setSelectedTicket] = useState(null);

    const filtered = bookings.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in bg-gray-50 pb-20 pt-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">

                <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">Profil Saya</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: Profile Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-eling-green mb-4">
                                    <User size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 text-center">{user?.name || 'Guest User'}</h2>
                                <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-4 mb-8 w-full border-t border-gray-100 pt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-eling-green focus:ring-1 focus:ring-eling-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-eling-green focus:ring-1 focus:ring-eling-green"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                updateProfile(editForm);
                                                setIsEditingProfile(false);
                                            }}
                                            className="flex-1 py-2 bg-eling-green text-white font-bold rounded-xl hover:bg-green-800 transition text-sm"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 border-b border-gray-100 pb-4">
                                        <ShieldCheck size={18} className="text-eling-green" /> Akun Terverifikasi
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 border-b border-gray-100 pb-4">
                                        <Mail size={18} className="text-eling-green" /> Notifikasi Email Aktif
                                    </div>
                                </div>
                            )}

                            {!isEditingProfile && (
                                <div className="flex flex-col gap-3 w-full">
                                    <button onClick={() => {
                                        setEditForm({ name: user?.name, email: user?.email });
                                        setIsEditingProfile(true);
                                    }} className="w-full py-3 text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                                        Edit Profil
                                    </button>
                                    <button onClick={handleLogout} className="w-full py-3 text-eling-red font-bold rounded-xl bg-red-50 hover:bg-red-100 transition">
                                        Keluar Akun
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content: History & Tickets */}
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
                                        placeholder="Cari Order ID / Nama..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eling-green/50 text-sm"
                                    />
                                </div>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                                        <Clock size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada pesanan</h3>
                                    <p className="text-gray-500 mb-6">Anda belum pernah melakukan pemesanan tiket atau resort.</p>
                                    <div className="flex justify-center gap-4">
                                        <Link to="/ticketing" className="bg-eling-green text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition">Beli Tiket</Link>
                                        <Link to="/rooms" className="bg-white border-2 border-eling-green text-eling-green font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition">Pesan Resort</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filtered.map(booking => {
                                        const isTicket = booking.itemName.toLowerCase().includes('tiket');
                                        return (
                                            <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-green-200 transition">
                                                <div className="flex-1 w-full flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isTicket ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-eling-green'}`}>
                                                        {isTicket ? <Ticket size={24} /> : <BedDouble size={24} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{booking.id}</span>
                                                        <h3 className="text-xl font-bold text-gray-900 my-1">{booking.itemName}</h3>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                                                            <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                            <div className="flex items-center gap-1"><User size={14} /> Atas Nama: <strong className="text-gray-700 font-bold ml-1">{booking.name}</strong></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                                    <div className="text-xl font-bold text-gray-900">{formatRupiah(booking.total)}</div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${booking.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {booking.status === 'success' ? 'LUNAS (TERKONFIRMASI)' : 'MENUNGGU PEMBAYARAN'}
                                                    </span>

                                                    {booking.status === 'success' && isTicket && (
                                                        <button
                                                            onClick={() => setSelectedTicket(booking)}
                                                            className="mt-2 flex items-center gap-2 text-sm font-bold text-eling-green hover:underline"
                                                        >
                                                            <QrCode size={16} /> Buka E-Tiket
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* E-Ticket QR Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-white rounded-[2rem] overflow-hidden w-full max-w-sm shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>

                        <div className="bg-eling-green text-white p-6 text-center relative">
                            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition">
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold font-serif mb-1">E-Tiket Anda</h3>
                            <p className="text-green-100 text-sm opacity-80">Siapkan kecerahan layar maksimum</p>
                        </div>

                        <div className="p-8 text-center bg-gray-50 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 mb-6 relative">
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-r-full border-y border-r border-gray-100"></div>
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-l-full border-y border-l border-gray-100"></div>

                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicket.id}&color=111827`} alt="QR Code Ticket" className="w-48 h-48 mix-blend-multiply opacity-90" />
                            </div>

                            <h4 className="font-bold text-gray-900 text-xl mb-1">{selectedTicket.itemName}</h4>
                            <p className="text-gray-500 text-sm mb-6">{new Date(selectedTicket.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                            <div className="w-full border-t border-dashed border-gray-300 my-4 relative"></div>

                            <div className="w-full flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Pemesan</span>
                                <span className="font-bold text-gray-900">{selectedTicket.name}</span>
                            </div>
                            <div className="w-full flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-bold text-gray-900">{selectedTicket.id}</span>
                            </div>
                            <div className="w-full flex justify-between items-center text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Lunas</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100">
                            <button onClick={() => window.print()} className="w-full bg-eling-green text-white font-bold py-3 text-sm rounded-xl hover:bg-green-800 transition flex items-center justify-center gap-2">
                                <Download size={16} /> Unduh / Cetak Tiket
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
