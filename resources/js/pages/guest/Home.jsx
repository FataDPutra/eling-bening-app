import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useContent } from '../../context/ContentContext';
import {
    Mountain, Utensils, BedDouble, Waves, MapPin,
    Phone, Mail, Star,
    ArrowRight, Camera, Users, Calendar, Ticket, ArrowUpRight, Loader2, X, Check, ChevronLeft, ChevronRight
} from 'lucide-react';

const ReviewCard = ({ item, setSelectedImage }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const media = item.media || [];
    const isPlaceholder = media.length === 0;

    return (
        <div className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-full">
            {/* Media Slider */}
            <div className="relative h-72 sm:h-80 overflow-hidden">
                {!isPlaceholder ? (
                    <>
                        <div 
                            className="flex h-full transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {media.map((url, idx) => {
                                const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
                                return (
                                    <div key={idx} className="w-full h-full flex-shrink-0 relative cursor-pointer" onClick={() => setSelectedImage(url)}>
                                        {isVideo ? (
                                            <div className="w-full h-full relative">
                                                <video 
                                                    src={url} 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
                                                        <i className="fas fa-play ml-1"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img 
                                                src={url} 
                                                className="w-full h-full object-cover" 
                                                alt={`Review gallery ${idx}`} 
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Dots Pagination */}
                        {media.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full z-10">
                                {media.map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Navigation Arrows */}
                        {media.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev > 0 ? prev - 1 : media.length - 1)); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev < media.length - 1 ? prev + 1 : 0)); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-[#fdfdfd] flex items-center justify-center relative overflow-hidden group-hover:bg-eling-green/[0.02] transition-colors duration-700">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-eling-green/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-eling-red/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-eling-green/20 group-hover:text-eling-green/40 group-hover:scale-110 transition-all duration-700">
                                <Mountain size={40} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Experience Nature</span>
                        </div>
                        
                        {/* Large Quote Mark Background */}
                        <div className="absolute -bottom-4 -right-2 text-gray-50 opacity-10 font-serif text-[12rem] select-none leading-none">
                            &rdquo;
                        </div>
                    </div>
                )}
                
                {/* Rating Badge */}
                <div className="absolute top-6 left-6 flex gap-0.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl z-10">
                    {[...Array(item.rating)].map((_, r) => <Star key={`r-${r}`} size={14} fill="#FACC15" className="text-yellow-400" />)}
                    {[...Array(5 - item.rating)].map((_, r) => <Star key={`e-${r}`} size={14} className="text-gray-200" />)}
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <div className="flex-1">
                    <p className="text-gray-600 italic font-light leading-relaxed text-lg mb-8 group-hover:text-gray-900 transition-colors line-clamp-3">
                        &ldquo;{item.comment || 'Pengalaman yang sangat luar biasa di Eling Bening!'}&rdquo;
                    </p>
                </div>

                <div className="flex items-center gap-4 border-t border-gray-100 pt-6 relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-eling-green bg-green-50 shadow-inner group-hover:ring-2 group-hover:ring-eling-green/20 transition-all duration-500">
                        {item.user?.profile_photo_path ? (
                            <img src={`/storage/${item.user.profile_photo_path}`} className="w-full h-full object-cover" alt={item.user_name} />
                        ) : (
                            <span className="text-xl">{item.user_name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 group-hover:text-eling-green transition-colors">{item.user_name}</p>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                <Check size={10} className="text-white" />
                            </div>
                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Verified Guest</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const { content, isLoading: contentLoading } = useContent();
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const sliderRef = useRef(null);

    // Body Lock when modal open
    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden'; // Extra safety
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        }
        return () => { 
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, [selectedImage]);

    // Triple the reviews for infinite loop effect
    const infiniteReviews = [...reviews, ...reviews, ...reviews];

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    const scroll = (direction) => {
        const itemWidth = sliderRef.current.offsetWidth / (window.innerWidth < 768 ? 1 : 3);
        const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    // Auto loop logic
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider || reviews.length === 0) return;

        const handleScroll = () => {
            const { scrollLeft, scrollWidth, offsetWidth } = slider;
            if (scrollLeft <= 0) {
                slider.scrollLeft = scrollWidth / 3;
            } else if (scrollLeft >= (scrollWidth * 2) / 3) {
                slider.scrollLeft = scrollWidth / 3;
            }
        };

        slider.addEventListener('scroll', handleScroll);
        // Initial position in the middle set
        slider.scrollLeft = slider.scrollWidth / 3;

        return () => slider.removeEventListener('scroll', handleScroll);
    }, [reviews]);

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

        const fetchReviews = async () => {
            try {
                const { data } = await axios.get('/api/reviews');
                if (Array.isArray(data) && data.length > 0) {
                    const minRating = parseInt(content.home.testimonialMinRating || 1);
                    const filtered = data.filter(r => r.rating >= minRating);
                    setReviews(filtered.slice(0, 6)); // Display up to 6 reviews on Home
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };

        fetchEvents();
        fetchReviews();
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
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-up {
                    animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* 1. Hero Section (Above the Fold) */}
            <section id="hero" className="relative min-h-screen md:h-screen flex items-center justify-center text-center overflow-hidden pt-24 pb-20 md:pt-20 md:pb-0">
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
                        <Link to="/ticketing" className="w-full sm:w-auto bg-eling-red hover:bg-red-800 text-white font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 shadow-2xl hover:shadow-red-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group">
                            {content.home.ctaPrimary} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                        <Link to="/rooms" className="w-full sm:w-auto backdrop-blur-md bg-white/10 hover:bg-white/30 text-white border border-white/30 font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                            {content.home.ctaSecondary}
                        </Link>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="mt-8 md:mt-20 w-full max-w-4xl opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                        <div className="grid grid-cols-3 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-full p-2 md:p-4 lg:p-6 gap-0 shadow-2xl">
                            <div className="md:border-r border-white/10 flex flex-col items-center px-2 md:px-8 py-2 md:py-2">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4">
                                    <MapPin size={16} className="md:size-6 text-green-400" />
                                </div>
                                <span className="text-[7px] md:text-xs text-white/60 uppercase tracking-widest mb-0.5 md:mb-1">Lokasi</span>
                                <span className="text-[9px] md:text-base font-bold whitespace-nowrap">Ambarawa</span>
                            </div>
                            <div className="border-x md:border-x-0 md:border-r border-white/10 flex flex-col items-center px-2 md:px-8 py-2 md:py-2">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4">
                                    <Calendar size={16} className="md:size-6 text-green-400" />
                                </div>
                                <span className="text-[7px] md:text-xs text-white/60 uppercase tracking-widest mb-0.5 md:mb-1">Jam Buka</span>
                                <span className="text-[9px] md:text-base font-bold whitespace-nowrap">08:00-18:00</span>
                            </div>
                            <div className="flex flex-col items-center px-2 md:px-8 py-2 md:py-2">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4">
                                    <div className="flex gap-0.5 md:gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} md:size={14} fill="#4ade80" className="text-green-400" />)}
                                    </div>
                                </div>
                                <span className="text-[7px] md:text-xs text-white/60 uppercase tracking-widest mb-0.5 md:mb-1">Rating</span>
                                <span className="text-[9px] md:text-base font-bold whitespace-nowrap">4.8 (5k+)</span>
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
                        <Link to="/about" className="mt-12 inline-flex items-center gap-3 bg-eling-green text-white font-bold py-4 px-10 rounded-full hover:bg-green-800 transition-all duration-300 shadow-xl hover:shadow-emerald-900/20 hover:scale-105 active:scale-95 group">
                            Selengkapnya <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
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
                            <div key={i} className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 flex flex-col items-start gap-6">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green group-hover:bg-white group-hover:ring-2 group-hover:ring-eling-green/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-eling-green transition-colors duration-300">{item.title}</h3>
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
                            className="md:col-span-2 md:row-span-2 h-64 md:h-auto relative group overflow-hidden rounded-3xl cursor-pointer"
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
                            className="relative group overflow-hidden rounded-3xl cursor-pointer h-64 md:h-auto"
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
                            className="relative group overflow-hidden rounded-3xl cursor-pointer h-64 md:h-auto"
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
                            className="md:col-span-2 relative group overflow-hidden rounded-3xl cursor-pointer h-64 md:h-auto"
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
                        <Link to="/gallery" className="inline-flex items-center gap-2 font-bold text-eling-green hover:text-green-800 transition-all duration-300 group">
                            <span className="relative overflow-hidden inline-block py-1">
                                Lihat Semua Galeri
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-eling-green group-hover:w-full transition-all duration-500"></span>
                            </span>
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
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
                    <div className="flex justify-between items-center mb-10">
                        <div className="text-left">
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">{content.home.testimonialBadge}</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">{content.home.testimonialTitle}</h2>
                        </div>
                        {reviews.length > 0 && (
                            <div className="flex gap-4">
                                <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-eling-green hover:border-eling-green hover:shadow-lg transition-all active:scale-95">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-eling-green hover:border-eling-green hover:shadow-lg transition-all active:scale-95">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div 
                        ref={sliderRef}
                        className={`overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none scroll-smooth flex snap-x snap-mandatory py-10 -my-10`}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    >
                        <div className="flex w-fit">
                            {reviews.length > 0 ? (
                                infiniteReviews.map((item, i) => (
                                    <div key={i} className="w-[85vw] md:w-[45vw] lg:w-[28vw] flex-shrink-0 px-3 snap-center">
                                        <ReviewCard item={item} setSelectedImage={setSelectedImage} />
                                    </div>
                                ))
                            ) : (
                                (content.home.testimonials || []).map((item, i) => (
                                    <div key={i} className="w-[85vw] md:w-[45vw] lg:w-[28vw] flex-shrink-0 px-3 snap-center">
                                        {/* Fallback card content remains same */}
                                        <div className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-full">
                                            <div className="relative h-72 overflow-hidden bg-gray-100">
                                                <img 
                                                    src={["/images/generated/hero.png", "/images/generated/room.png", "/images/generated/restaurant.png"][i % 3]} 
                                                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                                                    alt="Default review background" 
                                                />
                                                <div className="absolute top-6 left-6 flex gap-0.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl">
                                                    {[...Array(item.rating)].map((_, r) => <Star key={r} size={14} fill="#FACC15" className="text-yellow-400" />)}
                                                </div>
                                            </div>
                                            <div className="p-8 flex flex-col flex-1">
                                                <p className="text-gray-600 italic font-light leading-relaxed text-lg mb-8 group-hover:text-gray-900 transition-colors line-clamp-3">"{item.quote}"</p>
                                                <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center font-bold text-eling-green shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-eling-green transition-colors">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Verified Guest</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
                        <Link to="/profile" className="bg-eling-green text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:bg-green-700 hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-300">
                            Tulis Review
                        </Link>
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

            {/* Lightbox Modal rendered via Portal */}
            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10"
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-300 z-[60] group"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {selectedImage.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) ? (
                            <video 
                                src={selectedImage} 
                                className="max-w-full max-h-[80vh] md:max-h-[85vh] rounded-2xl shadow-2xl animate-scale-up" 
                                controls 
                                autoPlay
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <img 
                                src={selectedImage} 
                                className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scale-up border-4 border-white/5" 
                                alt="Gallery Preview" 
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 opacity-0 md:opacity-100">
                           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Eling Bening Preview</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
