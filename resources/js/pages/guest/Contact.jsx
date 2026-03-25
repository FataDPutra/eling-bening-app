import { MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function Contact() {
    const { content, isLoading } = useContent();

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

                <div className="mt-24 h-[600px] w-full bg-gray-200 rounded-3xl shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                        <i className="fas fa-map-marked-alt text-6xl text-gray-400 mb-4 drop-shadow-md"></i>
                        <p className="text-gray-700 font-bold uppercase tracking-widest drop-shadow-md bg-white/80 px-6 py-2 rounded-full backdrop-blur-sm shadow-sm">Peta Interaktif Eling Bening</p>
                    </div>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15830.34757657279!2d110.4045!3d-7.2657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a783783a3371b%3A0x6a0a09e075c3f6e!2sEling%20Bening!5e0!3m2!1sen!2sid!4v1700000000000"
                        className="w-full h-full border-0 grayscale hover:grayscale-0 transition duration-1000 relative z-0"
                        allowFullScreen={false}
                        loading="lazy">
                    </iframe>
                </div>
            </section>
        </div>
    );
}
