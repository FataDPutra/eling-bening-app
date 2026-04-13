import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Ticket, Building, BedDouble, Receipt,
    Settings, Gift, RefreshCcw, Search, BarChart3,
    ChevronDown, Hotel, Maximize, ShoppingCart,
    PieChart, Megaphone, Layout, ExternalLink,
    ClipboardList, QrCode, Calendar, Menu, X,
    Bell, User, LogOut, ChevronLeft, ChevronRight,
    CircleDollarSign, TrendingDown, PanelLeftClose, PanelLeftOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useContent } from '../context/ContentContext';
import Swal from 'sweetalert2';
import '../styles/admin.css';

export default function AdminLayout() {
    const { logout } = useAuth();
    const { content } = useContent();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Keluar dari Panel Admin?',
            text: "Anda akan keluar dari sesi administrator.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0D9488',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-[2rem] font-serif',
                title: 'font-bold text-gray-800',
            }
        });

        if (result.isConfirmed) {
            await logout();
            navigate('/login');
        }
    };

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        booking: false,
        ticket: false,
        event: false
    });

    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const adminMenus = [
        { label: 'Dashboard', to: '/admin' },
        { label: 'Statistik', to: '/admin/stats' },
        { label: 'Pemesanan Kamar', to: '/admin/bookings' },
        { label: 'Kelola Kamar', to: '/admin/rooms' },
        { label: 'Kelola Fasilitas', to: '/admin/facilities' },
        { label: 'Reschedule', to: '/admin/reschedule' },
        { label: 'Pesanan Tiket', to: '/admin/tickets/orders' },
        { label: 'Kelola Tiket', to: '/admin/tickets' },
        { label: 'Scan Tiket', to: '/admin/scanner' },
        { label: 'Pesanan Event', to: '/admin/events/orders' },
        { label: 'Kelola Event', to: '/admin/events' },
        { label: 'Promo & Banner', to: '/admin/promos' },
        { label: 'Konten CMS', to: '/admin/content' },
        { label: 'Profil Saya', to: '/admin/profile' },
        { label: 'System Settings', to: '/admin/settings' },
        { label: 'Laporan Keuangan', to: '/admin/finance' },
    ];

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.trim()) {
            const filtered = adminMenus.filter(m => 
                m.label.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const NavItem = ({ to, icon: Icon, label, end = false }) => (
        <li>
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                title={isSidebarCollapsed ? label : ''}
            >
                <Icon size={20} />
                {!isSidebarCollapsed && <span>{label}</span>}
            </NavLink>
        </li>
    );

    return (
        <div className="admin-layout">
            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[950] lg:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header group">
                    <div className={`sidebar-logo flex-1 flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <img 
                            src={content?.layout?.logo || "/images/logo.png"} 
                            alt="Eling Bening" 
                            className={`${isSidebarCollapsed ? 'h-8' : 'h-10'} w-auto object-contain transition-all duration-500 group-hover:scale-110`} 
                        />
                    </div>
                    {!isSidebarCollapsed && (
                        <button className="lg:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {!isSidebarCollapsed && <div className="nav-section-title">Menu Utama</div>}
                        <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />
                        <NavItem to="/admin/stats" icon={BarChart3} label="Statistik" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Operasional</div>}
                        <li>
                            <button onClick={() => toggleMenu('booking')} className="nav-group-btn" title={isSidebarCollapsed ? 'Booking Resort' : ''}>
                                <div className="btn-content">
                                    <Hotel size={20} />
                                    {!isSidebarCollapsed && <span>Booking Resort</span>}
                                </div>
                                {!isSidebarCollapsed && <ChevronDown size={14} className={`chevron ${openMenus.booking ? 'rotated' : ''}`} />}
                            </button>
                            {!isSidebarCollapsed && (
                                <div className={`submenu ${openMenus.booking ? 'open' : ''}`}>
                                    <NavLink to="/admin/bookings" className="submenu-item">Daftar Pesanan</NavLink>
                                    <NavLink to="/admin/reschedule" className="submenu-item">Kelola Reschedule</NavLink>
                                    <NavLink to="/admin/rooms" className="submenu-item">Kelola Kamar</NavLink>
                                    <NavLink to="/admin/facilities" className="submenu-item">Kelola Fasilitas</NavLink>
                                </div>
                            )}
                        </li>

                        <li>
                            <button onClick={() => toggleMenu('ticket')} className="nav-group-btn" title={isSidebarCollapsed ? 'Tiket Masuk' : ''}>
                                <div className="btn-content">
                                    <Ticket size={20} />
                                    {!isSidebarCollapsed && <span>Tiket Masuk</span>}
                                </div>
                                {!isSidebarCollapsed && <ChevronDown size={14} className={`chevron ${openMenus.ticket ? 'rotated' : ''}`} />}
                            </button>
                            {!isSidebarCollapsed && (
                                <div className={`submenu ${openMenus.ticket ? 'open' : ''}`}>
                                    <NavLink to="/admin/tickets/orders" className="submenu-item">Pesanan Tiket</NavLink>
                                    <NavLink to="/admin/tickets" end className="submenu-item">Kelola Tiket</NavLink>
                                    <NavLink to="/admin/scanner" className="submenu-item">Scan Tiket</NavLink>
                                </div>
                            )}
                        </li>

                        <li>
                            <button onClick={() => toggleMenu('event')} className="nav-group-btn" title={isSidebarCollapsed ? 'Event & Show' : ''}>
                                <div className="btn-content">
                                    <Calendar size={20} />
                                    {!isSidebarCollapsed && <span>Event & Show</span>}
                                </div>
                                {!isSidebarCollapsed && <ChevronDown size={14} className={`chevron ${openMenus.event ? 'rotated' : ''}`} />}
                            </button>
                            {!isSidebarCollapsed && (
                                <div className={`submenu ${openMenus.event ? 'open' : ''}`}>
                                    <NavLink to="/admin/events/orders" className="submenu-item">Pesanan Event</NavLink>
                                    <NavLink to="/admin/events" end className="submenu-item">Kelola Event</NavLink>
                                </div>
                            )}
                        </li>

                        {!isSidebarCollapsed && <div className="nav-section-title">Marketing & Content</div>}
                        <NavItem to="/admin/promos" icon={Megaphone} label="Promo & Banner" />
                        <NavItem to="/admin/content" icon={Layout} label="Konten CMS" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Laporan Keuangan</div>}
                        <NavItem to="/admin/finance" icon={PieChart} label="Dashboard Finance" end />
                        <NavItem to="/admin/finance/expenses" icon={TrendingDown} label="Pengeluaran" />
                        <NavItem to="/admin/finance/tickets" icon={Ticket} label="Pendapatan Tiket" />
                        <NavItem to="/admin/finance/resort" icon={Building} label="Pendapatan Resort" />
                        <NavItem to="/admin/finance/recap" icon={CircleDollarSign} label="Rekapitulasi" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Konfigurasi</div>}
                        <NavItem to="/admin/seo" icon={Search} label="SEO & Meta" />
                        <NavItem to="/admin/profile" icon={User} label="Profil Saya" />
                        <NavItem to="/admin/settings" icon={Settings} label="Pengaturan Sistem" />
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <Link to="/" className="view-site-link">
                        <ExternalLink size={18} />
                        {!isSidebarCollapsed && <span>Lihat Website</span>}
                    </Link>
                    <button onClick={handleLogout} className="logout-btn flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full mt-2">
                        <LogOut size={18} />
                        {!isSidebarCollapsed && <span className="font-bold">Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="admin-main-wrapper">
                <header className="admin-topbar">
                    <div className="topbar-left flex items-center gap-2 lg:gap-4">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-admin-primary transition-all shadow-sm"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Desktop Toggle */}
                        <button 
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-admin-primary hover:border-admin-primary/30 transition-all shadow-sm group"
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" /> : <PanelLeftClose size={20} className="group-hover:scale-110 transition-transform" />}
                        </button>

                        <div className="topbar-search relative group max-w-[150px] sm:max-w-xs transition-all duration-300">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari..." 
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-admin-primary/20 transition-all"
                            />
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1100] animate-fade-in w-[250px] sm:w-full">
                                    <div className="p-2">
                                        {searchResults.map((res, i) => (
                                            <Link 
                                                key={i} 
                                                to={res.to} 
                                                onClick={() => setSearchResults([])}
                                                className="flex items-center gap-3 p-3 hover:bg-admin-bg rounded-xl transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-admin-primary/10 flex items-center justify-center text-admin-primary group-hover:bg-admin-primary group-hover:text-white transition-all">
                                                    <Search size={14} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{res.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="topbar-right flex items-center gap-4">
                        <Link to="/admin/profile" className="flex items-center gap-3 hover:bg-gray-50 transition-colors p-1 pr-3 rounded-xl cursor-pointer">
                            <div className="profile-info hidden sm:block text-right">
                                <span className="profile-name block text-sm font-black text-admin-text-main leading-none mb-1">Administrator</span>
                                <span className="profile-role block text-[10px] font-bold text-admin-text-muted uppercase tracking-widest leading-none">Super Admin</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center text-admin-primary font-black text-sm shadow-inner group-hover:scale-105 transition-transform">
                                A
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-admin-border px-2 py-3 pb-8 flex items-end justify-around lg:hidden z-[900] shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
                <NavLink to="/admin" end className={({ isActive }) => `flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl transition-all hover:bg-admin-primary/5 ${isActive ? 'text-admin-primary' : 'text-admin-text-muted opacity-60'}`}>
                    {({ isActive }) => (
                        <>
                            <LayoutDashboard size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[7px] font-black uppercase tracking-widest text-center">Dash</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/admin/bookings" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl transition-all hover:bg-admin-primary/5 ${isActive ? 'text-admin-primary' : 'text-admin-text-muted opacity-60'}`}>
                    {({ isActive }) => (
                        <>
                            <Hotel size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[7px] font-black uppercase tracking-widest text-center">Resort</span>
                        </>
                    )}
                </NavLink>
                
                {/* Prominent Scan Button */}
                <NavLink to="/admin/scanner" className="flex-1 -mt-12 group">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-admin-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(13,148,136,0.4)] border-4 border-white group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                            <QrCode size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-widest text-admin-primary">Scan</span>
                    </div>
                </NavLink>

                <NavLink to="/admin/tickets/orders" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl transition-all hover:bg-admin-primary/5 ${isActive ? 'text-admin-primary' : 'text-admin-text-muted opacity-60'}`}>
                    {({ isActive }) => (
                        <>
                            <Ticket size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[7px] font-black uppercase tracking-widest text-center">Tiket</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/admin/events/orders" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl transition-all hover:bg-admin-primary/5 ${isActive ? 'text-admin-primary' : 'text-admin-text-muted opacity-60'}`}>
                    {({ isActive }) => (
                        <>
                            <Calendar size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[7px] font-black uppercase tracking-widest text-center">Event</span>
                        </>
                    )}
                </NavLink>
            </nav>
        </div>
    );
}
