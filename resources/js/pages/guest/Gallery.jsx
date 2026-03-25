import { useState } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function Gallery() {
    const { content, isLoading } = useContent();
    const [selectedImage, setSelectedImage] = useState(null);

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    const images = content.gallery || [
        { src: "/images/hero-bg.png", title: "Kolam Renang Utama", date: "12 Okt 2023", desc: "Fasilitas kolam renang infinity pool dengan pemandangan langsung ke Rawa Pening dan pegunungan sekitarnya." },
        { src: "/images/resort-room.png", title: "Villa & Resort Exclusive", date: "05 Nov 2023", desc: "Tipe kamar family suite yang menghadap ke matahari terbit, dilengkapi dengan balkon privat." },
        { src: "/images/hero-bg.png", title: "Restoran View", date: "22 Des 2023", desc: "Suasana senja di area restoran utama. Menyajikan hidangan nusantara dengan bahan lokal berkualitas." },
        { src: "/images/resort-room.png", title: "Interior Kamar", date: "10 Jan 2024", desc: "Desain interior kamar mengusung tema bumi dengan dominasi warna hijau Eling Bening dan furnitur kayu." },
        { src: "/images/hero-bg.png", title: "Taman Rekreasi", date: "14 Feb 2024", desc: "Area bermain anak dan taman bunga yang membentang luas, cocok untuk spot foto instagramable." },
        { src: "/images/hero-bg.png", title: "Spot Foto Ikonik", date: "01 Mar 2024", desc: "Spot foto kapal naga ikonik yang menjadi landmark kebanggaan Eling Bening Ambarawa." },
    ];

    return (
        <div className="animate-fade-in bg-white pb-24">
            <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-20">
                <img src={content.galleryHeroImage || "/images/hero-bg.png"} alt="Gallery Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 text-white max-w-4xl px-4">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">Galeri Foto</h1>
                    <p className="text-lg lg:text-xl font-light tracking-wide italic">
                        Abadikan momen terbaik Anda di Eling Bening Ambarawa.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 lg:px-24 pt-24">
                <div className="text-center mb-16">
                    <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Koleksi Kami</span>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-serif text-gray-900">Momen Indah di Eling Bening</h2>
                    <div className="w-24 h-1 bg-eling-green mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map((img, idx) => (
                        <div key={idx} onClick={() => setSelectedImage(img)} className="group relative overflow-hidden rounded-3xl aspect-[4/5] shadow-lg cursor-pointer">
                            <img src={img.src} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt={img.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-8">
                                <div className="transform translate-y-8 group-hover:translate-y-0 transition duration-500">
                                    <p className="text-eling-green font-bold text-sm uppercase tracking-widest mb-2">Eling Bening</p>
                                    <p className="text-white font-serif text-3xl leading-tight">{img.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition backdrop-blur-md">
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-3/5 bg-gray-100 h-64 md:h-[500px]">
                            <img src={selectedImage.src} alt={selectedImage.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="w-full md:w-2/5 p-8 flex flex-col">
                            <span className="text-eling-red uppercase tracking-widest font-bold text-xs mb-2">Eling Bening</span>
                            <h3 className="text-3xl font-bold font-serif text-gray-900 mb-4">{selectedImage.title}</h3>
                            <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm">
                                <Calendar size={16} />
                                <span>{selectedImage.date}</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-lg flex-1">
                                {selectedImage.desc}
                            </p>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                                <button className="flex-1 bg-eling-green text-white font-bold py-3 rounded-xl hover:bg-green-800 transition">
                                    Simpan Foto
                                </button>
                                <button className="flex-1 border-2 border-eling-green text-eling-green font-bold py-3 rounded-xl hover:bg-green-50 transition">
                                    Bagikan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
