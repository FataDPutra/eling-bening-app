import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Ticket, Building, BedDouble, Receipt,
    Settings, Gift, RefreshCcw, Search, BarChart3,
    ChevronDown, Hotel, Maximize, ShoppingCart,
    PieChart, Megaphone, Layout, ExternalLink,
    ClipboardList, QrCode, Calendar, Menu, X,
    Bell, User, LogOut, ChevronLeft, ChevronRight,
    CircleDollarSign, TrendingDown, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import Swal from 'sweetalert2';
import '../styles/admin.css';

export default function AdminLayout() {
    const { logout } = useAuth();
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
        ticket: false
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
        { label: 'Reschedule', to: '/admin/reschedule' },
        { label: 'Pemesanan Tiket', to: '/admin/tickets/orders' },
        { label: 'Kelola Tiket', to: '/admin/tickets' },
        { label: 'Scan Tiket', to: '/admin/scanner' },
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
                <div className="sidebar-header">
                    <div className="sidebar-logo flex-1">
                        <div className="p-1.5 bg-admin-primary rounded-lg">
                            <img src="/images/logo.png" alt="Logo" className="h-6 brightness-0 invert" />
                        </div>
                        {!isSidebarCollapsed && <h2 className="ml-3">Eling Bening</h2>}
                    </div>
                    <button className="lg:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {!isSidebarCollapsed && <div className="nav-section-title">Main Menu</div>}
                        <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />
                        <NavItem to="/admin/stats" icon={BarChart3} label="Statistik" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Operational</div>}
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
                                    <NavLink to="/admin/rooms" className="submenu-item">Kelola Kamar</NavLink>
                                    <NavLink to="/admin/bookings" className="submenu-item">Daftar Pesanan</NavLink>
                                    <NavLink to="/admin/reschedule" className="submenu-item">Kelola Reschedule</NavLink>
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

                        {!isSidebarCollapsed && <div className="nav-section-title">Marketing & Content</div>}
                        <NavItem to="/admin/events" icon={Calendar} label="Kelola Event" />
                        <NavItem to="/admin/promos" icon={Megaphone} label="Promo & Banner" />
                        <NavItem to="/admin/content" icon={Layout} label="Konten CMS" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Financial Reports</div>}
                        <NavItem to="/admin/finance" icon={PieChart} label="Dashboard Finance" end />
                        <NavItem to="/admin/finance/expenses" icon={TrendingDown} label="Pengeluaran" />
                        <NavItem to="/admin/finance/tickets" icon={Ticket} label="Pendapatan Tiket" />
                        <NavItem to="/admin/finance/resort" icon={Building} label="Pendapatan Resort" />
                        <NavItem to="/admin/finance/recap" icon={CircleDollarSign} label="Rekapitulasi" />

                        {!isSidebarCollapsed && <div className="nav-section-title">Settings</div>}
                        <NavItem to="/admin/seo" icon={Search} label="SEO & Meta" />
                        <NavItem to="/admin/profile" icon={User} label="Profil Saya" />
                        <NavItem to="/admin/settings" icon={Settings} label="System Settings" />
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <Link to="/" className="view-site-link">
                        <ExternalLink size={18} />
                        {!isSidebarCollapsed && <span>Lihat Website</span>}
                    </Link>
                    <button onClick={handleLogout} className="logout-btn flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full mt-2">
                        <LogOut size={18} />
                        {!isSidebarCollapsed && <span className="font-bold">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="admin-main-wrapper">
                <header className="admin-topbar">
                    <div className="topbar-left flex items-center gap-4">
                        <button 
                            onClick={toggleSidebar}
                            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-admin-primary hover:border-admin-primary/30 transition-all shadow-sm group"
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" /> : <PanelLeftClose size={20} className="group-hover:scale-110 transition-transform" />}
                        </button>

                        <div className="topbar-search relative group">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari fitur atau halaman..." 
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-10 py-2.5 focus:ring-2 focus:ring-admin-primary/20 transition-all"
                            />
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1100] animate-fade-in">
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

                    <div className="topbar-right">
                        <div className="topbar-actions hidden sm:flex">
                        </div>

                        <Link to="/admin/profile" className="admin-profile hover:bg-gray-50 transition-colors p-1 rounded-xl cursor-pointer">
                            <div className="profile-info hidden sm:block text-right">
                                <span className="profile-name">Administrator</span>
                                <span className="profile-role">Super Admin</span>
                            </div>
                            <div className="profile-avatar">A</div>
                        </Link>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-admin-border px-6 py-4 flex items-center justify-between lg:hidden z-[900]">
                <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-admin-primary' : 'text-admin-text-light'}`}>
                    <LayoutDashboard size={22} className={location.pathname === '/admin' ? 'animate-bounce-short' : ''} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
                </NavLink>
                <NavLink to="/admin/rooms" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-admin-primary' : 'text-admin-text-light'}`}>
                    <BedDouble size={22} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Rooms</span>
                </NavLink>
                <NavLink to="/admin/tickets" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-admin-primary' : 'text-admin-text-light'}`}>
                    <Ticket size={22} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tickets</span>
                </NavLink>
                <NavLink to="/admin/settings" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-admin-primary' : 'text-admin-text-light'}`}>
                    <Settings size={22} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sets</span>
                </NavLink>
            </nav>
        </div>
    );
}
