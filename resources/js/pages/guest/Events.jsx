import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function Events() {
    const { content, isLoading: contentLoading } = useContent();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/api/events');
                setEvents(data.filter(e => e.is_active));
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
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
        <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                <img src={content.eventHeroImage || '/images/hero-bg.png'} alt="Events at Eling Bening" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                <div className="relative z-10 text-white max-w-4xl px-4">
                    <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold tracking-widest uppercase mb-6 inline-block">
                        Events & Wedding
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight">
                        Momen Berharga <br /> Dalam Keindahan Alam
                    </h1>
                    <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90">
                        Dari pernikahan romantis hingga gathering perusahaan, kami menyediakan venue terbaik dengan panorama Rawa Pening yang tak terlupakan.
                    </p>
                </div>
            </section>

            {/* EVENT LISTING ENGINE */}
            <section className="max-w-7xl mx-auto px-4 pt-16 pb-32 relative z-20">
                <div className="flex flex-col mb-16">
                    <span className="text-eling-green font-black uppercase tracking-[0.4em] text-[10px] mb-4">Official Manifest</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-serif leading-none uppercase tracking-tighter">Event & Reservation Manifest</h2>
                    <div className="w-20 h-1.5 bg-eling-green mt-6 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-admin-bg rounded-[2.5rem] h-[500px]"></div>
                        ))
                    ) : events.map((event) => (
                        <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50 hover:shadow-eling-green/10 hover:border-eling-green/20 transition-all duration-700 flex flex-col group relative">
                            {/* Card Image Wrapper */}
                            <div className="relative h-72 overflow-hidden bg-gray-100">
                                <img 
                                    src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image) || '/images/generated/event.png'} 
                                    alt={event.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out grayscale-[0.2] group-hover:grayscale-0" 
                                />
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-eling-green shadow-sm border border-white/20">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-6 right-6">
                                    <div className="bg-eling-green text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        BOOKABLE
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-10 flex-grow flex flex-col">
                                <div className="flex items-center gap-3 text-eling-red font-black text-[10px] mb-6 uppercase tracking-[0.3em]">
                                    <div className="w-8 h-8 rounded-lg bg-eling-red/5 flex items-center justify-center">
                                        <Calendar size={14} />
                                    </div>
                                    {event.date_info}
                                </div>
                                
                                <h3 className="text-2xl font-black mb-4 font-serif text-gray-900 leading-tight group-hover:text-eling-green transition-colors duration-500 capitalize tracking-tighter">{event.name}</h3>
                                
                                <p className="text-gray-400 text-sm font-medium mb-8 line-clamp-3 leading-relaxed">
                                    {event.description}
                                </p>
                                
                                <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1 italic">Investment From</span>
                                        <span className="font-black text-xl text-gray-900 tracking-tighter">{event.price_info}</span>
                                    </div>
                                    <button className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-eling-green hover:shadow-xl hover:shadow-eling-green/30 transition-all duration-500 scale-90 group-hover:scale-100">
                                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                        <button className="bg-white text-eling-green font-bold py-5 px-10 rounded-2xl shadow-xl hover:bg-gray-50 transition border-none text-lg">
                            Hubungi Tim Event
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
