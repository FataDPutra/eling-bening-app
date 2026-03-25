import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, UserCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import Swal from 'sweetalert2';
import '../styles/guest.css';

export default function GuestLayout() {
    const { user, logout } = useAuth();
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
            background: '#ffffff',
            borderRadius: '2rem',
            customClass: {
                popup: 'rounded-[2rem] font-serif',
                title: 'font-bold text-gray-800',
                confirmButton: 'rounded-xl px-8 py-3 font-bold',
                cancelButton: 'rounded-xl px-8 py-3 font-bold'
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

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Auto scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // isHome determines if we use the transparent glass nav initially
    const isHome = location.pathname === '/';

    return (
        <div className="bg-white text-gray-900 min-h-screen flex flex-col">
            <style>{`
                .glass {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .text-eling-green { color: #2E7D32; }
                .bg-eling-green { background-color: #2E7D32; }
                .text-eling-red { color: #C62828; }
                .bg-eling-red { background-color: #C62828; }
                .group:hover .group-hover\\:visible {
                    visibility: visible;
                }
                .group:hover .group-hover\\:opacity-100 {
                    opacity: 1;
                }
                
                /* Responsive handling for main content spacing when not on home */
                .pt-offset { padding-top: 80px; }
            `}</style>

            {/* Header / Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 py-4 px-6 lg:px-12 flex justify-between items-center ${isHome && !scrolled ? 'glass text-white' : 'bg-white/90 text-gray-900 shadow-lg'}`}>
                <Link to="/" className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Logo" className={`h-10 ${isHome && !scrolled ? '' : ''}`} />
                    <span className={`text-xl font-serif font-bold tracking-wider ${isHome && !scrolled ? '' : 'text-eling-green'}`}>Eling Bening</span>
                </Link>

                <div className="hidden lg:flex gap-8 font-semibold tracking-wide uppercase text-sm">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'Tentang Kami', path: '/about' },
                        { name: 'Resort', path: '/rooms' },
                        { name: 'Event', path: '/events' },
                        { name: 'Galeri', path: '/gallery' },
                        { name: 'Fasilitas', path: '/facilities' },
                        { name: 'Kontak', path: '/contact' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`transition duration-300 ${
                                location.pathname === item.path
                                    ? 'text-eling-green'
                                    : `hover:text-eling-green ${isHome && !scrolled ? 'text-white' : 'text-gray-900'}`
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <button className="w-10 h-10 rounded-full bg-eling-red flex items-center justify-center text-white shadow-lg hover:bg-red-800 transition">
                            <UserCircle size={24} />
                        </button>
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl py-4 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right border border-gray-100">
                            <div className="px-6 py-2 border-b border-gray-100 mb-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Akun Saya</p>
                            </div>
                            {user ? (
                                <>
                                    <div className="px-6 py-2 mb-2 bg-green-50">
                                        <p className="text-sm font-bold text-eling-green">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <button onClick={handleLogout} className="w-full text-left px-6 py-2 hover:bg-gray-50 hover:text-eling-red transition text-sm font-semibold">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-sm font-semibold">Login</Link>
                                    <Link to="/register" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-sm font-semibold">Register</Link>
                                </>
                            )}
                            <div className="h-px bg-gray-100 my-2 mx-4"></div>
                            {user && <Link to="/profile" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-sm font-semibold">Profil & Riwayat</Link>}
                            <Link to="/admin" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-sm font-semibold text-eling-red">Panel Admin</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className={`flex-grow ${!isHome ? 'pt-offset' : ''}`}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-eling-green text-white py-20 px-6 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                    {/* Column 1: Logo + Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img src="/images/logo.png" alt="Logo" className="h-10" />
                            <span className="text-2xl font-serif font-bold tracking-wider text-white">Eling Bening</span>
                        </div>
                        <p className="text-green-100 text-sm leading-relaxed">
                            Destinasi wisata alam terbaik di Ambarawa. Rasakan harmoni keindahan alam dan kemewahan dalam satu tempat.
                        </p>
                    </div>

                    {/* Column 2: Quick Links (Menu) */}
                    <div>
                        <h4 className="font-bold text-xl mb-8">Menu Pintasan</h4>
                        <ul className="space-y-4 text-green-100 text-sm">
                            <li><Link to="/" className="hover:text-white transition underline-offset-4 hover:underline">Beranda</Link></li>
                            <li><Link to="/about" className="hover:text-white transition underline-offset-4 hover:underline">Tentang Kami</Link></li>
                            <li><Link to="/facilities" className="hover:text-white transition underline-offset-4 hover:underline">Fasilitas</Link></li>
                            <li><Link to="/gallery" className="hover:text-white transition underline-offset-4 hover:underline">Galeri</Link></li>
                            <li><Link to="/events" className="hover:text-white transition underline-offset-4 hover:underline">Event</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="font-bold text-xl mb-8">Hubungi Kami</h4>
                        <ul className="space-y-4 text-green-100 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="flex-shrink-0" />
                                <span>Jl. Sarjono, Bauman, Ambarawa, Kabupaten Semarang, Jawa Tengah.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="flex-shrink-0" />
                                <span>+62 811-2345-6789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="flex-shrink-0" />
                                <span>info@elingbening.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social Media */}
                    <div>
                        <h4 className="font-bold text-xl mb-8">Media Sosial</h4>
                        <p className="text-green-100 text-sm mb-6">Ikuti kami untuk informasi terbaru.</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-tiktok"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/10 text-center text-green-200 text-sm">
                    <p>&copy; {new Date().getFullYear()} Eling Bening Ambarawa. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
