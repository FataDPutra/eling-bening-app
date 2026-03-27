import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useContent } from '../../context/ContentContext';
import {
    Mountain, Utensils, BedDouble, Waves, MapPin,
    Phone, Mail, Star,
    ArrowRight, Camera, Users, Calendar, Ticket, ArrowUpRight, Loader2, X
} from 'lucide-react';

export default function Home() {
    const { content, isLoading: contentLoading } = useContent();
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/api/events');
                // Priority: Latest 2 active events
                setEvents(data.filter(e => e.is_active).slice(0, 2));
            } catch (error) {
                console.error('Failed to fetch events for home:', error);
            } finally {
                setIsLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    if (contentLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );
    return (
        <div className="animate-fade-in overflow-x-hidden">
            <style>{`
                .hero-gradient {
                    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3));
                }
                .section-container {
                    padding: 6rem 1.5rem;
                }
                @media (min-width: 1024px) {
                    .section-container { padding: 10rem 6rem; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .hover-scale {
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-scale:hover {
                    transform: scale(1.03);
                }
                .font-serif {
                    font-family: 'Playfair Display', serif;
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                }
            `}</style>

            {/* 1. Hero Section (Above the Fold) */}
            <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden pt-20">
                <img src={content.home.heroImage || "/images/generated/hero.png"} alt="Eling Bening View" className="absolute inset-0 w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
                <div className="relative z-10 text-white max-w-5xl px-4 flex flex-col items-center">
                    <div className="flex justify-center mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <span className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-[0.3em] uppercase">
                            {content.home.heroBadge}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 font-serif leading-[1.1] opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {content.home.heroTitleLine1} <br />
                        <span className="text-eling-green drop-shadow-[0_2px_10px_rgba(46,125,50,0.4)]">{content.home.heroTitleLine2}</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-12 font-light max-w-2xl mx-auto leading-relaxed opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        {content.home.heroSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <Link to="/ticketing" className="w-full sm:w-auto bg-eling-red hover:bg-red-800 text-white font-bold py-5 px-12 rounded-full text-lg transition shadow-2xl flex items-center justify-center gap-3 group">
                            {content.home.ctaPrimary} <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                        </Link>
                        <Link to="/rooms" className="w-full sm:w-auto backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold py-5 px-12 rounded-full text-lg transition shadow-2xl flex items-center justify-center gap-3">
                            {content.home.ctaSecondary}
                        </Link>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="mt-20 w-full max-w-4xl opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex flex-wrap justify-center md:grid md:grid-cols-3 bg-white/20 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 lg:p-8 gap-8 md:gap-0 shadow-2xl">
                            <div className="md:border-r border-white/10 flex flex-col items-center px-8">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <MapPin size={24} className="text-green-400" />
                                </div>
                                <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Lokasi</span>
                                <span className="text-sm md:text-base font-bold">Ambarawa, Semarang</span>
                            </div>
                            <div className="md:border-r border-white/10 flex flex-col items-center px-8">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Calendar size={24} className="text-green-400" />
                                </div>
                                <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Jam Buka</span>
                                <span className="text-sm md:text-base font-bold">08:00 - 18:00 WIB</span>
                            </div>
                            <div className="flex flex-col items-center px-8">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#4ade80" className="text-green-400" />)}
                                    </div>
                                </div>
                                <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Rating</span>
                                <span className="text-sm md:text-base font-bold">4.8 (5k+ Review)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Tentang Eling Bening (Short Introduction) */}
            <section id="about" className="section-container bg-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                    <div className="lg:w-1/2 relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-eling-green opacity-5 rounded-full blur-3xl"></div>
                        <img src="/images/generated/resort.png" alt="Eling Bening Landscape" className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover relative z-10" />
                        <div className="absolute -bottom-8 -right-8 glass-card p-8 rounded-2xl shadow-xl z-20 max-w-[240px]">
                            <p className="text-eling-green font-bold text-3xl mb-1">100%</p>
                            <p className="text-gray-800 font-bold uppercase tracking-widest text-xs">Pemandangan Alamiah</p>
                            <p className="text-gray-500 text-sm mt-3 leading-relaxed">Keindahan pegunungan Merbabu & Ungaran di depan mata Anda.</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-6">{content.home.discoveryBadge}</span>
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 font-serif leading-tight text-gray-900">
                            {content.home.discoveryTitle}
                        </h2>
                        <div className="space-y-6 text-gray-600 leading-relaxed text-lg lg:text-xl font-light">
                            <p>
                                {content.home.discoveryText}
                            </p>
                        </div>
                        <Link to="/about" className="mt-12 inline-flex items-center gap-3 bg-eling-green text-white font-bold py-4 px-10 rounded-full hover:bg-green-800 transition shadow-xl group">
                            Selengkapnya <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Highlight Fasilitas / Aktivitas */}
            <section id="highlights" className="section-container bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">Activities</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Pengalaman Menarik</h2>
                        </div>
                        <p className="text-gray-500 max-w-md">Berbagai fasilitas dan aktivitas yang siap melengkapi hari libur Anda bersama keluarga.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Mountain size={32} />, title: "Panorama Alam", desc: "Nikmati pemandangan 360 derajat Danau Rawa Pening dari spot terbaik." },
                            { icon: <Utensils size={32} />, title: "Restoran & Cafe", desc: "Sajian kuliner khas Nusantara dan Internasional dengan view pegunungan." },
                            { icon: <Camera size={32} />, title: "Spot Foto Instagramable", desc: "Puluhan spot foto unik dengan latar alam yang sangat mempesona." },
                            { icon: <Waves size={32} />, title: "Kolam Renang Infinity", desc: "Kolam renang mewah yang seolah menyatu dengan cakrawala pegunungan." },
                            { icon: <Calendar size={32} />, title: "Event & Wedding", desc: "Venue outdoor romantis untuk pernikahan atau acara gathering perusahaan." },
                            { icon: <Users size={32} />, title: "Family Recreation", desc: "Wahana bermain anak dan area outbound yang aman serta menyenangkan." }
                        ].map((item, i) => (
                            <div key={i} className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition duration-500 border border-gray-100 flex flex-col items-start gap-6">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green group-hover:bg-eling-green group-hover:text-white transition duration-500">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl mb-4 text-gray-900">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-light">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Galeri Wisata */}
            <section id="gallery" className="section-container bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">Gallery</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6">Momen Indah di Eling Bening</h2>
                        <div className="w-24 h-1 bg-eling-green mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[800px]">
                        <div 
                            className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl cursor-pointer"
                            onClick={() => setSelectedImage("/images/generated/hero.png")}
                        >
                            <img src="/images/generated/hero.png" className="absolute inset-0 w-full h-full object-cover hover-scale" alt="Gallery 1" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition duration-500">
                                    <Camera className="text-white" size={32} />
                                </div>
                            </div>
                        </div>
                        <div 
                            className="relative group overflow-hidden rounded-3xl cursor-pointer"
                            onClick={() => setSelectedImage("/images/generated/restaurant.png")}
                        >
                            <img src="/images/generated/restaurant.png" className="absolute inset-0 w-full h-full object-cover hover-scale" alt="Gallery 2" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition duration-500">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                        <div 
                            className="relative group overflow-hidden rounded-3xl cursor-pointer"
                            onClick={() => setSelectedImage("/images/generated/event.png")}
                        >
                            <img src="/images/generated/event.png" className="absolute inset-0 w-full h-full object-cover hover-scale" alt="Gallery 3" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition duration-500">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                        <div 
                            className="md:col-span-2 relative group overflow-hidden rounded-3xl cursor-pointer"
                            onClick={() => setSelectedImage("/images/generated/resort.png")}
                        >
                            <img src="/images/generated/resort.png" className="absolute inset-0 w-full h-full object-cover hover-scale" alt="Gallery 4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition duration-500">
                                    <Camera className="text-white" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/gallery" className="inline-flex items-center gap-2 font-bold text-eling-green hover:underline underline-offset-8">
                            Lihat Semua Galeri <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. Event & Promo */}
            <section id="events" className="section-container bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">What's On</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Event & Promo Terbaru</h2>
                        </div>
                        <Link to="/events" className="hidden md:flex items-center gap-1 font-bold text-gray-400 hover:text-eling-green transition">
                            Lihat Semua <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {isLoadingEvents ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-200 h-[400px] rounded-3xl"></div>
                            ))
                        ) : events.length > 0 ? (
                            events.map((event, idx) => (
                                <div key={event.id} className="group relative h-[400px] rounded-3xl overflow-hidden shadow-xl">
                                    <img 
                                        src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image) || '/images/generated/event.png'} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                        alt={event.name} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 flex flex-col justify-end text-left">
                                        <div className={`${idx === 0 ? 'bg-eling-green' : 'bg-eling-red'} text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-md w-fit mb-4`}>
                                            {idx === 0 ? 'Latest Event' : 'Featured Highlight'}
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-2">{event.name}</h3>
                                        <p className="text-gray-300 font-light mb-6 line-clamp-2">{event.description}</p>
                                        <Link to="/events" className="text-white font-bold flex items-center gap-2 group/btn">
                                            Detail Event <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Belum Ada Event Aktif Saat Ini</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 7. Testimoni Pengunjung */}
            <section id="testimonials" className="section-container bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center mb-16 relative z-10">
                        <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">{content.home.testimonialBadge}</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">{content.home.testimonialTitle}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(content.home.testimonials || []).map((item, i) => (
                            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
                                <div className="flex gap-1">
                                    {[...Array(item.rating)].map((_, r) => <Star key={r} size={16} fill="#FACC15" className="text-yellow-400" />)}
                                </div>
                                <p className="text-gray-600 italic font-light leading-relaxed">"{item.quote}"</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-eling-green bg-green-50">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-400">Pengunjung Terverifikasi</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 bg-white/50 backdrop-blur-sm rounded-[3rem] p-10 border border-white">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-gray-900 mb-1">4.8/5</span>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="#FACC15" className="text-yellow-400" />)}
                            </div>
                            <span className="text-gray-400 text-sm">Berdasarkan 5.230 Review Google</span>
                        </div>
                        <div className="h-px w-24 bg-gray-200 md:h-24 md:w-px"></div>
                        <div className="text-center md:text-left">
                            <p className="font-bold text-2xl text-gray-900 mb-2">Puas dengan Layanan Kami?</p>
                            <p className="text-gray-500 font-light">Berikan ulasan Anda dan bantu kami menjadi lebih baik.</p>
                        </div>
                        <button className="bg-eling-green text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:bg-green-800 transition">
                            Tulis Review
                        </button>
                    </div>
                </div>
            </section>

            {/* 8. Informasi Lokasi */}
            <section id="location" className="section-container bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="lg:w-2/5">
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-6">Location</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-12 leading-tight">Temukan Jalan Menuju Kami</h2>

                            <div className="space-y-10">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green flex-shrink-0">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Alamat Lengkap</h4>
                                        <p className="text-gray-500 leading-relaxed">
                                            Jl. Sarjono, Bauman, Ambarawa, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50614
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green flex-shrink-0">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Jam Operasional</h4>
                                        <p className="text-gray-500">Senin - Minggu (Setiap Hari)</p>
                                        <p className="text-gray-900 font-bold">08:00 - 18:00 WIB</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green flex-shrink-0">
                                        <Phone size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Hubungi Kami</h4>
                                        <p className="text-gray-500">+62 811-2345-6789</p>
                                        <p className="text-gray-500">info@elingbening.com</p>
                                    </div>
                                </div>
                            </div>

                            <a href="https://maps.app.goo.gl/xxx" target="_blank" rel="noreferrer" className="mt-12 inline-flex items-center gap-3 bg-gray-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-gray-800 transition shadow-xl shadow-gray-200">
                                <MapPin size={20} /> Lihat Rute di Maps
                            </a>
                        </div>

                        <div className="lg:w-3/5">
                            <div className="h-[400px] md:h-[600px] w-full bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15830.34757657279!2d110.4045!3d-7.2657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a783783a3371b%3A0x6a0a09e075c3f6e!2sEling%20Bening!5e0!3m2!1sen!2sid!4v1700000000000"
                                    className="w-full h-full border-0 transition duration-1000"
                                    allowFullScreen={false}
                                    loading="lazy">
                                </iframe>
                                <div className="absolute top-6 left-6 right-6 lg:left-auto lg:w-72 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white">
                                    <h5 className="font-bold text-gray-900 mb-2">Tips Menuju Lokasi</h5>
                                    <p className="text-xs text-gray-500 leading-relaxed">Gunakan rute jalur utama Ambarawa untuk akses jalan yang lebih lebar dan nyaman bagi kendaraan besar/bus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. CTA Section (Call To Action) */}
            <section id="final-cta" className="relative py-32 px-6 flex items-center justify-center text-center">
                <img src={content.home.finalCtaImage || "/images/generated/hero.png"} className="absolute inset-0 w-full h-full object-cover grayscale" alt="CTA BG" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 max-w-4xl">
                    <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 font-serif leading-tight">
                        {content.home.finalCtaTitle}
                    </h2>
                    <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        {content.home.finalCtaSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/ticketing" className="bg-white text-eling-green hover:bg-green-50 font-bold py-5 px-12 rounded-full text-xl transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-white/20">
                            {content.home.finalCtaPrimary}
                        </Link>
                        <Link to="/contact" className="bg-eling-red text-white hover:bg-red-800 font-bold py-5 px-12 rounded-full text-xl transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-red-900/40">
                            {content.home.finalCtaSecondary}
                        </Link>
                    </div>
                    <button className="mt-12 text-white font-bold flex items-center gap-2 mx-auto hover:underline underline-offset-8 transition group">
                        <Phone size={20} className="group-hover:rotate-12 transition" /> Hubungi Customer Service
                    </button>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-10 right-10 text-white/50 hover:text-white transition group flex flex-col items-center gap-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition">
                            <X size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                    </button>
                    
                    <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
                        <img 
                            src={selectedImage} 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(46,125,50,0.2)] animate-slide-up" 
                            alt="Gallery Preview" 
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium italic tracking-wide">
                           Eling Bening Official Gallery Preview
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
