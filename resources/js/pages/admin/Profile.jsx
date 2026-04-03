import { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { User, Mail, Lock, Save, Camera, ShieldCheck, KeyRound, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@elingbening.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            return toast.error('Konfirmasi password baru tidak cocok');
        }

        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            updateProfile({
                name: formData.name,
                email: formData.email
            });
            setIsSaving(false);
            toast.success('Profil berhasil diperbarui!');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }, 1000);
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-20">
            <header className="admin-page-header">
                <div>
                    <h1>Pengaturan Profil</h1>
                    <p className="text-admin-text-muted mt-1">Kelola informasi akun dan keamanan administrator Anda.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar & Quick Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="admin-card text-center py-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-admin-primary to-teal-400"></div>
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-admin-primary text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-admin-primary/20 mx-auto">
                                {formData.name.charAt(0)}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-admin-border text-admin-text-muted flex items-center justify-center hover:text-admin-primary transition-colors shadow-sm">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h3 className="font-black text-lg text-admin-text-main">{formData.name}</h3>
                        <p className="text-xs text-admin-text-muted mb-4">{formData.email}</p>
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-admin-primary/10 text-admin-primary text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Super Admin
                        </div>
                    </div>

                    <div className="admin-card bg-slate-900 border-none text-white">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">Statistik Akun</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Status Keamanan</p>
                                    <p className="text-xs font-bold text-green-400">Terproteksi</p>
                                </div>
                                <ShieldCheck size={16} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Terakhir Login</p>
                                <p className="text-xs font-bold">Hari ini, 14:20 WIB</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="admin-card space-y-8">
                        <section>
                            <div className="flex items-center gap-3 mb-8 border-b border-admin-border pb-4">
                                <div className="p-2 bg-admin-primary/10 rounded-lg text-admin-primary">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest leading-none">Identitas Dasar</h3>
                                    <p className="text-[11px] text-admin-text-muted mt-1.5">Informasi publik yang terlihat di dashboard.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <User size={18} />
                                        </div>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            placeholder="Nama lengkap Anda"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Alamat Email</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                            placeholder="email@elingbening.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-8 border-b border-admin-border pb-4">
                                <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest leading-none">Keamanan Akun</h3>
                                    <p className="text-[11px] text-admin-text-muted mt-1.5">Kelola kata sandi untuk melindungi akses Anda.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="form-group">
                                    <label className="form-label">Password Saat Ini</label>
                                    <div className="form-input-group">
                                        <div className="input-icon-box">
                                            <Fingerprint size={18} />
                                        </div>
                                        <input
                                            value={formData.currentPassword}
                                            onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                            type="password"
                                            placeholder="Wajib diisi jika ingin mengubah password"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="form-label">Password Baru</label>
                                        <div className="form-input-group">
                                            <div className="input-icon-box">
                                                <KeyRound size={18} />
                                            </div>
                                            <input
                                                value={formData.newPassword}
                                                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                                type="password"
                                                placeholder="Sandi baru..."
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Konfirmasi Password Baru</label>
                                        <div className="form-input-group">
                                            <div className="input-icon-box">
                                                <KeyRound size={18} />
                                            </div>
                                            <input
                                                value={formData.confirmPassword}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                type="password"
                                                placeholder="Ulangi sandi..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-primary min-w-[220px] justify-center shadow-xl shadow-admin-primary/20 h-[50px] font-black uppercase tracking-widest text-[11px]"
                            >
                                {isSaving ? (
                                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Syncing Changes...</>
                                ) : (
                                    <><Save size={18} /> Simpan Perubahan</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

