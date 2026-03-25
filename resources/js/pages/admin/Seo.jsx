import { Globe, Save, MessageCircle, Type, FileText } from 'lucide-react';

export default function Seo() {
    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>SEO & Pengaturan Web</h1>
                    <p>Konfigurasi parameter optimasi mesin pencari dan informasi identitas platform.</p>
                </div>
                <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20">
                    <Save size={18} /> Simpan Perubahan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="admin-table-container !p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-admin-primary/10 text-admin-primary">
                                <Globe size={20} />
                            </div>
                            <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Global Meta Configuration</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2">
                                    <Type size={14} className="text-admin-primary" /> Situs Judul (Title Tag)
                                </label>
                                <input 
                                    type="text" 
                                    defaultValue="Eling Bening Resort & Rekreasi" 
                                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all"
                                />
                                <p className="text-[10px] text-admin-text-light font-bold">Muncul pada tab browser dan hasil pencarian Google.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2">
                                    <FileText size={14} className="text-admin-primary" /> Meta Description
                                </label>
                                <textarea 
                                    rows="4" 
                                    defaultValue="Destinasi alam premium di Ambarawa dengan fasilitas resort eksklusif dan rekreasi air." 
                                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all resize-none"
                                ></textarea>
                                <p className="text-[10px] text-admin-text-light font-bold">Ringkasan konten yang ditampilkan di bawah judul pada mesin pencari.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2">
                                    <MessageCircle size={14} className="text-admin-primary" /> WhatsApp Kontak Utama
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-admin-text-light font-black text-sm">+62</span>
                                    <input 
                                        type="text" 
                                        defaultValue="81234567890" 
                                        className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-admin-text-main focus:outline-none focus:border-admin-primary transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-admin-text-light font-bold">Nomor yang akan dihubungkan ke tombol chat di website.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="admin-table-container !p-8 bg-admin-bg/30 border-dashed border-2">
                        <h4 className="text-sm font-black text-admin-text-main uppercase tracking-widest mb-6">Search Preview</h4>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-admin-border space-y-2">
                            <p className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">Eling Bening Resort & Rekreasi</p>
                            <p className="text-[#006621] text-xs">https://elingbening.com</p>
                            <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                                Destinasi alam premium di Ambarawa dengan fasilitas resort eksklusif dan rekreasi air. Nikmati pemandangan Rawa Pening...
                            </p>
                        </div>
                        <p className="mt-6 text-[10px] text-admin-text-light font-bold italic text-center">
                            *Visualisasi perkiraan tampilan di Google Search
                        </p>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-admin-primary/5 border border-admin-primary/10 space-y-4">
                        <h4 className="text-xs font-black text-admin-primary uppercase tracking-widest">SEO Tip</h4>
                        <p className="text-[11px] font-bold text-admin-text-muted leading-relaxed">
                            Gunakan kata kunci relevan seperti "Resort Ambarawa", "Wisata Semarang", atau "View Rawa Pening" dalam deskripsi untuk meningkatkan visibilitas organik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
