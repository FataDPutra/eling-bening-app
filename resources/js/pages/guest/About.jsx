import { Mountain, Utensils, BedDouble, Waves } from 'lucide-react';

export default function About() {
    return (
        <div className="animate-fade-in bg-gray-50 pb-24">
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center overflow-hidden">
                <img src="/images/hero-bg.png" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-white max-w-4xl px-4">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">Tentang Kami</h1>
                    <p className="text-lg lg:text-xl font-light tracking-wide italic">
                        Mengenal lebih dekat surga tersembunyi Ambarawa.
                    </p>
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
                        <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight font-serif text-gray-900">Eling Bening Ambarawa</h2>
                        <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                            <p>Berawal dari kecintaan terhadap alam Jawa Tengah, Eling Bening didirikan untuk menjadi kawasan wisata terkemuka yang menjunjung tinggi keasrian lingkungan dan keramahan budaya lokal. Berlokasi di Ambarawa, kami menawarkan pemandangan spektakuler Danau Rawa Pening dan gugusan pegunungan yang mengelilinginya.</p>
                            <p>Visi kami adalah menjadikan Eling Bening destinasi utama keluarga untuk melepas penat dari kesibukan kota, sambil menikmati fasilitas bintang lima yang menyatu dengan harmoni alam.</p>
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
                        <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                <Mountain size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Pemandangan Megah</h3>
                                <p className="text-gray-600 leading-relaxed">Berada di dataran tinggi memberi kami keuntungan panorama alam yang tidak tertandingi. Setiap sudut Eling Bening didesain agar Anda bisa menikmati view ini sepenuhnya.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                <Utensils size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Kuliner Nusantara & Global</h3>
                                <p className="text-gray-600 leading-relaxed">Matahari terbenam paling indah dinikmati bersama makanan lezat. Kami menyajikan hidangan autentik Nusantara dan menu internasional pilihan.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                <BedDouble size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Resort Berbintang</h3>
                                <p className="text-gray-600 leading-relaxed">Selain rekreasi siang hari, kami menawarkan akomodasi premium bagi keluarga yang ingin menginap dengan fasilitas standar tinggi.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="bg-green-50 p-4 rounded-xl text-eling-green shrink-0">
                                <Waves size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Rekreasi Segala Usia</h3>
                                <p className="text-gray-600 leading-relaxed">Kolam renang infinity kami, sarana outbound, playland anak, dan taman bunga menjadikan Eling Bening destinasi komplit bagi semua umur.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
