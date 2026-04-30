import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Calendar, MapPin, ArrowRight, Tag, Loader2, X, Phone, Mail, Clock, Star, ChevronLeft, ChevronRight, Users, CheckCircle, CreditCard } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { Link, useLocation } from 'react-router-dom';
import { formatRupiah } from '../../utils/data';

export default function Events() {
    const { content, isLoading: contentLoading } = useContent();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/api/events');
                const activeOnes = data.filter(e => e.is_active);
                setEvents(activeOnes);
                
                // Check for auto-open ID from navigation state
                if (location.state?.openId) {
                    const target = activeOnes.find(e => e.id == location.state.openId);
                    if (target) {
                        setSelectedEvent(target);
                        setActiveImageIndex(0);
                        document.body.style.overflow = 'hidden';
                    }
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [location.state]);

    const openDetail = (event) => {
        setSelectedEvent(event);
        setActiveImageIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeDetail = () => {
        setSelectedEvent(null);
        document.body.style.overflow = '';
    };

    const getImages = (event) => {
        const imgs = Array.isArray(event.images) && event.images.length > 0
            ? event.images
            : (event.image ? [event.image] : []);
        return imgs.length > 0 ? imgs : ['/images/generated/event.png'];
    };

    if (contentLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="relative md:h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden pt-48 md:pt-40 pb-32 md:pb-24">
                <img src={content.eventHeroImage || '/images/hero-bg.png'} alt="Events at Eling Bening" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                <div className="relative z-10 text-white max-w-4xl px-6">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 inline-block">
                        Events & Wedding
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold font-serif mb-6 leading-tight">
                        Momen Berharga <br className="hidden md:block" /> Dalam Keindahan Alam
                    </h1>
                    <p className="text-base md:text-xl font-light max-w-2xl mx-auto opacity-90 leading-relaxed md:leading-normal">
                        Dari pernikahan romantis hingga gathering perusahaan, kami menyediakan venue terbaik dengan panorama Rawa Pening yang tak terlupakan.
                    </p>
                </div>
            </section>

            {/* EVENT LISTING ENGINE */}
            <section className="max-w-7xl mx-auto px-4 pt-16 pb-32 relative z-20">
                <div className="flex flex-col items-start md:items-center lg:items-start text-left md:text-center lg:text-left mb-16">
                    <span className="text-eling-green font-black uppercase tracking-[0.4em] text-[10px] mb-4">Official Manifest</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-serif leading-none uppercase tracking-tighter">Event & Reservation Manifest</h2>
                    <div className="w-20 h-1.5 bg-eling-green mt-6 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-100 rounded-[2.5rem] h-[500px]"></div>
                        ))
                    ) : events.map((event) => {
                        const images = getImages(event);
                        return (
                            <div
                                key={event.id}
                                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50 hover:shadow-eling-green/10 hover:border-eling-green/20 transition-all duration-700 flex flex-col group relative"
                            >
                                {/* Card Image */}
                                <div className="relative h-72 overflow-hidden bg-gray-100">
                                    <img
                                        src={images[0]}
                                        alt={event.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                    {/* Category Badge */}
                                    <div className="absolute top-5 left-5">
                                        <span className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-eling-green shadow-sm">
                                            {event.category}
                                        </span>
                                    </div>

                                    {/* Image count badge */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg">
                                            +{images.length - 1} Foto
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 text-eling-red font-black text-[10px] mb-4 uppercase tracking-[0.2em]">
                                        <div className="w-7 h-7 rounded-lg bg-eling-red/5 flex items-center justify-center flex-shrink-0">
                                            <Calendar size={13} />
                                        </div>
                                        <span className="truncate">{event.date_info}</span>
                                    </div>

                                    <h3 className="text-xl font-black mb-3 font-serif text-gray-900 leading-tight group-hover:text-eling-green transition-colors duration-500 capitalize">
                                        {event.name}
                                    </h3>

                                    <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed flex-grow">
                                        {event.description}
                                    </p>

                                    <div className="pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">
                                                {event.price > 0 ? 'Harga Tiket' : (event.is_ticketed ? 'Tiket' : 'Informasi')}
                                            </span>
                                            <span className="font-black text-lg text-gray-900 truncate">
                                                {event.price > 0 
                                                    ? formatRupiah(event.price) 
                                                    : (event.is_ticketed ? 'Gratis' : 'Kontak')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => openDetail(event)}
                                            className={`flex items-center gap-2.5 ${event.price > 0 ? 'bg-eling-red hover:bg-red-800' : 'bg-eling-green hover:bg-green-800'} text-white font-black text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0 whitespace-nowrap`}
                                        >
                                            Lihat Detail <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!isLoading && events.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-gray-100">
                        <Calendar size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Event Mendatang</h3>
                        <p className="text-gray-500">Silakan hubungi tim kami untuk reservasi event privat Anda.</p>
                    </div>
                )}

                {/* Contact CTA */}
                <div className="mt-24 bg-eling-green rounded-[3rem] p-10 md:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 lg:w-2/3">
                        <span className="text-white/60 uppercase tracking-[0.3em] font-bold text-sm block mb-4">Plan Your Moment</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">Wujudkan Acara Impian Anda <br /> di Eling Bening</h2>
                        <p className="text-xl text-white/80 font-light max-w-xl">
                            Konsultasikan kebutuhan pernikahan, gathering, atau event spesial Anda dengan wedding planner dan event coordinator profesional kami.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/contact" className="bg-white text-eling-green font-black py-5 px-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm uppercase tracking-widest flex items-center justify-center gap-3 group">
                            Hubungi Tim Event <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── EVENT DETAIL MODAL ─── */}
            {selectedEvent && (() => {
                const images = getImages(selectedEvent);
                return createPortal(
                    <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6" style={{ isolation: 'isolate' }}>
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm -z-10"
                            onClick={closeDetail}
                        />

                        {/* Modal Panel */}
                        <div className="relative z-10 bg-white w-full md:max-w-4xl max-h-[92vh] md:max-h-[88vh] rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
                            {/* Close button */}
                            <button
                                onClick={closeDetail}
                                className="absolute top-5 right-5 z-20 w-10 h-10 bg-black/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Image Gallery */}
                            <div className="relative h-64 md:h-80 bg-gray-900 flex-shrink-0">
                                <img
                                    src={images[activeImageIndex]}
                                    alt={selectedEvent.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                {/* Image Nav */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImageIndex(i => (i - 1 + images.length) % images.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex(i => (i + 1) % images.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        {/* Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveImageIndex(i)}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-white w-5' : 'bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Category badge */}
                                <div className="absolute bottom-5 left-5">
                                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                                        {selectedEvent.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-8 md:p-10">
                                    {/* Title + Price */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div className="flex-1">
                                            <h2 className="text-2xl md:text-3xl font-black font-serif text-gray-900 capitalize leading-tight mb-2">
                                                {selectedEvent.name}
                                            </h2>
                                            <div className="flex items-center gap-2 text-eling-red font-black text-xs uppercase tracking-widest">
                                                <Calendar size={13} />
                                                {selectedEvent.date_info}
                                            </div>
                                        </div>
                                        <div className="bg-eling-green/5 border border-eling-green/20 rounded-2xl px-6 py-4 text-center flex-shrink-0">
                                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">
                                                {selectedEvent.price > 0 ? 'Harga Tiket' : (selectedEvent.is_ticketed ? 'Tiket Masuk' : 'Info Event')}
                                            </p>
                                            <p className="text-xl font-black text-eling-green">
                                                {selectedEvent.price > 0 
                                                    ? formatRupiah(selectedEvent.price) 
                                                    : (selectedEvent.is_ticketed ? 'Gratis' : 'Kontak Kami')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info Chips */}
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                            <MapPin size={14} className="text-eling-green" />
                                            <span className="text-xs font-black text-gray-600">Eling Bening, Ambarawa</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                            <Users size={14} className="text-eling-green" />
                                            <span className="text-xs font-black text-gray-600">Kapasitas Besar</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                            <Star size={14} className="text-amber-400" />
                                            <span className="text-xs font-black text-gray-600">Venue Premium</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-8">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Deskripsi Event</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {selectedEvent.description}
                                        </p>
                                    </div>

                                    {/* Highlights */}
                                    <div className="bg-eling-green/5 border border-eling-green/10 rounded-2xl p-6 mb-8">
                                        <h4 className="text-xs font-black text-eling-green uppercase tracking-widest mb-4">Yang Sudah Termasuk</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['Pemandangan Rawa Pening', 'Tim Event Profesional', 'Area Parkir Luas', 'Dokumentasi Dasar', 'Dekorasi Venue', 'Koordinasi Hari-H'].map(item => (
                                                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                                                    <CheckCircle size={15} className="text-eling-green flex-shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {selectedEvent.is_ticketed ? (
                                            <Link
                                                to={`/events/${selectedEvent.id}/book`}
                                                onClick={closeDetail}
                                                className="flex-1 bg-eling-red text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-red-900 hover:scale-[1.02] hover:shadow-2xl hover:shadow-eling-red/40 transition-all duration-300 text-center flex items-center justify-center gap-2 active:scale-95 group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <CreditCard size={16} />
                                                </div>
                                                {selectedEvent.price > 0 ? 'Pesan Tiket Sekarang' : 'Dapatkan Tiket Gratis'}
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/contact"
                                                onClick={closeDetail}
                                                className="flex-1 bg-eling-green text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-green-900 hover:scale-[1.02] hover:shadow-2xl hover:shadow-eling-green/40 transition-all duration-300 text-center flex items-center justify-center gap-2 active:scale-95 group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Phone size={16} />
                                                </div>
                                                Konsultasi Gratis
                                            </Link>
                                        )}
                                        <Link
                                            to="/contact"
                                            onClick={closeDetail}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 font-black text-sm uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-white hover:border-eling-green hover:text-eling-green hover:scale-[1.02] hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center gap-2 active:scale-95 group"
                                        >
                                            <Mail size={16} className="group-hover:rotate-12 transition-transform" /> Kirim Pertanyaan
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                );
            })()}
        </div>
    );
}
