import React, { useState } from 'react';
import { Save, Home as HomeIcon, Info, Phone as PhoneIcon, PanelLeftClose, PanelLeftOpen, Mountain, Utensils, BedDouble, Waves, MapPin, Phone, Mail, Layout, Eye, Sparkles, Smartphone, Tablet, Monitor, Star, ArrowRight, Camera, Users, Calendar, ArrowUpRight, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent } from '../../context/ContentContext';

// High-fidelity preview component that matches Guest pages exactly
const PreviewRenderer = ({ activeTab, content }) => {
    const styles = `
        .hero-gradient { background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)); }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
        .font-serif { font-family: 'Playfair Display', serif; }
        .bg-eling-green { background-color: #065f46; }
        .text-eling-green { color: #065f46; }
        .bg-eling-red { background-color: #991b1b; }
        .text-eling-red { color: #991b1b; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 1 !important; }
        .section-container { padding: 4rem 1.5rem; }
        @media (min-width: 1024px) { .section-container { padding: 6rem 4rem; } }
        .hover-scale { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-scale:hover { transform: scale(1.03); }
    `;

    if (activeTab === 'home') {
        const h = content.home;
        return (
            <div className="preview-container font-sans text-gray-900 overflow-x-hidden bg-white">
                <style>{styles}</style>
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                    <img src="/images/generated/hero.png" alt="Hero" className="absolute inset-0 w-full h-full object-cover scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
                    <div className="relative z-10 text-white max-w-5xl px-4 flex flex-col items-center">
                        <div className="flex justify-center mb-6 animate-slide-up">
                            <span className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-[0.3em] uppercase">
                                {h.heroBadge}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 font-serif leading-[1.1] animate-slide-up">
                            {h.heroTitleLine1} <br />
                            <span className="text-green-400 drop-shadow-[0_2px_10px_rgba(74,222,128,0.3)]">{h.heroTitleLine2}</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-12 font-light max-w-2xl mx-auto leading-relaxed animate-slide-up">
                            {h.heroSubtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
                            <div className="w-full sm:w-auto bg-eling-red text-white font-bold py-5 px-12 rounded-full text-lg shadow-2xl flex items-center justify-center gap-3">
                                {h.ctaPrimary} <ArrowRight size={20} />
                            </div>
                            <div className="w-full sm:w-auto backdrop-blur-md bg-white/10 text-white border border-white/30 font-bold py-5 px-12 rounded-full text-lg shadow-2xl flex items-center justify-center gap-3">
                                {h.ctaSecondary}
                            </div>
                        </div>

                        {/* Quick Info Bar */}
                        <div className="mt-20 w-full max-w-4xl animate-slide-up">
                            <div className="flex flex-wrap justify-center md:grid md:grid-cols-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 lg:p-8 gap-8 md:gap-0">
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

                {/* About Section */}
                <section className="section-container bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                        <div className="lg:w-1/2 relative">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-eling-green opacity-5 rounded-full blur-3xl"></div>
                            <img src="/images/generated/resort.png" alt="Landscape" className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover relative z-10" />
                            <div className="absolute -bottom-8 -right-8 glass-card p-8 rounded-2xl shadow-xl z-20 max-w-[240px]">
                                <p className="text-eling-green font-bold text-3xl mb-1">100%</p>
                                <p className="text-gray-800 font-bold uppercase tracking-widest text-xs">Pemandangan Alamiah</p>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-6">Discovery</span>
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 font-serif leading-tight text-gray-900">Eling Bening: Harmoni <br /> Keindahan Alam & Kemewahan</h2>
                            <p className="text-gray-600 text-lg lg:text-xl font-light leading-relaxed mb-8 italic">Eling Bening menghadirkan harmoni antara arsitektur modern yang elegan dengan ketenangan alam pegunungan Ambarawa. Destinasi yang dirancang untuk membangkitkan panca indera dan menenangkan jiwa.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100"><Mountain size={18} className="text-eling-green" /> Natural Vibes</div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100"><Utensils size={18} className="text-eling-green" /> Fine Dining</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Highlights Section */}
                <section className="section-container bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">Activities</span>
                                <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Pengalaman Menarik</h2>
                            </div>
                            <p className="text-gray-500 max-w-md">Berbagai fasilitas dan aktivitas yang siap melengkapi hari libur Anda bersama keluarga.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: <Mountain size={32} />, title: "Panorama Alam", desc: "Nikmati pemandangan 360 derajat Danau Rawa Pening dari spot terbaik." },
                                { icon: <Utensils size={32} />, title: "Restoran & Cafe", desc: "Sajian kuliner khas Nusantara dan Internasional dengan view pegunungan." },
                                { icon: <Waves size={32} />, title: "Kolam Renang Infinity", desc: "Kolam renang mewah yang seolah menyatu dengan cakrawala pegunungan." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start gap-6">
                                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-eling-green">{item.icon}</div>
                                    <h3 className="font-bold text-2xl text-gray-900 font-serif">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-light">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gallery Preview */}
                <section className="section-container bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">Gallery</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6">Momen Indah di Eling Bening</h2>
                            <div className="w-24 h-1 bg-eling-green mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[600px]">
                            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl">
                                <img src="/images/generated/hero.png" className="w-full h-full object-cover" alt="Gallery" />
                            </div>
                            <div className="relative overflow-hidden rounded-3xl">
                                <img src="/images/generated/restaurant.png" className="w-full h-full object-cover" alt="Gallery" />
                            </div>
                            <div className="relative overflow-hidden rounded-3xl">
                                <img src="/images/generated/event.png" className="w-full h-full object-cover" alt="Gallery" />
                            </div>
                            <div className="md:col-span-2 relative overflow-hidden rounded-3xl">
                                <img src="/images/generated/resort.png" className="w-full h-full object-cover" alt="Gallery" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="section-container bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-eling-red uppercase tracking-[0.3em] font-bold text-sm block mb-4">Guest Reviews</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Apa Kata Mereka?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Andi Saputra", quote: "Pemandangannya luar biasa, sangat cocok untuk liburan keluarga.", rating: 5 },
                                { name: "Siti Rahma", quote: "Tempat favorit saya di Semarang. Makanannya enak dan viewnya bagus.", rating: 5 },
                                { name: "Jessica Lim", quote: "Kolam renangnya keren banget, view-nya nggak kalah sama di Bali.", rating: 4 }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(item.rating)].map((_, r) => <Star key={r} size={16} fill="#FACC15" className="text-yellow-400" />)}
                                    </div>
                                    <p className="text-gray-600 italic font-light leading-relaxed mb-6">"{item.quote}"</p>
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative py-32 px-6 flex items-center justify-center text-center">
                    <img src="/images/generated/hero.png" className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" alt="CTA BG" />
                    <div className="absolute inset-0 bg-eling-green/90 mix-blend-multiply"></div>
                    <div className="relative z-10 max-w-4xl">
                        <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 font-serif leading-tight">Siap Mengunjungi <br /> Eling Bening?</h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <div className="bg-white text-eling-green font-bold py-5 px-12 rounded-full text-xl shadow-2xl">Beli Tiket Sekarang</div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'about') {
        const a = content.about;
        return (
            <div className="preview-container font-sans text-gray-900 bg-gray-50">
                <style>{styles}</style>
                <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center overflow-hidden">
                    <img src="/images/hero-bg.png" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">{a.heroTitle}</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic opacity-90">{a.heroDesc}</p>
                    </div>
                </section>

                <section className="py-24 px-6 lg:px-24 bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 relative">
                            <div className="absolute -top-8 -left-8 w-32 h-32 bg-eling-green opacity-10 rounded-full"></div>
                            <img src="/images/hero-bg.png" alt="About" className="rounded-2xl shadow-2xl relative z-10 w-full object-cover aspect-[4/3] transition duration-700 hover:scale-[1.02]" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: <Mountain size={32} />, title: "Pemandangan Megah", desc: "Berada di dataran tinggi memberi kami keuntungan panorama alam yang tidak tertandingi." },
                                { icon: <Utensils size={32} />, title: "Kuliner Nusantara", desc: "Matahari terbenam paling indah dinikmati bersama makanan lezat." },
                                { icon: <BedDouble size={32} />, title: "Resort Berbintang", desc: "Kami menawarkan akomodasi premium bagi keluarga yang ingin menginap." },
                                { icon: <Waves size={32} />, title: "Rekreasi Segala Usia", desc: "Kolam renang infinity, outbound, dan playland anak." }
                            ].map((v, i) => (
                                <div key={i} className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">{v.icon}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">{v.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'contact') {
        const c = content.contact;
        return (
            <div className="preview-container font-sans text-gray-900 bg-white pb-24">
                <style>{styles}</style>
                <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center overflow-hidden">
                    <img src="/images/hero-bg.png" alt="Contact Hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">{c.title}</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic opacity-90">{c.subtitle}</p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 lg:px-24 py-24">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="lg:w-1/2">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Informasi Kontak</span>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 font-serif text-gray-900">Sapa Kami Kapan Saja</h2>
                            <p className="text-gray-600 leading-relaxed mb-12 text-lg italic">
                                Apakah Anda memiliki pertanyaan mengenai reservasi resort, pembelian tiket grup, atau acara pernikahan? Jangan ragu untuk menghubungi tim layanan pelanggan kami.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><MapPin size={24} /></div>
                                    <div><p className="font-bold text-gray-900 text-lg mb-1">Lokasi</p><p className="text-gray-600 text-sm leading-relaxed">{c.address}</p></div>
                                </div>
                                <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><Phone size={24} /></div>
                                    <div><p className="font-bold text-gray-900 text-lg mb-1">Telepon</p><p className="text-gray-600 text-sm">{c.phone}</p></div>
                                </div>
                                <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-eling-green shadow-sm shrink-0"><Mail size={24} /></div>
                                    <div><p className="font-bold text-gray-900 text-lg mb-1">Email</p><p className="text-gray-600 text-sm">{c.email}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 bg-gray-50 border border-gray-200 shadow-xl rounded-3xl p-10 h-fit italic text-gray-400">
                            <div className="space-y-6">
                                <div className="h-14 bg-white rounded-xl border border-gray-100" />
                                <div className="h-14 bg-white rounded-xl border border-gray-100" />
                                <div className="h-32 bg-white rounded-xl border border-gray-100" />
                                <div className="h-16 bg-eling-red opacity-80 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 h-[400px] w-full bg-gray-200 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center relative">
                        <MapPin size={48} className="text-gray-400 mb-4" />
                        <span className="absolute bottom-6 bg-white/80 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">Peta Interaktif Eling Bening</span>
                    </div>
                </section>
            </div>
        );
    }

    if (activeTab === 'facilities') {
        const f = content.facilities || [];
        return (
            <div className="preview-container font-sans text-gray-900 bg-gray-50 pb-24">
                <style>{styles}</style>
                <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center overflow-hidden">
                    <img src="/images/hero-bg.png" alt="Facilities Hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-white max-w-4xl px-4">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">Fasilitas Premium</h1>
                        <p className="text-lg lg:text-xl font-light tracking-wide italic">Kenyamanan dan kepuasan Anda adalah prioritas utama kami.</p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 lg:px-24 pt-24 text-center">
                    <div className="mb-16">
                        <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Layanan Kami</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-serif text-gray-900">Fasilitas Eling Bening</h2>
                        <div className="w-24 h-1 bg-eling-green mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {f.map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-eling-green hover:-translate-y-2 transition duration-500 group relative overflow-hidden text-left">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition duration-500 group-hover:scale-150 group-hover:bg-eling-green/5"></div>
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-eling-green transition duration-500 shadow-sm text-eling-green group-hover:text-white">
                                    <i className={`fas fa-${item.icon} text-2xl`}></i>
                                </div>
                                <h3 className="font-bold text-xl mb-4 text-gray-900 font-serif leading-tight">{item.title || item.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Peta Wisata Section */}
                <section className="bg-white py-24 px-6 lg:px-24 mt-24">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 bg-green-50 rounded-3xl p-8 lg:p-12 border border-green-100">
                        <div className="flex-1 text-left">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Lokasi & Panduan</span>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-serif text-gray-900">Peta Wisata Eling Bening</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Jelajahi seluruh area Eling Bening dengan mudah. Temukan lokasi fasilitas favorit Anda.
                            </p>
                            <div className="bg-eling-green text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 w-fit">
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

    return null;
};

export default function AdminContent() {
    const { content, updateContent } = useContent();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [previewDevice, setPreviewDevice] = useState('desktop');

    const handleChange = (key, value) => {
        updateContent(activeTab, key, value);
    };

    const handleSave = () => {
        toast.success('Website berhasil dipublikasikan!');
    };

    const tabs = [
        { id: 'home', label: 'Landpage', icon: HomeIcon },
        { id: 'about', label: 'Identity', icon: Info },
        { id: 'facilities', label: 'Fasilitas', icon: Sparkles },
        { id: 'contact', label: 'Connect', icon: PhoneIcon },
    ];

    const getFormFields = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-8">
                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <Sparkles size={14} /> Hero Section
                            </h4>
                            <p className="text-[11px] text-admin-text-muted leading-relaxed font-medium">
                                Gunakan copy yang kuat untuk memikat pengunjung dalam hitungan detik.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Hero Badge Text</label>
                                <input className="admin-input !bg-white" value={content.home.heroBadge} onChange={e => handleChange('heroBadge', e.target.value)} placeholder="misal: WELCOME TO" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label !text-xs !font-black uppercase tracking-tighter">Headline Line 1</label>
                                    <input className="admin-input !bg-white" value={content.home.heroTitleLine1} onChange={e => handleChange('heroTitleLine1', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label !text-xs !font-black uppercase tracking-tighter text-admin-primary">Headline Line 2 (Highlighted)</label>
                                    <input className="admin-input font-black !bg-white !border-admin-primary/30" value={content.home.heroTitleLine2} onChange={e => handleChange('heroTitleLine2', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Hero Subtitle / Catchphrase</label>
                                <textarea className="admin-textarea !bg-white" rows={4} value={content.home.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label !text-xs !font-black uppercase tracking-tighter text-admin-primary">Button Primary</label>
                                    <input className="admin-input !bg-white" value={content.home.ctaPrimary} onChange={e => handleChange('ctaPrimary', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label !text-xs !font-black uppercase tracking-tighter">Button Ghost</label>
                                    <input className="admin-input !bg-white" value={content.home.ctaSecondary} onChange={e => handleChange('ctaSecondary', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'about':
                return (
                    <div className="space-y-8">
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter text-admin-primary">About Hero Title</label>
                            <input className="admin-input !bg-white font-black" value={content.about.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Small Description Text</label>
                            <textarea className="admin-textarea !bg-white" rows={3} value={content.about.heroDesc} onChange={e => handleChange('heroDesc', e.target.value)} />
                        </div>
                        <div className="h-px bg-admin-border" />
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Article Section Title</label>
                            <input className="admin-input !bg-white" value={content.about.storyTitle} onChange={e => handleChange('storyTitle', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Main Story Content</label>
                            <textarea className="admin-textarea !bg-white" rows={6} value={content.about.storyP1} onChange={e => handleChange('storyP1', e.target.value)} />
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div className="space-y-8">
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Contact Page Headline</label>
                            <input className="admin-input !bg-white" value={content.contact.title} onChange={e => handleChange('title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Support Caption</label>
                            <textarea className="admin-textarea !bg-white" rows={2} value={content.contact.subtitle} onChange={e => handleChange('subtitle', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Support Email</label>
                                <input className="admin-input !bg-white" value={content.contact.email} onChange={e => handleChange('email', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label !text-xs !font-black uppercase tracking-tighter">Hotline / WA</label>
                                <input className="admin-input !bg-white" value={content.contact.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label !text-xs !font-black uppercase tracking-tighter">Full Business Address</label>
                            <textarea className="admin-textarea !bg-white" rows={4} value={content.contact.address} onChange={e => handleChange('address', e.target.value)} />
                        </div>
                    </div>
                );
            case 'facilities':
                return (
                    <div className="space-y-8">
                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <MapPin size={14} /> Peta Wisata
                            </h4>
                            <div className="form-group mb-0">
                                <label className="form-label !text-[10px] uppercase">Image URL (Peta Area)</label>
                                <input
                                    className="admin-input !bg-white !text-sm"
                                    value={content.mapImage}
                                    onChange={e => updateContent(null, 'mapImage', e.target.value)}
                                    placeholder="/images/peta.png"
                                />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-admin-primary/5 border border-admin-primary/10">
                            <h4 className="flex items-center gap-2 text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
                                <Sparkles size={14} /> Kelola Fasilitas
                            </h4>
                            <p className="text-[11px] text-admin-text-muted leading-relaxed font-medium">
                                Tambahkan atau ubah fasilitas yang ditampilkan di halaman utama.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {(content.facilities || []).map((f, idx) => (
                                <div key={idx} className="p-4 bg-white border border-admin-border rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-admin-primary uppercase tracking-widest">Fasilitas #{idx + 1}</span>
                                        <button
                                            onClick={() => {
                                                const updated = content.facilities.filter((_, i) => i !== idx);
                                                updateContent(null, 'facilities', updated);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label !text-[10px] uppercase">Nama Fasilitas</label>
                                        <input
                                            className="admin-input !text-sm"
                                            value={f.name || f.title}
                                            onChange={e => {
                                                const updated = content.facilities.map((item, i) => i === idx ? { ...item, name: e.target.value, title: e.target.value } : item);
                                                updateContent(null, 'facilities', updated);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label !text-[10px] uppercase">Deskripsi Singkat</label>
                                        <textarea
                                            className="admin-textarea !text-sm"
                                            rows={2}
                                            value={f.desc}
                                            onChange={e => {
                                                const updated = content.facilities.map((item, i) => i === idx ? { ...item, desc: e.target.value } : item);
                                                updateContent(null, 'facilities', updated);
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label !text-[10px] uppercase">FontAwesome Icon</label>
                                            <input
                                                className="admin-input !text-sm"
                                                value={f.icon}
                                                onChange={e => {
                                                    const updated = content.facilities.map((item, i) => i === idx ? { ...item, icon: e.target.value } : item);
                                                    updateContent(null, 'facilities', updated);
                                                }}
                                                placeholder="swimming-pool"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    const nextId = content.facilities.length > 0 ? Math.max(...content.facilities.map(f => f.id || 0)) + 1 : 1;
                                    const updated = [...(content.facilities || []), { id: nextId, name: 'Fasilitas Baru', title: 'Fasilitas Baru', desc: 'Deskripsi fasilitas baru...', icon: 'star', image: '/images/hero-bg.png' }];
                                    updateContent(null, 'facilities', updated);
                                }}
                                className="w-full py-3 border-2 border-dashed border-admin-border rounded-2xl text-admin-text-muted font-bold text-xs hover:border-admin-primary hover:text-admin-primary transition-all"
                            >
                                + Tambah Fasilitas Baru
                            </button>
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
                    <div className="px-3 py-1 bg-admin-bg rounded-lg border border-admin-border text-[9px] font-black tracking-[0.2em] text-admin-text-muted">
                        v2.4.0
                    </div>
                </div>

                <div className="flex p-4 gap-2 bg-admin-bg/50 border-b border-admin-border">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all ${activeTab === t.id
                                ? 'bg-white text-admin-primary shadow-lg shadow-admin-primary/10 border border-admin-primary/10'
                                : 'text-admin-text-muted hover:text-admin-text-main hover:bg-white'
                                }`}
                        >
                            <t.icon size={18} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
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
            <div className="flex-1 bg-admin-bg p-12 flex flex-col transition-all duration-500 min-h-0">
                <div className={`flex-1 flex flex-col mx-auto transition-all duration-500 min-h-0 ${previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'w-full'
                    }`}>
                    {/* Device Header */}
                    <div className="h-10 bg-slate-800 rounded-t-[2.5rem] flex items-center justify-between px-8 border-b border-slate-700 shadow-2xl relative">
                        <div className="flex gap-1.5 px-1">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/50 px-4 py-1 rounded-full border border-slate-700">
                            {!isSidebarOpen && (
                                <button onClick={() => setIsSidebarOpen(true)} className="text-white/60 hover:text-admin-primary transition-colors">
                                    <PanelLeftOpen size={14} />
                                </button>
                            )}
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                elingbening.com/{activeTab === 'home' ? '' : activeTab}
                            </span>
                        </div>
                        <button className="px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest animate-pulse">
                            Live
                        </button>
                    </div>

                    {/* Preview Viewport */}
                    <div className={`flex-1 overflow-hidden bg-white shadow-2xl transition-all duration-500 relative min-h-0 ${previewDevice === 'desktop' ? 'rounded-b-[2.5rem]' : 'rounded-b-none'
                        }`}>
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-white">
                            <PreviewRenderer activeTab={activeTab} content={content} />
                        </div>
                    </div>
                </div>

                {/* Status Bar / Tools */}
                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-lg border border-admin-border">
                        <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'desktop' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'tablet' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Tablet size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-2.5 rounded-full transition-all ${previewDevice === 'mobile' ? 'bg-admin-primary text-white shadow-lg' : 'text-admin-text-muted hover:text-admin-primary'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-admin-border">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-admin-text-main uppercase tracking-widest">Visual Studio Connected</span>
                        <div className="w-[1px] h-4 bg-admin-border mx-2" />
                        <button className="text-[10px] font-black text-admin-primary uppercase tracking-widest hover:underline flex items-center gap-1.5" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
                            {isSidebarOpen ? 'Hide Editor' : 'Show Editor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
