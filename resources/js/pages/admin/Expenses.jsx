import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, CircleDollarSign, Filter, Search, X, Receipt, ArrowDownCircle, Edit, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Expenses() {
    const [allExpenses, setAllExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', amount: '', category: 'operasional', transaction_date: new Date().toISOString().split('T')[0], notes: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isAllTime, setIsAllTime] = useState(false);

    const months = [
        { name: 'Januari', value: 1 }, { name: 'Februari', value: 2 }, { name: 'Maret', value: 3 },
        { name: 'April', value: 4 }, { name: 'Mei', value: 5 }, { name: 'Juni', value: 6 },
        { name: 'Juli', value: 7 }, { name: 'Agustus', value: 8 }, { name: 'September', value: 9 },
        { name: 'Oktober', value: 10 }, { name: 'November', value: 11 }, { name: 'Desember', value: 12 }
    ];

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/expenses');
            setAllExpenses(res.data);
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
        setFormData({ name: '', amount: '', category: 'operasional', transaction_date: new Date().toISOString().split('T')[0], notes: '' });
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, amount: Number(formData.amount) };
            if (isEditing) {
                await axios.put(`/api/expenses/${editId}`, payload);
                toast.success('Pengeluaran diperbarui');
            } else {
                await axios.post('/api/expenses', payload);
                toast.success('Pengeluaran dicatat');
            }
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error("Failed to save expense", error);
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Catatan?',
            text: "Data pengeluaran ini akan dihapus permanen dari sistem.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            borderRadius: '1.5rem',
            customClass: {
                popup: 'rounded-[1.5rem] border-none shadow-2xl',
                confirmButton: 'rounded-xl px-10 py-3 font-bold',
                cancelButton: 'rounded-xl px-10 py-3 font-bold'
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/expenses/${id}`);
                toast.success('Pengeluaran berhasil dihapus');
                fetchExpenses();
            } catch (error) {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const getFilteredExpenses = () => {
        return allExpenses.filter(e => {
            const date = new Date(e.transaction_date);
            const matchPeriod = isAllTime || (date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear));
            const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchPeriod && matchSearch;
        });
    };

    const filteredExpenses = getFilteredExpenses();
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-admin-text-main tracking-tight uppercase">Pengeluaran Operasional</h1>
                    <p className="text-xs md:text-sm text-admin-text-muted font-bold">Kelola dan audit semua biaya operasional resort.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center md:justify-end gap-3 w-full md:w-auto shrink-0">
                    <div className="relative w-full sm:w-auto">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm w-full sm:min-w-[200px] h-[45px]"
                        >
                            <Calendar size={16} className="text-admin-primary" /> {isAllTime ? 'Total Semua' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`}
                        </button>

                        {showMonthPicker && (
                            <>
                                <div className="fixed inset-0 z-[1000]" onClick={() => setShowMonthPicker(false)}></div>
                                <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-admin-border p-5 z-[1001] animate-scale-up">
                                    <button 
                                        onClick={() => {
                                            setIsAllTime(true);
                                            setShowMonthPicker(false);
                                        }}
                                        className={`w-full py-3 mb-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isAllTime 
                                            ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                            : 'bg-admin-bg text-admin-text-muted hover:bg-admin-border'
                                        }`}
                                    >
                                        Lihat Total Semua
                                    </button>
                                    
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-admin-border">
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><ChevronRight size={14} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map(m => (
                                            <button 
                                                key={m.value}
                                                onClick={() => {
                                                    setSelectedMonth(m.value);
                                                    setIsAllTime(false);
                                                    setShowMonthPicker(false);
                                                }}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                    !isAllTime && selectedMonth === m.value 
                                                    ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' 
                                                    : 'hover:bg-admin-bg text-admin-text-muted'
                                                }`}
                                            >
                                                {m.name.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button className={`btn-primary shadow-lg shadow-admin-primary/20 h-[45px] w-full sm:w-auto justify-center ${showForm ? '!bg-red-500' : ''}`} onClick={() => showForm ? resetForm() : setShowForm(true)}>
                        {showForm ? <X size={18} /> : <div className="flex items-center gap-2"><Plus size={18} /> Catat Pengeluaran</div>}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-card border-2 border-admin-primary/20 animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="admin-label">Nama Pengeluaran</label>
                                <input type="text" required className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Pembelian Sabun Mandi" />
                            </div>
                            <div>
                                <label className="admin-label">Kategori</label>
                                <select className="admin-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="operasional">Operasional</option>
                                    <option value="pemeliharaan">Pemeliharaan</option>
                                    <option value="gaji_karyawan">Gaji Karyawan</option>
                                    <option value="pemasaran">Pemasaran</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="admin-label">Nominal (Rp)</label>
                                <input type="number" required className="admin-input font-bold text-admin-primary" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
                            </div>
                            <div>
                                <label className="admin-label">Tanggal Transaksi</label>
                                <input type="date" required className="admin-input" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="admin-label">Catatan Tambahan</label>
                            <textarea className="admin-input min-h-[80px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Keterangan lebih lanjut..."></textarea>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-bold text-admin-text-muted hover:text-admin-text-main">Batal</button>
                            <button type="submit" className="btn-primary px-6">{isEditing ? 'Simpan Perubahan' : 'Catat Pengeluaran'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="admin-card bg-white border border-admin-border shadow-sm items-center flex">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100 shrink-0">
                            <ArrowDownCircle size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-admin-text-muted mb-1.5 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-400"></span>
                                Total Pengeluaran ({isAllTime ? 'Seluruh Waktu' : `${months.find(m => m.value == selectedMonth)?.name} ${selectedYear}`})
                            </p>
                            <h2 className="text-3xl font-black text-admin-text-main tracking-tight leading-none">{formatRupiah(totalExpense)}</h2>
                        </div>
                    </div>
                </div>
                <div className="admin-card overflow-hidden">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={18} />
                        <input type="text" className="w-full pl-12 pr-4 py-3 text-sm bg-admin-bg border-none rounded-xl focus:ring-1 focus:ring-admin-primary transition-all" placeholder="Cari nama pengeluaran atau catatan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="px-6 whitespace-nowrap">Tanggal</th>
                            <th className="px-6 whitespace-nowrap">Keterangan & Kategori</th>
                            <th className="px-6 whitespace-nowrap !text-right">Nominal</th>
                            <th className="px-6 whitespace-nowrap !text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="py-20 text-center text-admin-text-muted font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Sinkronisasi Data...</td></tr>
                        ) : filteredExpenses.length === 0 ? (
                            <tr><td colSpan="4" className="py-20 text-center text-admin-text-muted italic">Tidak ada catatan pengeluaran pada periode ini.</td></tr>
                        ) : filteredExpenses.map(e => (
                            <tr key={e.id} className="hover:bg-admin-bg/50 transition-all">
                                <td>
                                    <span className="text-[10px] font-black text-admin-text-muted">{new Date(e.transaction_date).toLocaleDateString('id-ID')}</span>
                                </td>
                                <td>
                                    <div className="font-bold text-admin-text-main">{e.name}</div>
                                    <div className="text-[10px] uppercase text-admin-text-muted tracking-widest">{e.category.replace('_', ' ')}</div>
                                </td>
                                <td className="text-right font-black text-red-600">{formatRupiah(e.amount)}</td>
                                <td className="px-6">
                                    <div className="flex items-center justify-center gap-3 w-full">
                                        <button onClick={() => { setFormData({ name: e.name, amount: e.amount, category: e.category, transaction_date: e.transaction_date, notes: e.notes || '' }); setIsEditing(true); setEditId(e.id); setShowForm(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2.5 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted hover:text-admin-primary hover:border-admin-primary transition-all shadow-sm active:scale-90"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(e.id)} className="p-2.5 rounded-xl bg-admin-bg border border-admin-border text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm active:scale-95"><Trash2 size={16} /></button>
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
