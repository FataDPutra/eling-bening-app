import { useState, useEffect } from 'react';
import { Save, Shield, Globe, Lock, Key, BarChart3, RefreshCw, CreditCard, Mail, Server, AtSign, Settings2, Clock, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Settings() {
    const [settings, setSettings] = useState({
        midtrans_server_key: '',
        midtrans_client_key: '',
        midtrans_is_production: 'false',
        google_client_id: '',
        google_client_secret: '',
        google_analytics_id: '',
        max_reschedule_days: '7',
        min_reschedule_lead_days: '3',
        reschedule_admin_fee: '50000',
        mail_host: '',
        mail_port: '587',
        mail_username: '',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: '',
        mail_from_name: 'Eling Bening',
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
            toast.error('Gagal mengambil pengaturan sistem.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const loadingToast = toast.loading('Menyimpan konfigurasi sistem...');
        try {
            await axios.post('/api/settings', settings);
            toast.success('Pengaturan sistem berhasil diperbarui!', { id: loadingToast });
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error('Gagal menyimpan pengaturan.', { id: loadingToast });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-admin-primary/20 border-t-admin-primary rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted">Memuat Konfigurasi...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-24 space-y-10">
            <header className="admin-page-header">
                <div>
                    <h1 className="text-3xl font-black text-admin-text-main tracking-tight">Konfigurasi Sistem</h1>
                    <p className="text-admin-text-muted mt-2">Kelola kunci API keamanan tinggi, integrasi pihak ketiga, dan aturan operasional kawasan.</p>
                </div>
                <button onClick={handleSave} className="flex items-center gap-3 px-10 py-4 rounded-[2rem] bg-admin-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-admin-primary/30 hover:scale-105 active:scale-95 transition-all">
                    <Save size={18} /> Simpan Perubahan
                </button>
            </header>

            {/* Section 1: Payment Gateway */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <section className="admin-card !p-10 shadow-lg h-full">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-admin-border">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                <CreditCard size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-admin-text-main">Gerbang Pembayaran (Midtrans)</h3>
                                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Integrasi Pembayaran Otomatis</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="form-group">
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Lock size={14} className="text-emerald-500" /> Server Key (Secret)
                                </label>
                                <input 
                                    type="password" 
                                    className="admin-input font-serif tracking-widest text-sm" 
                                    value={settings.midtrans_server_key}
                                    onChange={e => setSettings({...settings, midtrans_server_key: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Key size={14} className="text-emerald-500" /> Client Key (Public)
                                </label>
                                <input 
                                    type="text" 
                                    className="admin-input font-mono text-xs" 
                                    value={settings.midtrans_client_key}
                                    onChange={e => setSettings({...settings, midtrans_client_key: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-admin-bg border border-admin-border flex items-center justify-between group hover:border-admin-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-all duration-500 ${settings.midtrans_is_production === 'true' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-200'}`}>
                                    <RefreshCw 
                                        size={20} 
                                        className={`transition-transform duration-700 ${settings.midtrans_is_production === 'true' ? 'rotate-180' : 'rotate-0'}`}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-admin-text-main">Mode Lingkungan (Environment)</p>
                                    <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                                        {settings.midtrans_is_production === 'true' ? '🔴 Live / Production Mode' : '🟡 Sandbox / Testing Mode'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.midtrans_is_production === 'true'}
                                    onChange={e => setSettings({...settings, midtrans_is_production: e.target.checked ? 'true' : 'false'})}
                                />
                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <section className="admin-card !p-8 shadow-md h-full bg-admin-primary/5 border-admin-primary/10">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-admin-primary/10">
                            <BarChart3 className="text-admin-primary" size={20} />
                            <h4 className="text-xs font-black text-admin-text-main uppercase tracking-widest">Google Analytics</h4>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="form-group">
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3 block text-center">GA4 Measurement ID</label>
                                <input 
                                    type="text" 
                                    className="admin-input !py-4 font-mono text-xs text-center border-dashed border-2" 
                                    placeholder="G-XXXXXXXXXX"
                                    value={settings.google_analytics_id}
                                    onChange={e => setSettings({...settings, google_analytics_id: e.target.value})}
                                />
                            </div>
                            <div className="p-5 rounded-2xl bg-white border border-admin-border/50 text-[11px] font-bold text-admin-text-muted leading-relaxed italic shadow-sm">
                                <p>🔑 ID ini digunakan untuk melacak traffic pengunjung di seluruh halaman Guest secara otomatis.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>


            {/* Section 3: Email / SMTP */}
            <section className="admin-card !p-10 shadow-lg">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-admin-border">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-admin-text-main">Konfigurasi Email (SMTP)</h3>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Pengiriman Nota Transaksi & Notifikasi Otomatis</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                            <Server size={14} className="text-blue-500" /> Host SMTP
                        </label>
                        <input 
                            type="text"
                            placeholder="smtp.gmail.com"
                            className="admin-input font-mono text-xs" 
                            value={settings.mail_host}
                            onChange={e => setSettings({...settings, mail_host: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block">Port & Enkripsi</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="587"
                                className="admin-input font-mono text-xs !w-24"
                                value={settings.mail_port}
                                onChange={e => setSettings({...settings, mail_port: e.target.value})}
                            />
                            <select 
                                className="admin-input !text-xs font-bold"
                                value={settings.mail_encryption}
                                onChange={e => setSettings({...settings, mail_encryption: e.target.value})}
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="">None</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                            <AtSign size={14} className="text-blue-500" /> Username Email
                        </label>
                        <input 
                            type="email"
                            placeholder="email@gmail.com"
                            className="admin-input text-xs font-bold" 
                            value={settings.mail_username}
                            onChange={e => setSettings({...settings, mail_username: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                            <Lock size={14} className="text-blue-500" /> Password / App Password
                        </label>
                        <input 
                            type="password"
                            className="admin-input font-serif tracking-widest text-sm" 
                            value={settings.mail_password}
                            onChange={e => setSettings({...settings, mail_password: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                            <Mail size={14} className="text-blue-500" /> Pengirim (From Email)
                        </label>
                        <input 
                            type="email"
                            placeholder="noreply@elingbening.com"
                            className="admin-input text-xs font-bold" 
                            value={settings.mail_from_address}
                            onChange={e => setSettings({...settings, mail_from_address: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block">Nama Pengirim</label>
                        <input 
                            type="text"
                            placeholder="Eling Bening"
                            className="admin-input font-bold" 
                            value={settings.mail_from_name}
                            onChange={e => setSettings({...settings, mail_from_name: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mt-8 p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500 h-fit"><Mail size={20} /></div>
                    <div className="text-[11px] font-bold text-blue-800 leading-relaxed">
                        💡 <strong>Penting:</strong> Untuk Gmail, gunakan <strong>App Password</strong> berdigit 16. <br/>
                        Pastikan Port 587 (TLS) atau 465 (SSL) terbuka pada server hosting Anda agar email dapat terkirim dengan lancar.
                    </div>
                </div>
            </section>

            {/* Section 4: OAuth Security */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <section className="admin-card !p-10 shadow-lg h-full">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-admin-border">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-admin-text-main">Keamanan OAuth (Google Login)</h3>
                                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Google Identity Cloud Service Integration</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="form-group">
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block">Google Cloud Client ID</label>
                                <input 
                                    type="text" 
                                    className="admin-input font-mono text-xs" 
                                    value={settings.google_client_id}
                                    onChange={e => setSettings({...settings, google_client_id: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 block">Secure Client Secret</label>
                                <input 
                                    type="password" 
                                    className="admin-input font-serif tracking-widest text-xs" 
                                    value={settings.google_client_secret}
                                    onChange={e => setSettings({...settings, google_client_secret: e.target.value})}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-admin-text-main rounded-[2.5rem] p-10 text-white shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div>
                            <Globe size={40} className="mb-8 text-admin-primary opacity-80" />
                            <h4 className="text-xl font-black leading-tight mb-4 tracking-tight">Status Sinkronisasi Global</h4>
                            <p className="text-[11px] opacity-50 font-medium leading-relaxed mb-6 italic">Sistem Anda saat ini terhubung dengan protokol enkripsi RSA-256. Seluruh audit log finansial dicatat berdasarkan standar UTC+7.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 w-fit px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Aktif & Terlindungi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
