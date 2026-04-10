import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, UserCircle, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useContent } from '../context/ContentContext';
import Swal from 'sweetalert2';
import '../styles/guest.css';

export default function GuestLayout() {
    const { user, logout } = useAuth();
    const { content } = useContent();
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

    // Determine if the current page features a full-bleed hero that goes behind the navbar
    const transparentCapablePages = ['/', '/about', '/events', '/gallery', '/facilities', '/contact'];
    const isHeroPage = transparentCapablePages.includes(location.pathname);

    return (
        <div className="bg-white text-gray-900 min-h-screen flex flex-col">
            <style>{`
                .glass {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
                
                /* Layout spacing logic */
                .pt-offset { padding-top: 80px; }
            `}</style>

            {/* Header / Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-500 py-4 px-6 lg:px-12 flex justify-between items-center ${isHeroPage && !scrolled ? 'glass text-white' : 'bg-white/95 text-gray-900 shadow-xl backdrop-blur-md'}`}>
                <Link to="/" className="flex items-center gap-2 group">
                    <img src={content.layout.logo || '/images/logo.png'} alt="Logo" className={`h-10 transition-transform group-hover:scale-110 duration-500`} />
                    <span className={`text-xl font-serif font-black tracking-wider ${isHeroPage && !scrolled ? 'text-white drop-shadow-sm' : 'text-eling-green'}`}>{content.layout.siteTitle || 'Eling Bening'}</span>
                </Link>

                <div className="hidden lg:flex gap-8 font-black tracking-[0.05em] uppercase text-[11px] items-center">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'Tentang Kami', path: '/about' },
                        { name: 'Resort', path: '/rooms' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`transition-all duration-300 relative py-1 ${
                                location.pathname === item.path
                                    ? 'text-eling-green font-black underline-offset-8 underline'
                                    : `hover:text-eling-green ${isHeroPage && !scrolled ? 'text-white' : 'text-gray-900'}`
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Tiket Dropdown */}
                    <div className="relative group/tiket py-4">
                        <button className={`flex items-center gap-1.5 transition-all duration-300 ${isHeroPage && !scrolled ? 'text-white' : 'text-gray-900'} hover:text-eling-green`}>
                            TIKET <ChevronDown size={14} className="group-hover/tiket:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-2xl py-3 opacity-0 invisible group-hover/tiket:opacity-100 group-hover/tiket:visible transition-all duration-300 transform origin-top scale-95 group-hover/tiket:scale-100 translate-y-2 group-hover/tiket:translate-y-0 border border-gray-100">
                            <Link to="/ticketing" className="block px-6 py-3 text-gray-800 hover:bg-gray-50 hover:text-eling-green transition text-[10px] font-black uppercase tracking-widest border-b border-gray-50">Tiket Wisata</Link>
                            <Link to="/event-ticketing" className="block px-6 py-3 text-gray-800 hover:bg-gray-50 hover:text-eling-green transition text-[10px] font-black uppercase tracking-widest">Tiket Event</Link>
                        </div>
                    </div>

                    {[
                        { name: 'Event', path: '/events' },
                        { name: 'Galeri', path: '/gallery' },
                        { name: 'Fasilitas', path: '/facilities' },
                        { name: 'Kontak', path: '/contact' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`transition-all duration-300 relative py-1 ${
                                location.pathname === item.path
                                    ? 'text-eling-green font-black underline-offset-8 underline'
                                    : `hover:text-eling-green ${isHeroPage && !scrolled ? 'text-white' : 'text-gray-900'}`
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* User dropdown (desktop) */}
                    <div className="hidden lg:block relative group">
                        <button className="w-10 h-10 rounded-full bg-eling-red flex items-center justify-center text-white shadow-xl hover:bg-red-800 transition-all duration-500 hover:rotate-[360deg]">
                            <UserCircle size={24} />
                        </button>
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl py-4 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right border border-gray-100 scale-95 group-hover:scale-100 translate-y-2 group-hover:translate-y-0">
                            <div className="px-6 py-2 border-b border-gray-100 mb-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Akun Saya</p>
                            </div>
                            {user ? (
                                <div className="px-6 py-2 mb-2 bg-green-50/50">
                                    <p className="text-sm font-black text-eling-green uppercase tracking-tight">{user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{user.email}</p>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-xs font-black uppercase tracking-widest">Login</Link>
                                    <Link to="/register" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-xs font-black uppercase tracking-widest">Register</Link>
                                </>
                            )}
                            <div className="h-px bg-gray-100 my-2 mx-4"></div>
                            {user && <Link to="/profile" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-xs font-black uppercase tracking-widest">Profil & Riwayat</Link>}
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="block px-6 py-2 hover:bg-gray-50 hover:text-eling-green transition text-[11px] font-black uppercase tracking-widest text-eling-red">Panel Admin</Link>
                            )}
                            {user && (
                                <>
                                    <div className="h-px bg-gray-50 my-1 mx-4"></div>
                                    <button onClick={handleLogout} className="w-full text-left px-6 py-2 hover:bg-gray-50 hover:text-eling-red transition text-xs font-black uppercase tracking-widest">Logout</button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hamburger (Mobile) */}
                    <button
                        className={`lg:hidden p-2 rounded-xl transition-all duration-300 ${isHeroPage && !scrolled ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`}
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open Menu"
                    >
                        <Menu size={26} />
                    </button>
                </div>
            </nav>

            {/* Mobile Full-Screen Menu Drawer */}
            <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

                {/* Drawer Panel */}
                <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white flex flex-col shadow-2xl transform transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <img src={content.layout.logo || '/images/logo.png'} alt="Logo" className="h-8" />
                            <span className="text-lg font-serif font-black text-eling-green">{content.layout.siteTitle || 'Eling Bening'}</span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                            <X size={22} />
                        </button>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="px-8 py-4 bg-eling-green/5 border-b border-green-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Halo,</p>
                            <p className="font-black text-eling-green text-base truncate">{user.name}</p>
                        </div>
                    )}

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                        {[
                            { name: 'Beranda', path: '/' },
                            { name: 'Tentang Kami', path: '/about' },
                            { name: 'Resort & Kamar', path: '/rooms' },
                            { name: 'Event', path: '/events' },
                            { name: 'Tiket Wisata', path: '/ticketing' },
                            { name: 'Tiket Event', path: '/event-ticketing' },
                            { name: 'Galeri', path: '/gallery' },
                            { name: 'Fasilitas', path: '/facilities' },
                            { name: 'Kontak', path: '/contact' },
                        ].map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black uppercase tracking-wide text-sm transition-all duration-200 ${
                                    location.pathname === item.path
                                        ? 'bg-eling-green/10 text-eling-green'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-eling-green'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Auth Actions */}
                    <div className="px-4 pb-10 pt-4 border-t border-gray-100 space-y-3">
                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 w-full px-5 py-3.5 bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-eling-green/10 hover:text-eling-green transition-all">
                                    <User size={16} /> Profil & Riwayat
                                </Link>
                                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="flex items-center gap-3 w-full px-5 py-3.5 bg-red-50 text-eling-red font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all">
                                    <X size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full px-5 py-3.5 bg-eling-green text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-800 transition-all">
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full px-5 py-3.5 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className={`flex-grow ${!isHeroPage ? 'pt-offset' : ''}`}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-eling-green text-white py-20 px-6 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                    {/* Column 1: Logo + Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img src={content.layout.logo || '/images/logo.png'} alt="Logo" className="h-10" />
                            <span className="text-2xl font-serif font-bold tracking-wider text-white">{content.layout.siteTitle || 'Eling Bening'}</span>
                        </div>
                        <p className="text-green-100 text-sm leading-relaxed">
                            {content.layout.footerDesc || "Destinasi wisata alam terbaik di Ambarawa. Rasakan harmoni keindahan alam dan kemewahan dalam satu tempat."}
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
                                <span>{content.contact.address || "Jl. Sarjono, Bauman, Ambarawa, Kabupaten Semarang, Jawa Tengah."}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="flex-shrink-0" />
                                <span>{content.contact.phone || "+62 811-2345-6789"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="flex-shrink-0" />
                                <span>{content.contact.email || "info@elingbening.com"}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social Media */}
                    <div>
                        <h4 className="font-bold text-xl mb-8">Media Sosial</h4>
                        <p className="text-green-100 text-sm mb-6">Ikuti kami untuk informasi terbaru.</p>
                        <div className="flex gap-4">
                            <a href={content.layout.socialIg || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href={content.layout.socialTt || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-tiktok"></i>
                            </a>
                            <a href={content.layout.socialYt || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/10 text-center text-green-200 text-sm">
                    <p>&copy; {new Date().getFullYear()} {content.layout.siteTitle || 'Eling Bening'} Ambarawa. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
