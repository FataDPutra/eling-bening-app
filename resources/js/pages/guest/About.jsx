import { Mountain, Utensils, BedDouble, Waves, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function About() {
    const { content, isLoading } = useContent();

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-eling-green" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in bg-gray-50 pb-24">
            <section className="relative md:h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden pt-48 md:pt-40 pb-32 md:pb-24">
                <img src={content.about.heroImage || "/images/hero-bg.png"} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-white max-w-4xl px-6">
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 font-serif">{content.about.heroTitle}</h1>
                    <p className="text-base md:text-xl font-light tracking-wide italic opacity-90">
                        {content.about.heroDesc}
                    </p>
                </div>
            </section>

            <section className="py-24 px-6 lg:px-24 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative">
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-eling-green opacity-10 rounded-full"></div>
                        <img src={content.about.storyImage || "/images/hero-bg.png"} alt="About" className="rounded-2xl shadow-2xl relative z-10 w-full object-cover aspect-[4/3] transition duration-700 hover:scale-[1.02]" />
                        <div className="absolute -bottom-6 -right-6 bg-white/80 backdrop-blur-md p-6 rounded-xl border-eling-green/30 border-2 z-20 shadow-xl">
                            <p className="text-eling-green font-bold text-xl">100% Alamiah</p>
                            <p className="text-gray-800 font-medium text-sm">Pesona Pegunungan</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <span className="text-eling-red uppercase tracking-widest font-bold text-sm block mb-4">Sejarah & Visi</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight font-serif text-gray-900">{content.about.storyTitle}</h2>
                        <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                            <p>{content.about.storyP1}</p>
                            <p>{content.about.storyP2}</p>
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
                        {(content.about.values || []).map((v, i) => (
                            <div key={i} className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                                <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                    <Mountain size={32} />
                                </div>
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
