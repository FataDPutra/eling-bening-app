import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Loader2, Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent } from '../../context/ContentContext';

export default function Gallery() {
    const { content, isLoading } = useContent();
    const [selectedImage, setSelectedImage] = useState(null);

    // Body Lock when modal open
    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImage]);

    const handleDownload = async (src, filename) => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'eling-bening-gallery.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Foto berhasil diunduh');
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for cross-origin if fetch fails
            const link = document.createElement('a');
            link.href = src;
            link.target = '_blank';
            link.download = filename || 'eling-bening-gallery.jpg';
            link.click();
        }
    };

    const handleShare = async (img) => {
        const shareData = {
            title: `Eling Bening - ${img.title}`,
            text: img.desc,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Berhasil dibagikan');
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            // Fallback: Copy link
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link galeri berhasil disalin ke clipboard');
        }
    };

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
            <section className="relative py-24 md:py-0 md:h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden pt-28">
                <img src={content.galleryHeroImage || "/images/hero-bg.png"} alt="Gallery Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 text-white max-w-4xl px-6">
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 font-serif">Galeri Foto</h1>
                    <p className="text-base md:text-xl font-light tracking-wide italic opacity-90">
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

            {/* Modal via Portal */}
            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative animate-scale-up" onClick={e => e.stopPropagation()}>
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
                            <p className="text-gray-600 leading-relaxed text-lg flex-1 line-clamp-6">
                                {selectedImage.desc}
                            </p>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                                <button 
                                    onClick={() => handleDownload(selectedImage.src, selectedImage.title + '.jpg')}
                                    className="flex-1 bg-eling-green text-white font-bold py-3 rounded-xl hover:bg-green-800 transition flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Simpan
                                </button>
                                <button 
                                    onClick={() => handleShare(selectedImage)}
                                    className="flex-1 border-2 border-eling-green text-eling-green font-bold py-3 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2"
                                >
                                    <Share2 size={18} /> Bagikan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
