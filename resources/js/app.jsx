import './bootstrap';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './utils/AuthContext';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';

// Guest Pages
import Home from './pages/guest/Home';
import About from './pages/guest/About';
import Facilities from './pages/guest/Facilities';
import Gallery from './pages/guest/Gallery';
import Contact from './pages/guest/Contact';
import Ticketing from './pages/guest/Ticketing';
import Rooms from './pages/guest/Rooms';
import RoomDetails from './pages/guest/RoomDetails';
import Booking from './pages/guest/Booking';
import Payment from './pages/guest/Payment';
import BookingDetails from './pages/guest/BookingDetails';
import Events from './pages/guest/Events';
import EventBooking from './pages/guest/EventBooking';
import EventTicketing from './pages/guest/EventTicketing';
import Profile from './pages/guest/Profile';
import Login from './pages/guest/Login';
import Register from './pages/guest/Register';
import ForgotPassword from './pages/guest/ForgotPassword';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Stats from './pages/admin/Stats';
import AdminRooms from './pages/admin/Rooms';
import Bookings from './pages/admin/Bookings';
import Reschedule from './pages/admin/Reschedule';
import Tickets from './pages/admin/Tickets';
import Scanner from './pages/admin/Scanner';
import AdminEvents from './pages/admin/Events';
import Promos from './pages/admin/Promos';
import Finance from './pages/admin/Finance';
import Settings from './pages/admin/Settings';
import AdminContent from './pages/admin/AdminContent';
import TicketOrders from './pages/admin/tickets/TicketOrders';
import AdminProfile from './pages/admin/Profile';
import Seo from './pages/admin/Seo';
import Expenses from './pages/admin/Expenses';
import FinanceTickets from './pages/admin/FinanceTickets';
import FinanceResort from './pages/admin/FinanceResort';
import FinanceRecap from './pages/admin/FinanceRecap';
import AdminFacilities from './pages/admin/Facilities';

// Rooms sub-pages
import AddRoom from './pages/admin/rooms/AddRoom';
import EditRoom from './pages/admin/rooms/EditRoom';

// Tickets sub-pages
import AddTicket from './pages/admin/tickets/AddTicket';
import EditTicket from './pages/admin/tickets/EditTicket';

// Events sub-pages
import AddEvent from './pages/admin/events/AddEvent';
import EditEvent from './pages/admin/events/EditEvent';
import EventOrders from './pages/admin/events/EventOrders';

// Promos sub-pages
import AddPromo from './pages/admin/promos/AddPromo';
import EditPromo from './pages/admin/promos/EditPromo';

import { ContentProvider } from './context/ContentContext';

// Stubs for remaining pages
const StubPage = ({ title }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50 rounded-[4rem]">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-4">{title}</h2>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed">This module is currently being optimized for high-performance <br /> and will be available in the next release.</p>
        <button onClick={() => window.history.back()} className="mt-12 bg-eling-green text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-green-900/10">Navigate Back</button>
    </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-eling-green/20 border-t-eling-green rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

const App = () => {
    useEffect(() => {
        console.log("App Mounted");
    }, []);

    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Guest Portal */}
                    <Route path="/" element={<GuestLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="facilities" element={<Facilities />} />
                        <Route path="gallery" element={<Gallery />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="rooms" element={<Rooms />} />
                        <Route path="rooms/:id" element={<RoomDetails />} />
                        <Route path="events" element={<Events />} />
                        <Route path="events/:id/book" element={<EventBooking />} />
                        <Route path="event-ticketing" element={<EventTicketing />} />
                        
                        {/* Protected Guest */}
                        <Route path="ticketing" element={<Ticketing />} />
                        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                        <Route path="payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                        <Route path="booking-details" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
                    </Route>

                    {/* Admin Management */}
                    <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="profile" element={<AdminProfile />} />
                        <Route path="seo" element={<Seo />} />
                        
                        <Route path="rooms" element={<AdminRooms />} />
                        <Route path="rooms/add" element={<AddRoom />} />
                        <Route path="rooms/edit/:id" element={<EditRoom />} />
                        
                        <Route path="bookings" element={<Bookings />} />
                        <Route path="reschedule" element={<Reschedule />} />
                        
                        <Route path="tickets" element={<Tickets />} />
                        <Route path="tickets/orders" element={<TicketOrders />} />
                        <Route path="tickets/add" element={<AddTicket />} />
                        <Route path="tickets/edit/:id" element={<EditTicket />} />
                        
                        <Route path="scanner" element={<Scanner />} />
                        <Route path="events" element={<AdminEvents />} />
                        <Route path="events/orders" element={<EventOrders />} />
                        <Route path="events/add" element={<AddEvent />} />
                        <Route path="events/edit/:id" element={<EditEvent />} />
                        
                        <Route path="promos" element={<Promos />} />
                        <Route path="promos/add" element={<AddPromo />} />
                        <Route path="promos/edit/:id" element={<EditPromo />} />
                        
                        <Route path="content" element={<AdminContent />} />
                        
                        <Route path="finance" element={<Finance />} />
                        <Route path="finance/expenses" element={<Expenses />} />
                        <Route path="finance/tickets" element={<FinanceTickets />} />
                        <Route path="finance/resort" element={<FinanceResort />} />
                        <Route path="finance/recap" element={<FinanceRecap />} />
                        
                        <Route path="settings" element={<Settings />} />
                        <Route path="facilities" element={<AdminFacilities />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

const rootElement = document.getElementById('root');
if (rootElement && !window.reactRoot) {
    window.reactRoot = createRoot(rootElement);
    window.reactRoot.render(
        <ContentProvider>
            <App />
        </ContentProvider>
    );
}

export default App;
