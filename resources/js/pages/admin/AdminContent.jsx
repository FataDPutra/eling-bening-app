import React, { useState } from 'react';
import { Save, Home as HomeIcon, Info, Phone as PhoneIcon, PanelLeftClose, PanelLeftOpen, Mountain, Utensils, BedDouble, Waves, MapPin, Phone, Mail, Layout, Eye, Sparkles, Smartphone, Tablet, Monitor, Star, ArrowRight, Camera, Users, Calendar, ArrowUpRight, CheckCircle, X, UserCircle, Menu, ChevronDown, Trophy, Gamepad2, Music, Zap, Heart, Sun, Compass, Cloud, Wind, Trees, Flame, Tent, Building2, DoorOpen, UtensilsCrossed, Coffee, Pizza, GlassWater, Wine, IceCream, Cake, Droplet, Fish, Anchor, Bike, Dumbbell, Target, Video, Stethoscope, Brain, Flower, ShieldCheck, Car, Bus, ParkingCircle, Wifi, Lock, Lightbulb, Puzzle, Mic2, Baby, Accessibility, CigaretteOff, Hand, Trash2, Venus, Mars, Bath, ShowerHead, Toilet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent } from '../../context/ContentContext';

// High-fidelity preview component that matches Guest pages exactly
const PreviewRenderer = ({ activeTab, content, previewDevice, onTabChange }) => {
    const [previewMobileMenuOpen, setPreviewMobileMenuOpen] = React.useState(false);
    const styles = `
        .hero-gradient { background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)); }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
        .font-serif { font-family: 'Playfair Display', serif !important; }
        .bg-eling-green { background-color: #2E7D32 !important; }
        .text-eling-green { color: #2E7D32 !important; }
        .bg-eling-red { background-color: #C62828 !important; }
        .text-eling-red { color: #C62828 !important; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 1 !important; }
        .section-container { padding: 4rem 1.5rem; }
        @media (min-width: 1024px) { .section-container { padding: 10rem 6rem; } }
        .hover-scale { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-scale:hover { transform: scale(1.03); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Responsive Simulation Logic */
        .preview-container.mobile h1 { font-size: 2.25rem !important; line-height: 1.2 !important; }
        .preview-container.mobile h2 { font-size: 1.8rem !important; line-height: 1.3 !important; }
        .preview-container.tablet h1 { font-size: 3.75rem !important; line-height: 1.1 !important; }
        .preview-container.tablet h2 { font-size: 3rem !important; }

        .preview-container.mobile .flex-row-mobile-fix { flex-direction: column !important; gap: 2rem !important; }
        .preview-container.mobile .grid-cols-mobile-fix { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .preview-container.mobile .hidden-mobile-fix { display: none !important; }
        .preview-container.mobile .section-container { padding: 4rem 1.5rem !important; }
        .preview-container.mobile .hero-min-height { min-height: auto !important; padding-top: 6rem !important; padding-bottom: 4rem !important; }
        .preview-container.mobile .text-center-mobile { text-align: center !important; }

        .preview-container.tablet .flex-row-tablet-fix { flex-direction: column !important; gap: 3rem !important; }
        .preview-container.tablet .grid-cols-tablet-fix { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .preview-container.tablet .section-container { padding: 6rem 3rem !important; }
        .preview-container.tablet .hidden-mobile-fix { display: grid !important; }
        .preview-container.tablet .text-left-tablet { text-align: left !important; }
        
        /* Force mobile layout for specific elements in simulation */
        .preview-container.mobile .lg-nav-menu, .preview-container.tablet .lg-nav-menu { display: none !important; }
        .preview-container.mobile .burger-icon, .preview-container.tablet .burger-icon { display: block !important; }
        .preview-container:not(.mobile):not(.tablet) .burger-icon { display: none !important; }
        
        .preview-container.mobile .footer-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; gap: 3rem !important; }
        .preview-container.tablet .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 3rem !important; }
        
        /* Override specific component breakpoints */
        .preview-container.mobile .about-flex, .preview-container.tablet .about-flex { flex-direction: column !important; }
        .preview-container.mobile .facilities-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .preview-container.tablet .facilities-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        
        /* Desktop Forces: Ensure 'sama persis' guest layout even if browser window is narrow */
        .preview-container:not(.mobile):not(.tablet) .about-flex { flex-direction: row !important; }
        .preview-container:not(.mobile):not(.tablet) .facilities-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .preview-container:not(.mobile):not(.tablet) .footer-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .preview-container:not(.mobile):not(.tablet) .lg-nav-menu { display: flex !important; }
        .preview-container:not(.mobile):not(.tablet) .hidden-mobile-fix { display: grid !important; }

        .preview-container.mobile .image-aspect-fix { aspect-ratio: 1/1 !important; }
    `;

    const ReviewCardPreview = ({ item }) => (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-8 h-full">
            <div className="flex-1">
                <div className="flex gap-0.5 mb-6">
                    {[...Array(item.rating)].map((_, r) => <Star key={r} size={14} fill="#FACC15" className="text-yellow-400" />)}
                </div>
                <p className="text-gray-600 italic font-light leading-relaxed text-lg mb-8">&ldquo;{item.quote}&rdquo;</p>
            </div>
            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center font-bold text-eling-green shadow-inner">
                    {item.name.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Verified Guest</p>
                </div>
            </div>
        </div>
    );

    if (activeTab === 'home') {
        const h = content.home;
        return (
            <div className={`preview-container font-sans text-gray-900 overflow-x-hidden bg-white ${previewDevice}`}>
                <style>{styles}</style>
                {/* 1. Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center overflow-hidden hero-min-height px-4">
                    <img src={h.heroImage || "/images/generated/hero.png"} alt="Hero" className="absolute inset-0 w-full h-full object-cover scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
                    <div className="relative z-10 text-white max-w-5xl px-4 flex flex-col items-center">
                        <div className="flex justify-center mb-6 animate-slide-up">
                            <span className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-[0.3em] uppercase">
                                {h.heroBadge}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 font-serif leading-[1.1] animate-slide-up">
                            {h.heroTitleLine1} <br />
                            <span className="text-eling-green drop-shadow-[0_2px_10px_rgba(46,125,50,0.4)]">{h.heroTitleLine2}</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-12 font-light max-w-2xl mx-auto leading-relaxed animate-slide-up">
                            {h.heroSubtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
                            <div className="w-full sm:w-auto bg-eling-red text-white font-bold py-5 px-12 rounded-full text-lg shadow-2xl flex items-center justify-center gap-3">
                                {h.ctaPrimary} <ArrowRight size={20} />
                            </div>
                            <div className="w-full sm:w-auto backdrop-blur-md bg-white/10 text-white border border-white/30 font-bold py-5 px-12 rounded-full text-lg shadow-2xl">
                                {h.ctaSecondary}
                            </div>
                        </div>

                        {/* Quick Info Bar */}
                        <div className="mt-20 w-full max-w-4xl animate-slide-up hidden-mobile-fix">
                            <div className="grid grid-cols-3 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-full p-6 gap-0 shadow-2xl">
                                <div className="border-r border-white/10 flex flex-col items-center px-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <MapPin size={24} className="text-green-400" />
                                    </div>
                                    <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Lokasi</span>
                                    <span className="text-base font-bold whitespace-nowrap">Ambarawa</span>
                                </div>
                                <div className="border-r border-white/10 flex flex-col items-center px-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Calendar size={24} className="text-green-400" />
                                    </div>
                                    <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Jam Buka</span>
                                    <span className="text-base font-bold whitespace-nowrap">08:00 - 18:00</span>
                                </div>
                                <div className="flex flex-col items-center px-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#4ade80" className="text-green-400" />)}
                                        </div>
                                    </div>
                                    <span className="text-xs text-white/60 uppercase tracking-widest mb-1">Rating</span>
                                    <span className="text-base font-bold whitespace-nowrap">4.8 (5k+)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Tentang Eling Bening Section */}
                <section className="section-container bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 about-flex">
                        <div className="lg:w-1/2 relative text-center-mobile text-left-tablet">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-eling-green opacity-5 rounded-full blur-3xl"></div>
                            <img src="/images/generated/resort.png" alt="Landscape" className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover relative z-10" />
                        </div>
                        <div className="lg:w-1/2 text-center-mobile text-left-tablet">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">{h.discoveryBadge}</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-8">{h.discoveryTitle}</h2>
                            <p className="text-gray-600 leading-relaxed mb-10 text-lg italic">
                                {h.discoveryText}
                            </p>
                            <div className="absolute -bottom-8 -right-8 glass-card p-8 rounded-2xl shadow-xl z-20 max-w-[240px]">
                                <p className="text-eling-green font-bold text-3xl mb-1">100%</p>
                                <p className="text-gray-800 font-bold uppercase tracking-widest text-xs">Pemandangan Alamiah</p>
                            </div>
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-6">{h.discoveryBadge}</span>
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 font-serif leading-tight text-gray-900">{h.discoveryTitle}</h2>
                            <p className="text-gray-600 text-lg lg:text-xl font-light leading-relaxed mb-8">{h.discoveryText}</p>
                            <div className="inline-flex items-center gap-3 bg-eling-green text-white font-bold py-4 px-10 rounded-full shadow-xl">
                                Selengkapnya <ArrowUpRight size={20} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Highlight Fasilitas Section */}
                <section className="section-container bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 text-center-mobile text-left-tablet">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Activities</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Pengalaman Menarik</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grid-cols-mobile-fix grid-cols-tablet-fix facilities-grid">
                            {[
                                { icon: <Mountain size={32} />, title: "Panorama Alam", desc: "Nikmati pemandangan 360 derajat Danau Rawa Pening dari spot terbaik." },
                                { icon: <Utensils size={32} />, title: "Restoran & Cafe", desc: "Sajian kuliner khas Nusantara dan Internasional dengan view pegunungan." },
                                { icon: <Camera size={32} />, title: "Spot Foto Instagramable", desc: "Puluhan spot foto unik dengan latar alam yang sangat mempesona." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start gap-6 text-left">
                                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl mb-4 text-gray-900 transition-colors duration-300">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed font-light">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Testimonials Section */}
                <section className="section-container bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 text-center-mobile text-left-tablet">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">{h.testimonialBadge}</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">{h.testimonialTitle}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            {(h.testimonials || [])
                                .filter(item => item.rating >= parseInt(h.testimonialMinRating || 1))
                                .slice(0, 3)
                                .map((item, i) => (
                                    <ReviewCardPreview key={i} item={item} />
                                ))}
                        </div>
                    </div>
                </section>

                {/* 5. Final CTA Section */}
                <section className="relative py-32 px-6 flex items-center justify-center text-center">
                    <img src={h.finalCtaImage || "/images/generated/hero.png"} className="absolute inset-0 w-full h-full object-cover grayscale" alt="CTA BG" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 max-w-4xl text-white">
                        <h2 className="text-4xl md:text-7xl font-bold mb-8 font-serif leading-tight">{h.finalCtaTitle}</h2>
                        <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">{h.finalCtaSubtitle}</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <div className="bg-white text-eling-green font-bold py-5 px-12 rounded-full text-xl shadow-2xl">
                                {h.finalCtaPrimary}
                            </div>
                            <div className="bg-eling-red text-white font-bold py-5 px-12 rounded-full text-xl shadow-2xl">
                                {h.finalCtaSecondary}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'about') {
        const a = content.about;
        return (
            <div className={`preview-container font-sans text-gray-900 bg-gray-50 pb-24 ${previewDevice}`}>
                <style>{styles}</style>
                <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                    <img src={a.heroImage || "/images/hero-bg.png"} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4 text-center">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">{a.heroTitle}</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic opacity-90">{a.heroDesc}</p>
                    </div>
                </section>

                <section className="py-24 px-6 lg:px-24 bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 text-left about-flex">
                        <div className="lg:w-1/2 relative">
                            <div className="absolute -top-8 -left-8 w-32 h-32 bg-eling-green opacity-10 rounded-full"></div>
                            <img src={a.storyImage || "/images/hero-bg.png"} alt="About" className="rounded-2xl shadow-2xl relative z-10 w-full object-cover aspect-[4/3]" />
                            <div className="absolute -bottom-6 -right-6 bg-white/80 backdrop-blur-md p-6 rounded-xl border-eling-green/30 border-2 z-20 shadow-xl">
                                <p className="text-eling-green font-bold text-xl">100% Alamiah</p>
                                <p className="text-gray-800 font-medium text-sm">Pesona Pegunungan</p>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Sejarah & Visi</span>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight font-serif text-gray-900">{a.storyTitle}</h2>
                            <div className="space-y-6 text-gray-600 leading-relaxed text-lg italic">
                                <p>{a.storyP1}</p>
                                <p>{a.storyP2}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-6 lg:px-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Nilai-Nilai Kami</span>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-serif text-gray-900">Apa yang Membuat Kami Berbeda</h2>
                            <div className="w-24 h-1 bg-eling-green mx-auto"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 text-left grid-cols-mobile-fix grid-cols-tablet-fix">
                            {(a.values || []).map((v, i) => (
                                <div key={i} className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                        <Mountain size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">{v.title}</h3>
                                        <p className="text-gray-600 leading-relaxed italic">{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'gallery') {
        const g = content.gallery || [];
        return (
            <div className={`preview-container font-sans text-gray-900 bg-white pb-24 text-center ${previewDevice}`}>
                <style>{styles}</style>
                <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center text-center overflow-hidden mb-16 pt-20">
                    <img src={content.galleryHeroImage || "/images/hero-bg.png"} alt="Gallery Hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4 text-center">
                        <h1 className="text-5xl font-bold mb-4 font-serif">Koleksi Foto</h1>
                        <p className="text-lg font-light tracking-wide italic opacity-90">Momen terbaik di Eling Bening Ambarawa.</p>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 gap-6 grid-cols-mobile-fix grid-cols-tablet-fix">
                        {g.map((img, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-3xl aspect-[4/5] shadow-lg text-left">
                                <img src={img.src || "/images/hero-bg.png"} className="absolute inset-0 w-full h-full object-cover" alt={img.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-white font-serif text-xl font-bold">{img.title}</h3>
                                    <p className="text-white/70 text-xs line-clamp-2 italic">{img.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'contact') {
        const c = content.contact;
        return (
            <div className={`preview-container font-sans text-gray-900 bg-white pb-24 ${previewDevice}`}>
                <style>{styles}</style>
                <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                    <img src={c.heroImage || "/images/hero-bg.png"} alt="Contact Hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4 text-center text-left">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">{c.title}</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic opacity-90 text-center">{c.subtitle}</p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 lg:px-24 py-24 text-left">
                    <div className="flex flex-col gap-16 about-flex">
                        <div className="w-full lg:w-1/2">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">{c.supportBadge}</span>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 font-serif text-gray-900">{c.supportTitle}</h2>
                            <p className="text-gray-600 leading-relaxed mb-12 text-lg italic">
                                {c.supportDesc}
                            </p>
                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><MapPin size={22} /></div>
                                    <div><p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Lokasi</p><p className="text-gray-500 text-xs leading-relaxed">{c.address}</p></div>
                                </div>
                                <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><Phone size={22} /></div>
                                    <div><p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Telepon</p><p className="text-gray-500 text-xs font-bold">{c.phone}</p></div>
                                </div>
                                <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><Mail size={22} /></div>
                                    <div><p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Email</p><p className="text-gray-500 text-xs font-bold">{c.email}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 bg-white border border-gray-100 shadow-xl rounded-[3rem] p-10 h-fit italic text-gray-400">
                            <h3 className="text-2xl font-black font-serif text-gray-900 mb-8 not-italic">Kirim Pesan</h3>
                            <div className="space-y-6">
                                <div className="h-14 bg-gray-50 rounded-2xl border border-gray-100" />
                                <div className="h-14 bg-gray-50 rounded-2xl border border-gray-100" />
                                <div className="h-32 bg-gray-50 rounded-2xl border border-gray-100" />
                                <div className="h-16 bg-eling-red opacity-80 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'facilities') {
        const f = content.facilities || [];
        return (
            <div className={`preview-container font-sans text-gray-900 bg-gray-50 pb-24 ${previewDevice}`}>
                <style>{styles}</style>
                <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                    <img src={content.eventHeroImage || "/images/hero-bg.png"} alt="Facilities Hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4 text-center">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">Fasilitas Premium</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic text-center">Kenyamanan dan kepuasan Anda adalah prioritas utama kami.</p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 lg:px-24 pt-24">
                    <div className="mb-16 text-center-mobile text-left-tablet">
                        <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Layanan Kami</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-serif text-gray-900">Fasilitas Eling Bening</h2>
                        <div className="w-24 h-1 bg-eling-green mx-auto md:mx-0"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 grid-cols-mobile-fix grid-cols-tablet-fix">
                        {f.map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-left h-full flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition duration-500 group-hover:scale-150 group-hover:bg-eling-green/5"></div>
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 shrink-0 text-eling-green">
                                    <Sparkles size={32} />
                                </div>
                                <h3 className="font-bold text-xl mb-4 text-gray-900 font-serif leading-tight">{item.title || item.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed flex-1 italic">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Peta Wisata Section */}
                <section className="bg-white py-24 px-6 lg:px-24 mt-24">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 bg-green-50 rounded-3xl p-8 lg:p-12 border border-green-100 text-left about-flex">
                        <div className="flex-1">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Lokasi & Panduan</span>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-serif text-gray-900">Peta Wisata Eling Bening</h2>
                            <p className="text-gray-600 leading-relaxed mb-6 italic">
                                Jelajahi seluruh area Eling Bening dengan mudah. Temukan lokasi fasilitas favorit Anda.
                            </p>
                            <div className="bg-eling-green text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 w-fit">
                                <MapPin size={20} /> Lihat Peta Lengkap
                            </div>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                                <img src={content.mapImage || "/images/hero-bg.png"} alt="Map Preview" className="w-full h-full object-cover blur-[1px]" />
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="bg-white/90 text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg">Buka Peta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'layout') {
        const l = content.layout;
        return (
            <div className={`preview-container font-sans text-gray-900 bg-white ${previewDevice}`}>
                <style>{styles}</style>
                {/* Navbar Preview */}
                <nav className="preview-nav w-full bg-white text-gray-900 shadow-xl py-4 px-6 lg:px-12 flex justify-between items-center sticky top-0 z-50 transition-all border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <img src={l.logo || '/images/logo.png'} alt="Logo" className="h-10" />
                        <span className="text-xl font-serif font-black text-eling-green transition-all">{l.siteTitle || 'Eling Bening'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="lg-nav-menu hidden lg:flex gap-8 font-black tracking-[0.05em] uppercase text-[11px] items-center text-gray-900">
                            <button onClick={() => onTabChange('home')} className="pb-1 hover:text-eling-green transition-all">Home</button>
                            <button onClick={() => onTabChange('about')} className="pb-1 hover:text-eling-green transition-all">Tentang Kami</button>
                            <button className="pb-1 hover:text-eling-green transition-all">Resort</button>
                            <div className="flex items-center gap-1.5 cursor-pointer hover:text-eling-green transition-all">TIKET <ChevronDown size={14} /></div>
                            <button className="pb-1 hover:text-eling-green transition-all">Event</button>
                            <button className="pb-1 hover:text-eling-green transition-all">Galeri</button>
                            <button onClick={() => onTabChange('facilities')} className="pb-1 hover:text-eling-green transition-all">Fasilitas</button>
                            <button onClick={() => onTabChange('contact')} className="pb-1 hover:text-eling-green transition-all">Kontak</button>
                        </div>
                        <button onClick={() => setPreviewMobileMenuOpen(true)} className="burger-icon p-2 rounded-xl text-gray-900 hover:bg-gray-100 transition-all">
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-eling-red flex items-center justify-center text-white shrink-0 shadow-lg">
                            <UserCircle size={24} />
                        </div>
                    </div>
                </nav>

                {/* Mobile Drawer Simulation */}
                {previewMobileMenuOpen && (
                    <div className="absolute inset-0 z-[60] animate-fade-in">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewMobileMenuOpen(false)} />
                        <div className="absolute right-0 top-0 bottom-0 w-[85%] bg-white shadow-2xl animate-[slide_0.3s_ease-out] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <img src={l.logo || '/images/logo.png'} alt="Logo" className="h-6" />
                                    <span className="text-sm font-serif font-black text-eling-green">{l.siteTitle || 'Eling Bening'}</span>
                                </div>
                                <button onClick={() => setPreviewMobileMenuOpen(false)} className="text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 py-6 px-4 space-y-1">
                                {[
                                    { label: 'Home', id: 'home' },
                                    { label: 'Tentang Kami', id: 'about' },
                                    { label: 'Resort', id: null },
                                    { label: 'Tiket Wisata', id: null },
                                    { label: 'Tiket Event', id: null },
                                    { label: 'Event', id: null },
                                    { label: 'Galeri', id: null },
                                    { label: 'Fasilitas', id: 'facilities' },
                                    { label: 'Kontak', id: 'contact' }
                                ].map((m) => (
                                    <button 
                                        key={m.label} 
                                        onClick={() => {
                                            if(m.id) onTabChange(m.id);
                                            setPreviewMobileMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === m.id ? 'bg-eling-green/10 text-eling-green' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <style>{`
                            @keyframes slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
                        `}</style>
                    </div>
                )}

                {/* Main Body Placeholder */}
                <div className="min-h-[400px] flex items-center justify-center bg-gray-50 border-y border-dashed border-gray-200 p-8 text-center">
                    <div>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-admin-primary mx-auto mb-4">
                            <Layout size={32} />
                        </div>
                        <h3 className="font-serif text-2xl font-black text-gray-800 italic">Layout & Identity View</h3>
                        <p className="text-gray-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-black max-w-[200px] mx-auto">Toggle device icons below to see responsive behavior</p>
                    </div>
                </div>

                {/* Footer Preview */}
                <footer className="bg-eling-green text-white py-16 px-6 lg:px-20 text-left">
                    <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto transition-all">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <img src={l.logo || '/images/logo.png'} alt="Logo" className="h-8 opacity-90" />
                                <span className="text-xl font-serif font-bold text-white nav-logo-text whitespace-nowrap">{l.siteTitle || 'Eling Bening'}</span>
                            </div>
                            <p className="text-green-100/70 text-xs leading-relaxed italic max-w-xs">
                                {l.footerDesc || "Destinasi wisata alam terbaik di Ambarawa. Rasakan harmoni keindahan alam dan kemewahan dalam satu tempat."}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-xs tracking-[0.2em] text-white uppercase opacity-50">Sitemap</h4>
                            <ul className="space-y-2 text-green-100 text-xs opacity-80 font-bold">
                                <li>Beranda</li>
                                <li>Tentang Kami</li>
                                <li>Fasilitas</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-bold text-xs tracking-[0.2em] text-white uppercase opacity-50">Connect</h4>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"><Smartphone size={16} /></div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"><Monitor size={16} /></div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"><Tablet size={16} /></div>
                            </div>
                            <p className="text-[9px] text-green-100/40 uppercase tracking-[0.2em] font-black italic">Social media synced</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-xs tracking-[0.2em] text-white uppercase opacity-50">Office</h4>
                            <p className="text-green-100 text-[10px] leading-relaxed opacity-60 italic">{content.contact.address}</p>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    return null;
};

export default function AdminContent() {
    const { content, updateContent, saveToBackend } = useContent();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [previewDevice, setPreviewDevice] = useState('desktop');

    const handleChange = (key, value) => {
        const tabKey = ['home', 'about', 'contact', 'layout', 'facilities'].includes(activeTab) ? activeTab : null;
        updateContent(tabKey, key, value);
    };

    const handleSave = async () => {
        await saveToBackend();
    };

    const tabs = [
        { id: 'home', label: 'BERANDA', icon: HomeIcon },
        { id: 'about', label: 'TENTANG KAMI', icon: Info },
        { id: 'gallery', label: 'GALERI', icon: Camera },
        { id: 'facilities', label: 'FASILITAS', icon: Tent },
        { id: 'contact', label: 'KONTAK', icon: PhoneIcon },
        { id: 'layout', label: 'TATA LETAK', icon: Layout },
    ];

    const ImageUpload = ({ label, value, onChange, placeholder = "Input URL atau upload gambar" }) => {
        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    onChange(reader.result);
                };
                reader.readAsDataURL(file);
            }
        };

        return (
            <div className="form-group space-y-3">
                <label className="form-label !text-xs !font-black uppercase tracking-tighter">{label}</label>
                <div className="space-y-4">
                    {/* Preview Area */}
                    <div className="relative group aspect-video rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-admin-border flex items-center justify-center">
                        {value ? (
                            <>
                                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => onChange('')} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                                        <X size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <Camera className="mx-auto text-admin-text-muted mb-2" size={32} />
                                <p className="text-[10px] font-bold text-admin-text-muted uppercase">Belum ada gambar</p>
                            </div>
                        )}
                    </div>

                    {/* Inputs */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                className="admin-input !bg-white !pr-10"
                                value={value && !value.startsWith('data:') ? value : ''}
                                onChange={e => onChange(e.target.value)}
                                placeholder={placeholder}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted">
                                <ArrowUpRight size={14} />
                            </div>
                        </div>
                        <label className="bg-admin-primary/10 text-admin-primary px-4 py-2 rounded-xl border border-admin-primary/20 cursor-pointer hover:bg-admin-primary/20 transition-all font-black text-[10px] uppercase flex items-center whitespace-nowrap">
                            Upload
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Reusable form helpers ───────────────────────────────────────────────────
    const SectionCard = ({ icon: Icon, title, color = 'green', children, badge }) => {
        const colors = {
            green:  { bg: 'bg-emerald-50',  border: 'border-emerald-200',  icon: 'text-emerald-600', dot: 'bg-emerald-500' },
            blue:   { bg: 'bg-blue-50',     border: 'border-blue-200',     icon: 'text-blue-600',    dot: 'bg-blue-500'    },
            amber:  { bg: 'bg-amber-50',    border: 'border-amber-200',    icon: 'text-amber-600',   dot: 'bg-amber-500'   },
            rose:   { bg: 'bg-rose-50',     border: 'border-rose-200',     icon: 'text-rose-600',    dot: 'bg-rose-500'    },
            purple: { bg: 'bg-purple-50',   border: 'border-purple-200',   icon: 'text-purple-600',  dot: 'bg-purple-500'  },
            sky:    { bg: 'bg-sky-50',      border: 'border-sky-200',      icon: 'text-sky-600',     dot: 'bg-sky-500'     },
        };
        const c = colors[color] || colors.green;
        return (
            <div className={`rounded-2xl border ${c.border} overflow-hidden shadow-sm`}>
                <div className={`flex items-center justify-between px-4 py-3 ${c.bg} border-b ${c.border}`}>
                    <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                            <Icon size={13} className={c.icon} />
                        </span>
                        <h4 className={`text-[11px] font-black ${c.icon} uppercase tracking-widest`}>{title}</h4>
                    </div>
                    {badge && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.bg} border ${c.border} ${c.icon}`}>{badge}</span>}
                </div>
                <div className="bg-white p-4 space-y-4">{children}</div>
            </div>
        );
    };
    const Field = ({ label, children, hint }) => (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-gray-400 leading-relaxed">{hint}</p>}
        </div>
    );
    const TwoCol = ({ children }) => <div className="grid grid-cols-2 gap-3">{children}</div>;
    const Inp = ({ value, onChange, placeholder, type = 'text' }) => (
        <input type={type} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" value={value} onChange={onChange} placeholder={placeholder} />
    );
    const Txt = ({ value, onChange, placeholder, rows = 3 }) => (
        <textarea rows={rows} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all resize-none" value={value} onChange={onChange} placeholder={placeholder} />
    );
    const Sel = ({ value, onChange, options }) => (
        <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" value={value} onChange={onChange}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
    const ItemCard = ({ number, title, onDelete, children }) => (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">{number}</span>
                    <span className="text-[11px] font-bold text-gray-700 truncate max-w-[160px]">{title}</span>
                </div>
                <button onClick={onDelete} className="flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"><X size={11} /> Hapus</button>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
    const AddBtn = ({ onClick, children }) => (
        <button onClick={onClick} className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-bold text-xs hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">{children}</button>
    );
    // ─── End helpers ─────────────────────────────────────────────────────────────

    const getFormFields = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-5 animate-fade-in">
                        <SectionCard icon={Sparkles} title="Hero Utama" color="green">
                            <ImageUpload label="Foto Latar Hero" value={content.home.heroImage || "/images/hero-bg.png"} onChange={val => handleChange('heroImage', val)} />
                            <Field label="Teks Badge Sapaan">
                                <Inp value={content.home.heroBadge} onChange={e => handleChange('heroBadge', e.target.value)} placeholder="cth: Selamat Datang di..." />
                            </Field>
                            <TwoCol>
                                <Field label="Judul Baris 1">
                                    <Inp value={content.home.heroTitleLine1} onChange={e => handleChange('heroTitleLine1', e.target.value)} placeholder="Eling" />
                                </Field>
                                <Field label="Judul Baris 2">
                                    <Inp value={content.home.heroTitleLine2} onChange={e => handleChange('heroTitleLine2', e.target.value)} placeholder="Bening" />
                                </Field>
                            </TwoCol>
                            <Field label="Subtitle / Kalimat Pembuka">
                                <Txt rows={2} value={content.home.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} placeholder="Tuliskan kalimat pembuka yang menarik..." />
                            </Field>
                            <TwoCol>
                                <Field label="Tombol Utama">
                                    <Inp value={content.home.ctaPrimary} onChange={e => handleChange('ctaPrimary', e.target.value)} placeholder="Pesan Sekarang" />
                                </Field>
                                <Field label="Tombol Sekunder">
                                    <Inp value={content.home.ctaSecondary} onChange={e => handleChange('ctaSecondary', e.target.value)} placeholder="Lihat Fasilitas" />
                                </Field>
                            </TwoCol>
                        </SectionCard>

                        <SectionCard icon={Eye} title="Bagian Discovery" color="blue">
                            <Field label="Label Badge">
                                <Inp value={content.home.discoveryBadge} onChange={e => handleChange('discoveryBadge', e.target.value)} placeholder="cth: Tentang Kami" />
                            </Field>
                            <Field label="Judul Utama">
                                <Inp value={content.home.discoveryTitle} onChange={e => handleChange('discoveryTitle', e.target.value)} placeholder="Judul bagian discovery..." />
                            </Field>
                            <Field label="Teks Deskripsi">
                                <Txt rows={3} value={content.home.discoveryText} onChange={e => handleChange('discoveryText', e.target.value)} placeholder="Ceritakan tentang Eling Bening..." />
                            </Field>
                        </SectionCard>


                        <SectionCard icon={ArrowRight} title="Ajakan Akhir (CTA)" color="rose">
                            <ImageUpload label="Foto Latar CTA" value={content.home.finalCtaImage || "/images/hero-bg.png"} onChange={val => handleChange('finalCtaImage', val)} />
                            <Field label="Judul CTA">
                                <Inp value={content.home.finalCtaTitle} onChange={e => handleChange('finalCtaTitle', e.target.value)} placeholder="Ayo Berlibur Bersama Kami!" />
                            </Field>
                            <Field label="Deskripsi CTA">
                                <Txt rows={2} value={content.home.finalCtaSubtitle} onChange={e => handleChange('finalCtaSubtitle', e.target.value)} placeholder="Kalimat pendek yang memotivasi tamu..." />
                            </Field>
                            <TwoCol>
                                <Field label="Label Tombol Utama">
                                    <Inp value={content.home.finalCtaPrimary} onChange={e => handleChange('finalCtaPrimary', e.target.value)} placeholder="Pesan Tiket" />
                                </Field>
                                <Field label="Label Tombol Sekunder">
                                    <Inp value={content.home.finalCtaSecondary} onChange={e => handleChange('finalCtaSecondary', e.target.value)} placeholder="Hubungi Kami" />
                                </Field>
                            </TwoCol>
                        </SectionCard>
                    </div>
                );
            case 'about':
                return (
                    <div className="space-y-5 animate-fade-in">
                        <SectionCard icon={Mountain} title="Hero Halaman Tentang" color="green">
                            <ImageUpload label="Foto Latar Hero" value={content.about.heroImage || "/images/hero-bg.png"} onChange={val => handleChange('heroImage', val)} />
                            <Field label="Judul Halaman">
                                <Inp value={content.about.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} placeholder="Tentang Eling Bening" />
                            </Field>
                            <Field label="Subtitle / Pitch">
                                <Txt rows={2} value={content.about.heroDesc} onChange={e => handleChange('heroDesc', e.target.value)} placeholder="Kalimat singkat yang menggambarkan Eling Bening..." />
                            </Field>
                        </SectionCard>

                        <SectionCard icon={Sparkles} title="Kisah Brand" color="blue">
                            <ImageUpload label="Foto Kisah" value={content.about.storyImage || "/images/hero-bg.png"} onChange={val => handleChange('storyImage', val)} />
                            <Field label="Judul Seksi Kisah">
                                <Inp value={content.about.storyTitle} onChange={e => handleChange('storyTitle', e.target.value)} placeholder="Kisah Eling Bening..." />
                            </Field>
                            <Field label="Paragraf 1">
                                <Txt rows={3} value={content.about.storyP1} onChange={e => handleChange('storyP1', e.target.value)} placeholder="Awal mula berdirinya Eling Bening..." />
                            </Field>
                            <Field label="Paragraf 2">
                                <Txt rows={3} value={content.about.storyP2} onChange={e => handleChange('storyP2', e.target.value)} placeholder="Visi dan perjalanan kami..." />
                            </Field>
                        </SectionCard>

                        <SectionCard icon={Waves} title="Keunggulan Kami" color="sky" badge={`${(content.about.values || []).length} poin`}>
                            <TwoCol>
                                <Field label="Label Badge">
                                    <Inp value={content.about.valuesBadge} onChange={e => handleChange('valuesBadge', e.target.value)} placeholder="Mengapa Kami" />
                                </Field>
                                <Field label="Judul Seksi">
                                    <Inp value={content.about.valuesTitle} onChange={e => handleChange('valuesTitle', e.target.value)} placeholder="Nilai-Nilai Kami" />
                                </Field>
                            </TwoCol>
                            <div className="space-y-3 pt-1">
                                {(content.about.values || []).map((v, idx) => (
                                    <ItemCard key={idx} number={idx + 1} title={v.title || 'Nilai Baru'} onDelete={() => {
                                        const updated = content.about.values.filter((_, i) => i !== idx);
                                        handleChange('values', updated);
                                    }}>
                                        <TwoCol>
                                            <Inp value={v.icon} onChange={e => { const u = content.about.values.map((it, i) => i === idx ? { ...it, icon: e.target.value } : it); handleChange('values', u); }} placeholder="Nama ikon" />
                                            <Inp value={v.title} onChange={e => { const u = content.about.values.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); handleChange('values', u); }} placeholder="Judul nilai" />
                                        </TwoCol>
                                        <Txt rows={2} value={v.desc} onChange={e => { const u = content.about.values.map((it, i) => i === idx ? { ...it, desc: e.target.value } : it); handleChange('values', u); }} placeholder="Deskripsi singkat nilai ini..." />
                                    </ItemCard>
                                ))}
                                <AddBtn onClick={() => { const u = [...(content.about.values || []), { icon: 'Sparkles', title: 'Nilai Baru', desc: '' }]; handleChange('values', u); }}>
                                    <Sparkles size={13} /> Tambah Keunggulan
                                </AddBtn>
                            </div>
                        </SectionCard>
                    </div>
                );
            case 'gallery':
                return (
                    <div className="space-y-5">
                        <SectionCard icon={Camera} title="Hero Halaman Galeri" color="purple">
                            <ImageUpload label="Foto Latar Hero Galeri" value={content.galleryHeroImage || "/images/hero-bg.png"} onChange={val => updateContent(null, 'galleryHeroImage', val)} />
                        </SectionCard>
                        <SectionCard icon={Calendar} title="Hero Halaman Event" color="rose">
                            <ImageUpload label="Foto Latar Hero Event" value={content.eventHeroImage || "/images/hero-bg.png"} onChange={val => updateContent(null, 'eventHeroImage', val)} />
                        </SectionCard>
                        <SectionCard icon={Camera} title="Foto Galeri" color="sky" badge={`${(content.gallery || []).length} foto`}>
                            <div className="space-y-3">
                                {(content.gallery || []).map((img, idx) => (
                                    <ItemCard key={idx} number={idx + 1} title={img.title || 'Foto Baru'} onDelete={() => {
                                        const updated = content.gallery.filter((_, i) => i !== idx);
                                        updateContent(null, 'gallery', updated);
                                    }}>
                                        <ImageUpload label="Pilih Foto" value={img.src} onChange={val => {
                                            const updated = content.gallery.map((item, i) => i === idx ? { ...item, src: val } : item);
                                            updateContent(null, 'gallery', updated);
                                        }} />
                                        <Field label="Judul Foto">
                                            <Inp value={img.title} onChange={e => { const u = content.gallery.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); updateContent(null, 'gallery', u); }} placeholder="Judul foto..." />
                                        </Field>
                                        <Field label="Deskripsi / Cerita">
                                            <Txt rows={2} value={img.desc} onChange={e => { const u = content.gallery.map((it, i) => i === idx ? { ...it, desc: e.target.value } : it); updateContent(null, 'gallery', u); }} placeholder="Ceritakan momen ini..." />
                                        </Field>
                                    </ItemCard>
                                ))}
                                <AddBtn onClick={() => { const u = [...(content.gallery || []), { src: '', title: 'Momen Baru', desc: '', date: new Date().toLocaleDateString('id-ID') }]; updateContent(null, 'gallery', u); }}>
                                    <Camera size={13} /> Tambah Foto
                                </AddBtn>
                            </div>
                        </SectionCard>
                    </div>
                );
            case 'contact':
                return (
                    <div className="space-y-5 animate-fade-in">
                        <SectionCard icon={Phone} title="Informasi Kontak" color="green">
                            <ImageUpload label="Foto Latar Hero Kontak" value={content.contact.heroImage || "/images/hero-bg.png"} onChange={val => handleChange('heroImage', val)} />
                            <Field label="Judul Halaman Kontak">
                                <Inp value={content.contact.title} onChange={e => handleChange('title', e.target.value)} placeholder="Hubungi Kami" />
                            </Field>
                            <Field label="Subtitle Hero">
                                <Txt rows={2} value={content.contact.subtitle} onChange={e => handleChange('subtitle', e.target.value)} placeholder="Kami siap membantu Anda..." />
                            </Field>
                            <TwoCol>
                                <Field label="Email Dukungan">
                                    <Inp value={content.contact.email} onChange={e => handleChange('email', e.target.value)} placeholder="info@elingbening.com" />
                                </Field>
                                <Field label="No. Telepon / WA">
                                    <Inp value={content.contact.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+62 812-..." />
                                </Field>
                            </TwoCol>
                            <Field label="Alamat Lengkap">
                                <Txt rows={3} value={content.contact.address} onChange={e => handleChange('address', e.target.value)} placeholder="Jl. Contoh No. 1, Bandung..." />
                            </Field>
                        </SectionCard>

                        <SectionCard icon={Mail} title="Pesan Dukungan" color="blue">
                            <TwoCol>
                                <Field label="Label Badge">
                                    <Inp value={content.contact.supportBadge} onChange={e => handleChange('supportBadge', e.target.value)} placeholder="Layanan Pelanggan" />
                                </Field>
                                <Field label="Judul Kotak">
                                    <Inp value={content.contact.supportTitle} onChange={e => handleChange('supportTitle', e.target.value)} placeholder="Kirim Pesan" />
                                </Field>
                            </TwoCol>
                            <Field label="Deskripsi Singkat">
                                <Txt rows={3} value={content.contact.supportDesc} onChange={e => handleChange('supportDesc', e.target.value)} placeholder="Tim kami merespons dalam waktu..." />
                            </Field>
                        </SectionCard>
                    </div>
                );
            case 'facilities':
                return (() => {
                    // Tourism-relevant icon map — names must match IconRenderer ICON_MAP keys
                        const facilityIcons = {
                            // Alam & Pemandangan
                            Mountain:      <Mountain size={20} />,
                            Waves:         <Waves size={20} />,
                            Sun:           <Sun size={20} />,
                            Camera:        <Camera size={20} />,
                            Eye:           <Eye size={20} />,
                            MapPin:        <MapPin size={20} />,
                            Compass:       <Compass size={20} />,
                            Cloud:         <Cloud size={20} />,
                            Wind:          <Wind size={20} />,
                            Trees:         <Trees size={20} />,
                            Flame:         <Flame size={20} />,

                            // Akomodasi
                            BedDouble:     <BedDouble size={20} />,
                            Tent:          <Tent size={20} />,
                            Building2:     <Building2 size={20} />,
                            DoorOpen:      <DoorOpen size={20} />,
                            Home:          <HomeIcon size={20} />,

                            // Kuliner
                            Utensils:      <Utensils size={20} />,
                            UtensilsCrossed: <UtensilsCrossed size={20} />,
                            Coffee:        <Coffee size={20} />,
                            Pizza:         <Pizza size={20} />,
                            GlassWater:    <GlassWater size={20} />,
                            Wine:          <Wine size={20} />,
                            IceCream:      <IceCream size={20} />,
                            Cake:          <Cake size={20} />,

                            // Air & Kolam
                            Droplet:       <Droplet size={20} />,
                            Fish:          <Fish size={20} />,
                            Anchor:        <Anchor size={20} />,

                            // Olahraga & Aktivitas
                            Bike:          <Bike size={20} />,
                            Dumbbell:      <Dumbbell size={20} />,
                            Trophy:        <Trophy size={20} />,
                            Target:        <Target size={20} />,
                            Gamepad2:      <Gamepad2 size={20} />,
                            Puzzle:        <Puzzle size={20} />,

                            // Hiburan & Seni
                            Music:         <Music size={20} />,
                            Mic2:          <Mic2 size={20} />,
                            Star:          <Star size={20} />,
                            Sparkles:      <Sparkles size={20} />,
                            Zap:           <Zap size={20} />,
                            Video:         <Video size={20} />,

                            // Kesehatan & Spa
                            Heart:         <Heart size={20} />,
                            Stethoscope:   <Stethoscope size={20} />,
                            Brain:         <Brain size={20} />,
                            Flower:        <Flower size={20} />,
                            ShieldCheck:   <ShieldCheck size={20} />,

                            // Toilet & Fasilitas Umum
                            Baby:          <Baby size={20} />,
                            Accessibility: <Accessibility size={20} />,
                            CigaretteOff:  <CigaretteOff size={20} />,
                            Hand:          <Hand size={20} />,
                            Trash2:        <Trash2 size={20} />,
                            Bath:          <Bath size={20} />,
                            ShowerHead:    <ShowerHead size={20} />,
                            Venus:         <Venus size={20} />,
                            Mars:          <Mars size={20} />,
                            Toilet:        <Toilet size={20} />,

                            // Transportasi & Layanan
                            Car:           <Car size={20} />,
                            Bus:           <Bus size={20} />,
                            ParkingCircle: <ParkingCircle size={20} />,
                            Phone:         <Phone size={20} />,
                            Wifi:          <Wifi size={20} />,
                            Monitor:       <Monitor size={20} />,
                            Users:         <Users size={20} />,
                            Calendar:      <Calendar size={20} />,
                            Lock:          <Lock size={20} />,
                            Lightbulb:     <Lightbulb size={20} />,
                        };

                    const IconPicker = ({ value, onChange }) => {
                        const allIcons = Object.keys(facilityIcons);
                        return (
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold text-gray-500">Ganti Ikon</p>
                                <div className="bg-gray-100 rounded-2xl p-3">
                                    <div className="grid grid-cols-6 gap-1">
                                        {allIcons.map(name => {
                                            const icon = facilityIcons[name];
                                            if (!icon) return null;
                                            const active = value === name;
                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    title={name}
                                                    onClick={() => onChange(name)}
                                                    className={`h-12 flex items-center justify-center rounded-xl transition-all duration-150 ${
                                                        active
                                                            ? 'bg-white shadow-sm text-admin-primary'
                                                            : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60'
                                                    }`}
                                                >
                                                    {React.cloneElement(icon, { size: active ? 22 : 20 })}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    };





                    return (
                        <div className="space-y-6">
                            {/* Peta Wisata */}
                            <div className="rounded-2xl border border-admin-border bg-white overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3 bg-admin-primary/5 border-b border-admin-border">
                                    <MapPin size={14} className="text-admin-primary" />
                                    <h4 className="text-[11px] font-black text-admin-primary uppercase tracking-widest">Peta Wisata</h4>
                                </div>
                                <div className="p-5">
                                    <ImageUpload
                                        label="Gambar Peta Area Eling Bening"
                                        value={content.mapImage}
                                        onChange={val => updateContent(null, 'mapImage', val)}
                                    />
                                </div>
                            </div>

                            {/* Daftar Fasilitas */}
                            <div className="rounded-2xl border border-admin-border bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3 bg-admin-primary/5 border-b border-admin-border">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-admin-primary" />
                                        <h4 className="text-[11px] font-black text-admin-primary uppercase tracking-widest">Kelola Fasilitas</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-admin-text-muted bg-admin-bg px-2 py-1 rounded-full">
                                        {(content.facilities || []).length} fasilitas
                                    </span>
                                </div>

                                <div className="p-5 space-y-4">
                                    {(content.facilities || []).map((f, idx) => (
                                        <div key={idx} className="border border-admin-border rounded-2xl overflow-hidden bg-admin-bg/30">
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-admin-border">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-lg bg-admin-primary text-white text-[10px] font-black flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-admin-text-main truncate max-w-[140px]">
                                                        {f.name || f.title || 'Fasilitas Baru'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const updated = content.facilities.filter((_, i) => i !== idx);
                                                        updateContent(null, 'facilities', updated);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                                >
                                                    <X size={12} /> Hapus
                                                </button>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-4 space-y-4">
                                                <ImageUpload
                                                    label="Gambar Fasilitas"
                                                    value={f.image}
                                                    onChange={val => {
                                                        const updated = content.facilities.map((item, i) => i === idx ? { ...item, image: val } : item);
                                                        updateContent(null, 'facilities', updated);
                                                    }}
                                                />

                                                {/* Nama Fasilitas */}
                                                <div className="form-group mb-0">
                                                    <label className="form-label !text-[10px] uppercase">Nama Fasilitas</label>
                                                    <input
                                                        className="admin-input !text-sm !bg-white"
                                                        value={f.name || f.title}
                                                        placeholder="Nama fasilitas..."
                                                        onChange={e => {
                                                            const updated = content.facilities.map((item, i) => i === idx ? { ...item, name: e.target.value, title: e.target.value } : item);
                                                            updateContent(null, 'facilities', updated);
                                                        }}
                                                    />
                                                </div>

                                                {/* Icon Picker — di bawah nama */}
                                                <IconPicker
                                                    value={f.icon}
                                                    onChange={val => {
                                                        const updated = content.facilities.map((item, i) => i === idx ? { ...item, icon: val } : item);
                                                        updateContent(null, 'facilities', updated);
                                                    }}
                                                />

                                                <div className="form-group mb-0">
                                                    <label className="form-label !text-[10px] uppercase">Deskripsi Singkat</label>
                                                    <textarea
                                                        className="admin-textarea !text-sm !bg-white"
                                                        rows={2}
                                                        placeholder="Deskripsi fasilitas..."
                                                        value={f.desc}
                                                        onChange={e => {
                                                            const updated = content.facilities.map((item, i) => i === idx ? { ...item, desc: e.target.value } : item);
                                                            updateContent(null, 'facilities', updated);
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => {
                                            const nextId = content.facilities.length > 0 ? Math.max(...content.facilities.map(f => f.id || 0)) + 1 : 1;
                                            const updated = [...(content.facilities || []), { id: nextId, name: 'Fasilitas Baru', title: 'Fasilitas Baru', desc: 'Deskripsi fasilitas baru...', icon: 'Sparkles', image: '' }];
                                            updateContent(null, 'facilities', updated);
                                        }}
                                        className="w-full py-3.5 border-2 border-dashed border-admin-primary/30 rounded-2xl text-admin-primary font-bold text-xs hover:border-admin-primary hover:bg-admin-primary/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={14} /> + Tambah Fasilitas
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })();
            case 'layout':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <Layout size={14} /> Identitas & Navigasi
                            </h4>
                            <ImageUpload
                                label="Favicon (Icon Browser Title)"
                                value={content.layout.favicon || '/favicon.ico'}
                                onChange={val => handleChange('favicon', val)}
                                placeholder="/favicon.ico"
                            />
                            <div className="mt-4">
                                <ImageUpload
                                    label="Logo Website (Navbar & Footer)"
                                    value={content.layout.logo || '/images/logo.png'}
                                    onChange={val => handleChange('logo', val)}
                                />
                            </div>
                            <div className="form-group mt-4">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Site Title / Nama Website</label>
                                <input className="admin-input !bg-white" value={content.layout.siteTitle} onChange={e => handleChange('siteTitle', e.target.value)} />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <Info size={14} /> Konten Footer
                            </h4>
                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Deskripsi / Slogan Footer</label>
                                <textarea className="admin-textarea !bg-white" rows={3} value={content.layout.footerDesc} onChange={e => handleChange('footerDesc', e.target.value)} />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <Users size={14} /> Social Media Links (Footer)
                            </h4>
                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter"><i className="fab fa-instagram mr-2"></i>Instagram URL</label>
                                <input className="admin-input !bg-white" value={content.layout.socialIg} onChange={e => handleChange('socialIg', e.target.value)} />
                            </div>
                            <div className="form-group mt-4">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter"><i className="fab fa-tiktok mr-2"></i>TikTok URL</label>
                                <input className="admin-input !bg-white" value={content.layout.socialTt} onChange={e => handleChange('socialTt', e.target.value)} />
                            </div>
                            <div className="form-group mt-4">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter"><i className="fab fa-youtube mr-2"></i>YouTube URL</label>
                                <input className="admin-input !bg-white" value={content.layout.socialYt} onChange={e => handleChange('socialYt', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex bg-admin-bg" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden', margin: '-2rem' }}>
            {/* EDITOR SIDEBAR */}
            <div
                className={`flex flex-col bg-white border-r border-admin-border transition-all duration-500 ease-in-out z-20 ${isSidebarOpen ? 'w-[450px]' : 'w-0'}`}
                style={{ overflow: 'hidden' }}
            >
                <div className="p-8 border-b border-admin-border flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-black text-admin-text-main flex items-center gap-2">
                            <Layout className="text-admin-primary" size={20} /> Site Builder
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest font-black text-admin-text-muted mt-1">Real-time Visual Editor</p>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-admin-text-muted hover:text-admin-primary hover:bg-admin-primary/5 rounded-xl transition-all"
                        title="Collapse Editor"
                    >
                        <PanelLeftClose size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-5 bg-admin-bg/30 border-b border-admin-border">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 active:scale-95 ${
                                activeTab === t.id
                                    ? 'bg-white text-admin-primary shadow-md border-b-2 border-admin-primary'
                                    : 'text-admin-text-muted hover:text-admin-main hover:bg-white/40 bg-transparent border-b-2 border-transparent'
                            }`}
                        >
                            <t.icon size={16} className={`${activeTab === t.id ? 'scale-110' : ''} transition-transform duration-300`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {getFormFields()}
                </div>

                <div className="p-8 border-t border-admin-border bg-admin-bg/30">
                    <button className="btn-primary w-full py-4 justify-center shadow-xl shadow-admin-primary/30 group" onClick={handleSave}>
                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="uppercase tracking-[0.2em] font-black text-xs">Simpan & Publikasikan</span>
                    </button>
                    <p className="text-[10px] text-center text-admin-text-muted font-bold mt-4 leading-relaxed opacity-60">
                        *Perubahan akan langsung terlihat pada website utama setelah menekan tombol simpan.
                    </p>
                </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className={`flex-1 flex flex-col transition-all duration-500 min-h-0 overflow-auto ${isSidebarOpen ? 'bg-admin-bg p-8' : 'bg-slate-900 p-0'}`}>
                {/* Device Chrome */}
                <div className={`flex flex-col min-h-0 mx-auto transition-all duration-500 shrink-0 ${
                    previewDevice === 'mobile' ? 'w-[390px]' : previewDevice === 'tablet' ? 'w-[820px]' : 'w-[1440px]'
                }`} style={{ height: 'calc(100vh - 100px)' }}>
                    {/* Browser Bar */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b rounded-t-2xl bg-slate-800 border-slate-700 shrink-0 shadow-lg">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="text-white/50 hover:text-admin-primary transition-colors">
                                <PanelLeftOpen size={14} />
                            </button>
                        )}
                        <div className="flex-1 bg-slate-700/60 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-400 truncate">
                            localhost:8000/{activeTab === 'home' ? '' : activeTab}
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-widest animate-pulse">Live</span>
                    </div>

                    {/* Real Guest Page via iframe — 100% same as guest layout */}
                    {(() => {
                        const tabUrlMap = {
                            home: '/',
                            about: '/about',
                            gallery: '/gallery',
                            facilities: '/facilities',
                            contact: '/contact',
                            layout: '/',
                        };
                        const iframeSrc = tabUrlMap[activeTab] ?? '/';
                        return (
                            <iframe
                                key={`${iframeSrc}-${previewDevice}`}
                                src={iframeSrc}
                                className="w-full rounded-b-2xl bg-white shadow-2xl border-0"
                                style={{ flex: 1, height: '100%', display: 'block' }}
                                title={`Preview - ${activeTab}`}
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                            />
                        );
                    })()}
                </div>

                {/* Floating Toolbar */}
                <div className={`flex items-center justify-between transition-all duration-500 ${isSidebarOpen ? 'mt-6' : 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-white/80 backdrop-blur-xl border border-admin-border rounded-full shadow-2xl'}`}>
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-lg border border-admin-border">
                        <button
                            onClick={() => setPreviewDevice('desktop')}
                            title="Desktop"
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'desktop' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewDevice('tablet')}
                            title="Tablet (820px)"
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'tablet' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Tablet size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewDevice('mobile')}
                            title="Mobile (390px)"
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'mobile' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-admin-border">
                        <button className="text-[10px] font-black text-admin-primary uppercase tracking-widest hover:underline flex items-center gap-1.5" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                            {isSidebarOpen ? 'Hide Editor' : 'Show Editor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
