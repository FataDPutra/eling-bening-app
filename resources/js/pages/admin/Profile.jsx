import { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { User, Mail, Lock, Save, Camera, ShieldCheck } from 'lucide-react';
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
            <div className="admin-page-header">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Pengaturan Profil</h1>
                    <p className="text-admin-text-muted">Kelola informasi akun dan keamanan administrator Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar & Quick Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="admin-card text-center py-10">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-admin-primary text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-admin-primary/20 mx-auto">
                                {formData.name.charAt(0)}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-admin-border text-admin-text-muted flex items-center justify-center hover:text-admin-primary transition-colors shadow-sm">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h3 className="font-bold text-lg text-admin-text-main">{formData.name}</h3>
                        <p className="text-xs text-admin-text-muted mb-4">{formData.email}</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck size={12} /> Super Admin
                        </div>
                    </div>

                    <div className="admin-card bg-admin-primary/5 border-admin-primary/10">
                        <h4 className="text-xs font-bold text-admin-primary uppercase tracking-widest mb-4">Informasi Tambahan</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-admin-text-muted uppercase font-bold mb-1">Terakhir Login</p>
                                <p className="text-xs font-bold text-admin-text-main">14 Maret 2026, 14:20 WIB</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-admin-text-muted uppercase font-bold mb-1">IP Address</p>
                                <p className="text-xs font-bold text-admin-text-main">192.168.1.1</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="admin-card space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border flex items-center gap-2">
                                <User size={16} className="text-admin-primary" /> Identitas Dasar
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            className="admin-input pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Alamat Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                        <input
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                            className="admin-input pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border flex items-center gap-2">
                                <Lock size={16} className="text-admin-primary" /> Keamanan Akun
                            </h3>
                            <div className="space-y-6">
                                <div className="form-group">
                                    <label className="form-label">Password Saat Ini</label>
                                    <input
                                        value={formData.currentPassword}
                                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                        type="password"
                                        className="admin-input"
                                        placeholder="Kosongkan jika tidak ingin mengubah password"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="form-label">Password Baru</label>
                                        <input
                                            value={formData.newPassword}
                                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                            type="password"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Konfirmasi Password Baru</label>
                                        <input
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            type="password"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-primary min-w-[200px] justify-center shadow-lg shadow-admin-primary/20"
                            >
                                {isSaving ? (
                                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
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
