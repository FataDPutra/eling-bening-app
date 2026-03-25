import { Package, Plus } from 'lucide-react';

export default function Packages() {
    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Paket Bundling</h1>
                    <p>Kelola paket wisata Eling Bening yang mencakup penginapan, tiket, dan fasilitas lainnya.</p>
                </div>
                <button className="btn-primary py-2.5 shadow-lg shadow-admin-primary/20">
                    <Plus size={18} /> Buat Paket Baru
                </button>
            </div>

            <div className="admin-table-container">
                <div className="py-32 text-center">
                    <div className="mx-auto w-24 h-24 rounded-[2rem] bg-admin-bg flex items-center justify-center mb-8 text-admin-text-light opacity-20 rotate-12 group-hover:rotate-0 transition-transform cursor-default">
                        <Package size={48} />
                    </div>
                    <div className="max-w-md mx-auto space-y-4">
                        <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Belum ada paket aktif</h3>
                        <p className="text-xs text-admin-text-muted font-bold leading-relaxed">
                            Anda belum membuat paket bundling apapun. Mulai dengan membuat paket gabungan untuk menarik lebih banyak pengunjung Resort.
                        </p>
                        <div className="pt-6">
                            <button className="btn-primary py-3 px-8">
                                <Plus size={18} /> Tambah Data Paket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
