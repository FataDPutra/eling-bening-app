import { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, Tag } from 'lucide-react';
import { getEvents } from '../../utils/data';

export default function Events() {
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        setEvents(getEvents().filter(e => e.status === 'active'));
    }, []);

    return (
        <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden">
                <img src={(events.length > 0 && Array.isArray(events[0].images) && events[0].images.length > 0 ? events[0].images[0] : (events.length > 0 ? events[0].image : '/images/generated/event.png')) || '/images/generated/event.png'} alt="Events at Eling Bening" className="absolute inset-0 w-full h-full object-cover" />
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

            {/* Event List */}
            <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition duration-500 flex flex-col group">
                            <div className="relative h-64 overflow-hidden">
                                <img src={(Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image) || '/images/generated/event.png'} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-eling-green shadow-sm">
                                        {event.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 text-eling-red font-bold text-sm mb-4 uppercase tracking-[0.2em]">
                                    <Calendar size={16} /> {event.date}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 font-serif group-hover:text-eling-green transition">{event.name}</h3>
                                <p className="text-gray-500 font-light mb-8 line-clamp-3">
                                    {event.desc}
                                </p>
                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Pricing</span>
                                        <span className="font-bold text-lg text-gray-900">{event.price}</span>
                                    </div>
                                    <button className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-eling-green transition shadow-lg">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
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
