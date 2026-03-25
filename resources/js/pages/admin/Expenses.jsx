import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, CircleDollarSign, Filter, Search, X, Receipt, ArrowDownCircle, Edit } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', amount: '', category: 'Operasional', date: new Date().toISOString().split('T')[0], note: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchExpenses = async () => {
        try {
            const res = await axios.get('/api/expenses');
            setExpenses(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
            toast.error("Gagal memuat data pengeluaran");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', amount: '', category: 'Operasional', date: new Date().toISOString().split('T')[0], note: '' });
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = { ...formData, amount: Number(formData.amount) };
            if (isEditing) {
                const res = await axios.put(`/api/expenses/${editId}`, payload);
                setExpenses(expenses.map(exp => exp.id === editId ? res.data : exp));
                toast.success('Pengeluaran berhasil diperbarui');
            } else {
                const res = await axios.post('/api/expenses', payload);
                setExpenses([res.data, ...expenses]);
                toast.success('Pengeluaran berhasil dicatat');
            }
            resetForm();
        } catch (error) {
            console.error("Failed to save expense", error);
            toast.error("Gagal menyimpan data pengeluaran");
        }
    };

    const handleEdit = (exp) => {
        setFormData({
            name: exp.name,
            amount: exp.amount,
            category: exp.category,
            date: exp.date,
            note: exp.note || ''
        });
        setIsEditing(true);
        setEditId(exp.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (confirm('Hapus catatan pengeluaran ini?')) {
            try {
                await axios.delete(`/api/expenses/${id}`);
                setExpenses(expenses.filter(e => e.id !== id));
                toast.success('Catatan dihapus');
            } catch (error) {
                console.error("Failed to delete expense", error);
                toast.error("Gagal menghapus catatan");
            }
        }
    };

    const filteredExpenses = expenses.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="admin-page-header">
                <div>
                    <h1>Pengeluaran Operasional</h1>
                    <p>Catat dan audit semua biaya operasional, gaji, dan pemeliharaan.</p>
                </div>
                <button className={`btn-primary shadow-lg shadow-admin-primary/20 ${showForm ? '!bg-danger' : ''}`} onClick={() => showForm ? resetForm() : setShowForm(true)}>
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Batal' : 'Catat Pengeluaran'}
                </button>
            </div>

            {showForm && (
                <div className="admin-table-container !p-8 border-2 border-admin-primary/20 animate-scale-up">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-2xl bg-admin-primary/10 text-admin-primary">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-admin-text-main">{isEditing ? 'Perbarui Transaksi' : 'Input Transaksi'}</h3>
                            <p className="text-xs text-admin-text-muted font-bold">{isEditing ? 'Lakukan perubahan pada data pengeluaran.' : 'Pastikan data pengeluaran sesuai dengan bukti kwitansi.'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">Nama Pengeluaran / Keperluan</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="admin-input" placeholder="misal: Pembelian Inventaris Resto" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kategori Biaya</label>
                                <div className="relative">
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="admin-input appearance-none">
                                        <option>Operasional</option>
                                        <option>Pemeliharaan</option>
                                        <option>Gaji Karyawan</option>
                                        <option>Pemasaran</option>
                                        <option>Lainnya</option>
                                    </select>
                                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">Jumlah Nominal (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-muted font-black text-sm">Rp</span>
                                    <input required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} type="number" className="admin-input !pl-12" placeholder="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tanggal Transaksi</label>
                                <input required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} type="date" className="admin-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Catatan / Detail Tambahan</label>
                            <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} rows="3" className="admin-textarea" placeholder="Tuliskan detail tambahan jika diperlukan..."></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-admin-border">
                            <button type="button" className="px-6 py-3 rounded-xl border border-admin-border text-admin-text-muted font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all" onClick={resetForm}>Batal</button>
                            <button type="submit" className="btn-primary py-3 px-8 shadow-xl shadow-admin-primary/20">
                                <CircleDollarSign size={18} /> {isEditing ? 'Perbarui Catatan' : 'Simpan Pengeluaran'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-table-container">
                <div className="table-header-actions">
                    <div className="topbar-search !w-full md:!w-96">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Detail Transaksi</th>
                            <th>Kategori</th>
                            <th>Nominal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Syncing financial logs...
                                </td>
                            </tr>
                        ) : filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-24 text-center">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-admin-bg flex items-center justify-center mb-6 text-admin-text-light opacity-30">
                                        <Receipt size={40} />
                                    </div>
                                    <p className="text-admin-text-muted font-black uppercase tracking-[0.2em] text-xs">Data pengeluaran masih kosong</p>
                                </td>
                            </tr>
                        ) : filteredExpenses.map(exp => (
                            <tr key={exp.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-admin-bg flex items-center justify-center text-admin-text-muted">
                                            <Calendar size={18} />
                                        </div>
                                        <span className="text-xs font-black text-admin-text-muted">
                                            {new Date(exp.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-black text-admin-text-main text-sm uppercase tracking-tight">{exp.name}</span>
                                        <span className="text-[10px] font-bold text-admin-text-muted flex items-center gap-1">
                                            <FileText size={10} /> {exp.note || 'Tidak ada catatan'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge-status bg-slate-100 text-slate-600 border-slate-200">
                                        {exp.category}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 font-black text-danger">
                                        <ArrowDownCircle size={14} />
                                        {formatRupiah(exp.amount)}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon text-admin-primary hover:bg-admin-primary/10" onClick={() => handleEdit(exp)} title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn-icon !text-danger hover:!bg-danger/10" onClick={() => handleDelete(exp.id)} title="Hapus">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
