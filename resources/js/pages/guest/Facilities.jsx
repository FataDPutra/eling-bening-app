import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Utensils, BedDouble, Waves, MapPin, Phone, Mail, X, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import IconRenderer from '../../components/IconRenderer';

export default function Facilities() {
    const { content, isLoading } = useContent();
    const [showMap, setShowMap] = useState(false);

    // Body Lock when modal open
    useEffect(() => {
        if (showMap) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showMap]);
    const facilities = content.facilities || [];

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in bg-gray-50 pb-24">
            <section className="relative py-24 md:py-0 md:h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-28">
                <img src={content.eventHeroImage || "/images/hero-bg.png"} alt="Facilities Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 text-white max-w-4xl px-6">
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 font-serif">Fasilitas Premium</h1>
                    <p className="text-base md:text-xl font-light tracking-wide italic opacity-90">
                        Kenyamanan dan kepuasan Anda adalah prioritas utama kami.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 lg:px-24 pt-24">
                <div className="text-center mb-16">
                    <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Layanan Kami</span>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-serif text-gray-900">Fasilitas Eling Bening</h2>
                    <div className="w-24 h-1 bg-eling-green mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {facilities.map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-eling-green hover:-translate-y-2 transition duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition duration-500 group-hover:scale-150 group-hover:bg-eling-green/5"></div>

                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:ring-2 group-hover:ring-eling-green/20 transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:scale-110">
                                <IconRenderer icon={item.icon} size={32} className="text-eling-green transition duration-500" />
                            </div>

                            <h3 className="font-bold text-xl mb-4 text-gray-900 font-serif leading-tight">{item.title || item.name}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Peta Wisata Section */}
            <section className="bg-white py-24 px-6 lg:px-24">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 bg-green-50 rounded-3xl p-8 lg:p-12 border border-green-100">
                    <div className="flex-1">
                        <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Lokasi & Panduan</span>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-serif text-gray-900">Peta Wisata Eling Bening</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Jelajahi seluruh area Eling Bening dengan mudah. Temukan lokasi fasilitas favorit Anda, mulai dari restoran, kolam renang, area resort, hingga spot-spot foto terbaik kami.
                        </p>
                        <button
                            onClick={() => setShowMap(true)}
                            className="bg-eling-green text-white px-8 py-4 rounded-xl font-bold hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-emerald-900/20 hover:scale-105 active:scale-95 flex items-center gap-3 group"
                        >
                            <MapPin size={20} className="group-hover:rotate-12 transition-transform duration-300" /> Lihat Peta Lengkap
                        </button>
                    </div>
                    <div className="flex-1 w-full relative group">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white cursor-pointer" onClick={() => setShowMap(true)}>
                            {/* Dynamic Map Illustration */}
                            <img src={content.mapImage || "/images/hero-bg.png"} alt="Map Preview" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 blur-[2px] group-hover:blur-0" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-500 rounded-2xl flex items-center justify-center">
                                <span className="bg-white/90 text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg backdrop-blur-sm shadow-black/20 group-hover:scale-110 transition duration-300">Buka Peta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Modal */}
            {showMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setShowMap(false)}>
                    <div className="bg-white rounded-3xl overflow-hidden w-full h-full max-h-[90vh] max-w-6xl shadow-2xl relative flex flex-col animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="p-4 bg-white flex justify-between items-center border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="font-bold text-xl font-serif text-gray-900">Peta Area Eling Bening</h3>
                                <p className="text-xs text-gray-500">Ambarawa, Jawa Tengah</p>
                            </div>
                            <button onClick={() => setShowMap(false)} className="w-10 h-10 bg-gray-100 hover:bg-eling-red hover:text-white hover:rotate-90 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-200 relative">
                            {/* Embedded Google Map / Image Map */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15831.90563467439!2d110.42159815000001!3d-7.24227915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70810db6e379b3%3A0x6bbaeee2bc55ecba!2sEling%20Bening!5e0!3m2!1sid!2sid!4v1716301323334!5m2!1sid!2sid"
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>

                            {/* Overlay Legend */}
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-xs md:max-w-sm">
                                <h4 className="font-bold text-sm mb-3 border-b pb-2 uppercase tracking-wide text-eling-green">Panduan Lokasi</h4>
                                <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Titik Kumpul</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Kolam Renang</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Restoran</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div> Resort Area</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
