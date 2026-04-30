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
            <section className="relative md:h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden pt-48 md:pt-40 pb-32 md:pb-24">
                <img src={content.contact.heroImage || "/images/hero-bg.png"} alt="Contact Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 text-white max-w-4xl px-6">
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 font-serif">{content.contact.title}</h1>
                    <p className="text-base md:text-xl font-light tracking-wide italic opacity-90">
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

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-eling-green/30 transition-colors group/card">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green group-hover/card:scale-110 transition-transform">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Lokasi</p>
                                    <p className="text-gray-500 text-xs leading-relaxed">{content.contact.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-eling-green/30 transition-colors group/card">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green group-hover/card:scale-110 transition-transform">
                                    <Phone size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Telepon</p>
                                    <p className="text-gray-500 text-xs font-bold">{content.contact.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-eling-green/30 transition-colors group/card">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-eling-green group-hover/card:scale-110 transition-transform">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm mb-0.5 uppercase tracking-wide">Email</p>
                                    <p className="text-gray-500 text-xs font-bold">{content.contact.email}</p>
                                </div>
                            </div>
                        </div>

                        <a href="https://wa.me/6281123456789" target="_blank" rel="noreferrer" className="flex justify-center items-center gap-3 bg-[#25D366] text-white font-black py-5 w-full rounded-2xl hover:bg-[#22c35e] transition-all duration-300 shadow-xl shadow-green-200 hover:scale-[1.02] active:scale-[0.98] text-xs uppercase tracking-[0.3em] group/wa">
                            <i className="fab fa-whatsapp text-xl group-hover/wa:rotate-12 transition-transform"></i>
                            Chat via WhatsApp
                        </a>
                    </div>

                    <div className="lg:w-1/2 bg-white border border-gray-100 shadow-[0_32px_80px_rgba(0,0,0,0.06)] rounded-[3rem] p-8 lg:p-12 h-fit relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-eling-green/5 rounded-bl-[100%] transition-transform duration-700 group-hover:scale-150"></div>
                        
                        <h3 className="text-3xl font-black font-serif text-gray-900 mb-8 relative z-10">Kirim Pesan Langsung</h3>
                        
                        <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/field:text-eling-green transition-colors">
                                            <i className="fas fa-user-circle"></i>
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/20 focus:bg-white focus:border-eling-green/30 transition-all shadow-sm text-sm font-medium" 
                                            placeholder="Masukkan nama Anda" 
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Alamat Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/field:text-eling-green transition-colors">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <input 
                                            type="email" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/20 focus:bg-white focus:border-eling-green/30 transition-all shadow-sm text-sm font-medium" 
                                            placeholder="nama@email.com" 
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Subjek Pesan</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/field:text-eling-green transition-colors">
                                            <i className="fas fa-layer-group"></i>
                                        </div>
                                        <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/20 focus:bg-white focus:border-eling-green/30 transition-all shadow-sm text-sm font-black text-gray-600 appearance-none cursor-pointer">
                                            <option>Pertanyaan Umum</option>
                                            <option>Reservasi Resort</option>
                                            <option>Gathering & Event</option>
                                            <option>Keluhan Pelanggan</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                            <i className="fas fa-chevron-down text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Pesan Anda</label>
                                    <div className="relative">
                                        <div className="absolute top-4 left-0 pl-4 pointer-events-none text-gray-400 group-focus-within/field:text-eling-green transition-colors">
                                            <i className="fas fa-comment-dots"></i>
                                        </div>
                                        <textarea 
                                            rows="4" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-eling-green/20 focus:bg-white focus:border-eling-green/30 transition-all shadow-sm resize-none text-sm font-medium" 
                                            placeholder="Apa yang ingin Anda sampaikan?"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-eling-red text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-red-800 transition-all duration-300 shadow-xl shadow-eling-red/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group/btn">
                                Kirim Pesan <i className="fas fa-paper-plane group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"></i>
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
