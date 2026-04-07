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
                    <div className="bg-white rounded-[2.5rem] border border-admin-border p-10 shadow-sm h-full">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-admin-border">
                            <div className="w-14 h-14 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center">
                                <Globe size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-admin-text-main">Global Meta Configuration</h3>
                                <p className="text-xs font-bold text-admin-text-muted uppercase tracking-widest mt-1">Search Engine Discovery</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3 block">
                                    <Type size={14} className="text-admin-primary" /> Situs Judul (Title Tag)
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.seo_title}
                                    onChange={e => setSettings({...settings, seo_title: e.target.value})}
                                    className="admin-input font-bold"
                                />
                                <p className="text-[10px] text-admin-text-light font-bold mt-2 ml-2">Muncul pada tab browser dan hasil pencarian Google.</p>
                            </div>

                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3 block">
                                    <FileText size={14} className="text-admin-primary" /> Meta Description
                                </label>
                                <textarea 
                                    rows="4" 
                                    value={settings.seo_description}
                                    onChange={e => setSettings({...settings, seo_description: e.target.value})}
                                    className="admin-input !h-auto resize-none leading-relaxed"
                                ></textarea>
                                <p className="text-[10px] text-admin-text-light font-bold mt-2 ml-2">Ringkasan konten yang ditampilkan di bawah judul pada mesin pencari.</p>
                            </div>

                            <div className="form-group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-2 mb-3 block">
                                    <MessageCircle size={14} className="text-admin-primary" /> WhatsApp Kontak Utama
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-admin-text-light font-black text-sm">+62</span>
                                    <input 
                                        type="text" 
                                        value={settings.contact_whatsapp}
                                        onChange={e => setSettings({...settings, contact_whatsapp: e.target.value.replace(/[^0-9]/g, '')})}
                                        className="admin-input !pl-16 font-mono text-xs"
                                        placeholder="81234567890"
                                    />
                                </div>
                                <p className="text-[10px] text-admin-text-light font-bold mt-2 ml-2">Gunakan format 812xxxx tanpa nol di depan (terhubung ke tombol chat).</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-admin-bg/30 rounded-[2.5rem] border-dashed border-2 border-admin-border p-8 h-fit">
                        <h4 className="text-sm font-black text-admin-text-main uppercase tracking-widest mb-6 text-center">Live Search Preview</h4>
                        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-black/5 border border-admin-border/50 hover:shadow-xl transition-all space-y-2">
                            <p className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
                                {settings.seo_title || 'Situs Judul...'}
                            </p>
                            <p className="text-[#006621] text-[11px] font-medium tracking-wide">https://elingbening.com</p>
                            <p className="text-[#4d5156] text-[13px] leading-relaxed line-clamp-2">
                                {settings.seo_description || 'Deskripsi meta dari situs Anda akan muncul di sini...'}
                            </p>
                        </div>
                        <p className="mt-6 text-[9px] text-admin-text-light font-bold italic text-center tracking-widest uppercase">
                            *Visualisasi Google Search
                        </p>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-admin-primary/5 border border-admin-primary/10">
                        <h4 className="text-xs font-black text-admin-primary uppercase tracking-widest mb-4">SEO Tip</h4>
                        <p className="text-[11px] font-bold text-admin-text-muted leading-relaxed">
                            Gunakan kata kunci relevan seperti "Resort Ambarawa", "Wisata Semarang", atau "View Rawa Pening" dalam deskripsi untuk meningkatkan visibilitas organik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
