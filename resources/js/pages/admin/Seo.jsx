import { useState, useEffect } from 'react';
import { Globe, Save, MessageCircle, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Seo() {
    const [settings, setSettings] = useState({
        seo_title: 'Eling Bening Resort',
        seo_description: '',
        contact_whatsapp: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            if (response.data) {
                setSettings(prev => ({...prev, ...response.data}));
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            toast.error('Gagal mengambil pengaturan SEO.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const loadingToast = toast.loading('Menyimpan konfigurasi SEO...');
        try {
            await axios.post('/api/settings', settings);
            toast.success('Pengaturan SEO berhasil diperbarui!', { id: loadingToast });
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error('Gagal menyimpan pengaturan.', { id: loadingToast });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-admin-primary/20 border-t-admin-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 pb-20 max-w-5xl mx-auto">
            <div className="admin-page-header">
                <div>
                    <h1 className="text-3xl font-black text-admin-text-main tracking-tight">SEO & Pengaturan Web</h1>
                    <p className="text-admin-text-muted mt-2">Konfigurasi parameter optimasi mesin pencari dan informasi identitas platform.</p>
                </div>
                <button onClick={handleSave} className="flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-admin-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-admin-primary/30 hover:scale-105 active:scale-95 transition-all">
                    <Save size={18} /> Simpan Perubahan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="admin-card !p-10 shadow-lg">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-admin-border">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                <Globe size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-admin-text-main">Konfigurasi Meta Global</h3>
                                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Search Engine Discovery</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3">
                                    <Type size={14} className="text-admin-primary" /> Judul Situs (Title Tag)
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.seo_title}
                                    onChange={e => setSettings({...settings, seo_title: e.target.value})}
                                    className="admin-input !text-base focus:ring-4 focus:ring-admin-primary/5"
                                    placeholder="Eling Bening Resort & Rekreasi"
                                />
                                <p className="text-[10px] text-admin-text-light font-bold mt-3 bg-admin-bg p-3 rounded-xl border border-admin-border/50">
                                    💡 <span className="ml-1 italic text-admin-text-muted">Muncul pada tab browser dan hasil pencarian utama Google.</span>
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3">
                                    <FileText size={14} className="text-admin-primary" /> Deskripsi Meta
                                </label>
                                <textarea 
                                    rows="4" 
                                    value={settings.seo_description}
                                    onChange={e => setSettings({...settings, seo_description: e.target.value})}
                                    className="admin-input !h-auto resize-none leading-relaxed !text-sm"
                                    placeholder="Tulis ringkasan menarik tentang Eling Bening..."
                                ></textarea>
                                <p className="text-[10px] text-admin-text-light font-bold mt-3 bg-admin-bg p-3 rounded-xl border border-admin-border/50">
                                    💡 <span className="ml-1 italic text-admin-text-muted">Ringkasan konten yang ditampilkan di bawah judul pada mesin pencari.</span>
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3">
                                    <MessageCircle size={14} className="text-admin-primary" /> WhatsApp Reservasi / CS
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-admin-text-muted font-black text-sm pr-4 border-r border-admin-border">+62</span>
                                    <input 
                                        type="text" 
                                        value={settings.contact_whatsapp}
                                        onChange={e => setSettings({...settings, contact_whatsapp: e.target.value.replace(/[^0-9]/g, '')})}
                                        className="admin-input !pl-20 font-bold"
                                        placeholder="81234567890"
                                    />
                                </div>
                                <p className="text-[10px] text-admin-text-light font-bold mt-3 bg-admin-bg p-3 rounded-xl border border-admin-border/50">
                                    💡 <span className="ml-1 italic text-admin-text-muted">Format: 812xxxx tanpa angka 0 di depan. Terhubung langsung ke tombol bantuan.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="admin-card !bg-admin-text-main text-white !p-10 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-8 text-center flex items-center justify-center gap-2">
                             Preview Pencarian
                        </h4>
                        <div className="bg-white p-8 rounded-3xl shadow-lg space-y-3">
                            <p className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate leading-tight">
                                {settings.seo_title || 'Judul Situs...'}
                            </p>
                            <p className="text-[#006621] text-xs font-medium tracking-wide">https://elingbening.com</p>
                            <p className="text-[#4d5156] text-[13px] leading-relaxed line-clamp-3">
                                {settings.seo_description || 'Deskripsi meta dari situs Anda akan muncul di sini sebagai cuplikan hasil pencarian...'}
                            </p>
                        </div>
                        <p className="mt-8 text-[9px] text-white/30 font-black italic text-center tracking-[0.2em] uppercase">
                            *Visualisasi Google Search
                        </p>
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-amber-50 border border-amber-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                             <Globe size={120} />
                        </div>
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            🚀 Tips Akurasi SEO
                        </h4>
                        <p className="text-xs font-bold text-amber-900/70 leading-relaxed italic">
                            "Gunakan kata kunci populer seperti 'Landscape View Ambarawa' atau 'Resort & Restaurant' untuk meningkatkan ranking pencarian lokal."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
