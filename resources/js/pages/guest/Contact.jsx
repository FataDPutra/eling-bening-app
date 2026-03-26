import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Loader2, MapPinned } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function Contact() {
    const { content, isLoading } = useContent();
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        const handleGlobalReset = () => setIsInteracting(false);
        window.addEventListener('click', handleGlobalReset);
        return () => window.removeEventListener('click', handleGlobalReset);
    }, []);

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in bg-white pb-24">
            <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                <img src={content.contact.heroImage || "/images/hero-bg.png"} alt="Contact Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 text-white max-w-4xl px-4">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">{content.contact.title}</h1>
                    <p className="text-lg lg:text-xl font-light tracking-wide italic">
                        {content.contact.subtitle}
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 lg:px-24 pt-24">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <div className="lg:w-1/2">
                        <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">{content.contact.supportBadge}</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-8 font-serif text-gray-900">{content.contact.supportTitle}</h2>

                        <p className="text-gray-600 leading-relaxed mb-12 text-lg">
                            {content.contact.supportDesc}
                        </p>

                        <div className="space-y-8 mb-12">
                            <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg mb-1">Lokasi</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">{content.contact.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg mb-1">Telepon</p>
                                    <p className="text-gray-600 text-sm">{content.contact.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg mb-1">Email</p>
                                    <p className="text-gray-600 text-sm">{content.contact.email}</p>
                                </div>
                            </div>
                        </div>

                        <a href="https://wa.me/6281123456789" className="inline-flex justify-center items-center gap-3 bg-green-500 text-white font-bold py-4 px-8 w-full md:w-auto rounded-2xl hover:bg-green-600 transition shadow-lg text-lg">
                            <i className="fab fa-whatsapp text-2xl"></i>
                            Chat via WhatsApp
                        </a>
                    </div>

                    <div className="lg:w-1/2 bg-gray-50 border border-gray-200 shadow-xl rounded-3xl p-8 lg:p-12 h-fit">
                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-6">Kirim Pesan Langsung</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/50 transition shadow-sm" placeholder="Masukkan nama Anda" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
                                <input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/50 transition shadow-sm" placeholder="nama@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subjek Pesan</label>
                                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/50 transition shadow-sm text-gray-600">
                                    <option>Pertanyaan Umum</option>
                                    <option>Reservasi Resort</option>
                                    <option>Gathering & Event</option>
                                    <option>Keluhan Pelanggan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pesan Anda</label>
                                <textarea rows="5" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/50 transition shadow-sm resize-none" placeholder="Apa yang ingin Anda sampaikan?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-eling-red text-white font-bold py-4 rounded-xl hover:bg-red-800 transition shadow-lg text-lg mt-4">
                                Kirim Pesan
                            </button>
                        </form>
                    </div>
                </div>

                <div 
                    className="mt-24 h-[700px] w-full bg-gray-100 rounded-[4rem] shadow-[inset_0_4px_30px_rgba(0,0,0,0.05)] overflow-hidden relative group/map border-8 border-white"
                    onMouseLeave={() => setIsInteracting(false)}
                >
                    {/* Aesthetic Veil - Hides when interacting */}
                    <div className={`absolute inset-0 z-30 flex items-center justify-center flex-col transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isInteracting ? 'opacity-0 scale-125 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                        {/* Interactive Click Catcher */}
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] cursor-grab active:cursor-grabbing"
                            onMouseDown={() => setIsInteracting(true)}
                        />
                        
                        {/* Actual Visible Elements */}
                        <div className="relative z-10 pointer-events-none flex flex-col items-center">
                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-2xl border border-white/40 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8 transform transition-transform group-hover/map:scale-110 duration-700">
                                <MapPinned size={48} className="drop-shadow-lg" />
                            </div>
                            <div className="bg-black/40 backdrop-blur-xl px-12 py-5 rounded-full border border-white/20 shadow-2xl">
                                <p className="text-white font-black uppercase tracking-[0.5em] text-[10px]">
                                    Click to Explore Interactive Map
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-white/60 animate-bounce">
                                <i className="fas fa-mouse text-[10px]"></i>
                                <span className="text-[8px] font-bold uppercase tracking-widest">Move Scroll wheel or Drag</span>
                            </div>
                        </div>
                    </div>

                    <iframe
                        title="Eling Bening Interactive Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15830.34757657279!2d110.4045!3d-7.2657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a783783a3371b%3A0x6a0a09e075c3f6e!2sEling%20Bening!5e0!3m2!1sen!2sid!4v1700000000000"
                        className={`w-full h-full border-0 transition-all duration-1000 ${isInteracting ? 'grayscale-0 scale-100 shadow-2xl' : 'grayscale shadow-inner scale-105 opacity-80 blur-[0.5px]'}`}
                        allowFullScreen={false}
                        loading="lazy">
                    </iframe>
                    
                    {/* Small Close Label when interacting */}
                    {isInteracting && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-10 duration-700 pointer-events-none">
                            <div className="bg-eling-red/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-xl">
                                <span className="text-white text-[8px] font-black uppercase tracking-widest">Move Mouse Out to Lock</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
