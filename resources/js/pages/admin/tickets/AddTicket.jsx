import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Ticket, CalendarDays, Coins, Type } from 'lucide-react';
import { getTickets, saveTickets } from '../../../utils/data';
import toast from 'react-hot-toast';

export default function AddTicket() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', days: 'Weekday', price: '', priceWeekend: '', desc: '', status: 'active' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const tickets = getTickets();
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        const updated = [...tickets, { ...formData, id: newId, price: Number(formData.price), priceWeekend: Number(formData.priceWeekend) }];
        saveTickets(updated);
        toast.success('Tiket berhasil ditambahkan');
        navigate('/admin/tickets');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <button onClick={() => navigate('/admin/tickets')} className="flex items-center text-admin-text-muted hover:text-admin-primary mb-2 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
                    </button>
                    <h1>Tambah Kategori Tiket</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="admin-card space-y-6">
                        <h3 className="text-sm font-bold text-admin-text-main mb-6 pb-4 border-b border-admin-border">Konfigurasi Tiket</h3>

                        <div className="form-group">
                            <label className="form-label">Nama / Jenis Tiket</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input pl-10" placeholder="misal: Tiket Terusan" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">Hari Berlaku</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light" size={16} />
                                    <select value={formData.days} onChange={e => setFormData({ ...formData, days: e.target.value })} className="admin-input pl-10">
                                        <option>Weekday</option>
                                        <option>Weekend</option>
                                        <option>Semua Hari</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga Tiket (Weekday)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light font-bold text-sm">Rp</span>
                                    <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} type="number" className="admin-input pl-10" placeholder="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga Tiket (Weekend)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-light font-bold text-sm">Rp</span>
                                    <input required value={formData.priceWeekend} onChange={e => setFormData({ ...formData, priceWeekend: e.target.value })} type="number" className="admin-input pl-10" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi Singkat</label>
                            <textarea required rows="5" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="admin-textarea" placeholder="Jelaskan fasilitas atau area yang bisa diakses dengan tiket ini..."></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status Aktivasi</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="admin-input">
                                <option value="active">Aktif (Tampil di Guest)</option>
                                <option value="inactive">Non-aktif (Sembunyikan)</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate('/admin/tickets')} className="flex-1 py-3 px-4 rounded-xl border border-admin-border text-admin-text-muted font-bold text-sm hover:bg-admin-bg transition-all">
                                Batal
                            </button>
                            <button type="submit" className="flex-[2] btn-primary py-3 justify-center shadow-lg shadow-admin-primary/20">
                                <Save size={18} /> Simpan Tiket
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="admin-card bg-admin-primary/5 border-admin-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-admin-primary text-white">
                                <Ticket size={18} />
                            </div>
                            <h3 className="font-bold text-admin-text-main">Preview Kartu</h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-admin-border shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-admin-primary px-2 py-0.5 rounded-full bg-admin-primary-light">
                                    {formData.days || 'Weekday'}
                                </span>
                                <div className="text-right">
                                    <p className="text-[10px] text-admin-text-muted uppercase font-bold tracking-tighter">Mulai Dari</p>
                                    <p className="text-sm font-black text-admin-primary leading-tight">Rp {(Number(formData.price) || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <h4 className="font-bold text-admin-text-main mb-1">{formData.name || 'Nama Tiket'}</h4>
                            <p className="text-[10px] text-admin-text-muted line-clamp-2 leading-relaxed">
                                {formData.desc || 'Deskripsi tiket akan muncul di sini...'}
                            </p>
                        </div>
                        <p className="text-[10px] text-admin-text-muted mt-4 leading-relaxed italic">
                            *Ini adalah gambaran bagaimana tiket akan muncul di halaman pemesanan pengunjung.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-admin-bg border border-admin-border">
                        <h4 className="text-xs font-bold text-admin-text-main mb-2 flex items-center gap-2">
                            <Coins size={14} className="text-admin-primary" /> Tips Pengaturan
                        </h4>
                        <ul className="text-[11px] text-admin-text-muted space-y-2">
                            <li>• Gunakan nama yang jelas dan deskriptif.</li>
                            <li>• Pastikan harga sesuai dengan kategori hari.</li>
                            <li>• Detailkan fasilitas (misal: "Akses Kolam Renang").</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
