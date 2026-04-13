import { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, Calendar, User, Hash, ArrowRight, MessageSquare, AlertCircle, Save, BadgeDollarSign, AlertTriangle, Calculator, TrendingUp, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Reschedule() {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPolicy, setIsSavingPolicy] = useState(false);
    const [policy, setPolicy] = useState({
        max_reschedule_days: '7',
        min_reschedule_lead_days: '2',
        reschedule_admin_fee: '0',
        reschedule_penalty: '0',
        reschedule_hold_hours: '2',
    });

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

    const fetchPolicy = async () => {
        try {
            const res = await axios.get('/api/settings');
            setPolicy(prev => ({
                ...prev,
                max_reschedule_days: res.data.max_reschedule_days ?? '7',
                min_reschedule_lead_days: res.data.min_reschedule_lead_days ?? '2',
                reschedule_admin_fee: res.data.reschedule_admin_fee ?? '0',
                reschedule_penalty: res.data.reschedule_penalty ?? '0',
                reschedule_hold_hours: res.data.reschedule_hold_hours ?? '2',
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSavePolicy = async () => {
        setIsSavingPolicy(true);
        const load = toast.loading('Menyimpan kebijakan...');
        try {
            await axios.post('/api/settings', {
                max_reschedule_days: policy.max_reschedule_days,
                min_reschedule_lead_days: policy.min_reschedule_lead_days,
                reschedule_admin_fee: policy.reschedule_admin_fee,
                reschedule_penalty: policy.reschedule_penalty,
                reschedule_hold_hours: policy.reschedule_hold_hours,
            });
            toast.success('Kebijakan berhasil disimpan!', { id: load });
        } catch (err) {
            toast.error('Gagal menyimpan kebijakan', { id: load });
        } finally {
            setIsSavingPolicy(false);
        }
    };

    const fetchReschedules = async () => {
        try {
            const res = await axios.get('/api/reschedules');
            setRequests(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch reschedules', error);
            toast.error('Gagal memuat data reschedule');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReschedules();
        fetchPolicy();
    }, []);

    const handleAction = async (id, newStatus) => {
        try {
            const res = await axios.put(`/api/reschedules/${id}`, { 
                status: newStatus,
                admin_notes: selectedReq?.admin_notes 
            });
            const updatedItem = res.data;
            setRequests(requests.map(r => r.id === id ? updatedItem : r));
            
            const statusLabels = {
                approved_awaiting_payment: 'disetujui (menunggu bayar)',
                completed: 'selesai (jadwal diupdate)',
                rejected: 'ditolak'
            };

            toast.success(`Permintaan ${statusLabels[newStatus] || newStatus}`);
            if (selectedReq && selectedReq.id === id) setSelectedReq(updatedItem);
        } catch (error) {
            console.error('Failed to update reschedule status', error);
            toast.error('Gagal memperbarui status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':  
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Clock size={12} /> Pending
                </span>;
            case 'approved_awaiting_payment': 
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                    <BadgeDollarSign size={12} /> Siap Bayar
                </span>;
            case 'completed': 
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Check size={12} /> Terjadwal Ulang
                </span>;
            case 'rejected': 
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <X size={12} /> Ditolak
                </span>;
            default: return <span className="badge-status">{status}</span>;
        }
    };

    // Live example calculation for formula card
    const exampleWeekdayPrice = 800000;
    const exampleWeekendPrice = 1200000;
    const exampleNights = 2;
    const exampleOldTotal = exampleWeekdayPrice * exampleNights;
    const exampleNewTotal = exampleWeekendPrice * exampleNights;
    const examplePriceDiff = Math.max(0, exampleNewTotal - exampleOldTotal);
    const adminFeeNum = Number(policy.reschedule_admin_fee) || 0;
    const penaltyNum  = Number(policy.reschedule_penalty)  || 0;
    const exampleFinal = examplePriceDiff + adminFeeNum + penaltyNum;

    const filteredRequests = requests.filter(req => {
        if (isAllTime) return true;
        const date = new Date(req.created_at);
        return (date.getMonth() + 1) === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
    });

    return (
        <div className="animate-fade-in space-y-8">
            <div className="admin-page-header">
                <div>
                    <h1>Kelola Reschedule</h1>
                    <p>Konfigurasi kebijakan biaya dan tinjau permintaan perubahan jadwal tamu.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-admin-border bg-white text-admin-text-main font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm min-w-[200px] h-[45px]"
                        >
                            <Calendar size={16} className="text-admin-primary" /> {isAllTime ? 'Total Semua' : `${months.find(m => m.value === selectedMonth).name} ${selectedYear}`}
                        </button>

                        {showMonthPicker && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)}></div>
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-admin-border p-5 z-50 animate-scale-up">
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
                                        <button onClick={() => { setSelectedYear(y => y - 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreVertical size={14} className="rotate-90" /></button>
                                        <span className="font-black text-admin-text-main text-xs">{selectedYear}</span>
                                        <button onClick={() => { setSelectedYear(y => y + 1); setIsAllTime(false); }} className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors"><MoreVertical size={14} className="-rotate-90" /></button>
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
                                                className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                                                    !isAllTime && selectedMonth === m.value 
                                                    ? 'bg-admin-primary text-white' 
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
                </div>
            </div>

            {/* ── Policy Configuration Card ───────────────────────────────── */}
            <div className="bg-white rounded-[2.5rem] border border-admin-border p-10 shadow-sm space-y-10">
                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-admin-border">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <Calculator size={28} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-admin-text-main">Konfigurasi Kebijakan Reschedule</h3>
                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mt-1">Biaya akan dihitung otomatis saat tamu mengajukan reschedule</p>
                    </div>
                    <button
                        onClick={handleSavePolicy}
                        disabled={isSavingPolicy}
                        className="flex items-center gap-2 px-7 py-3.5 bg-admin-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-admin-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                    >
                        <Save size={15} /> Simpan Kebijakan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Max Days */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Clock size={11} className="text-admin-primary" /> Batas Minimal Pengajuan (H-N)
                        </label>
                        <div className="input-with-suffix">
                            <input
                                type="number"
                                min="1"
                                className="w-full text-right pr-2"
                                value={policy.max_reschedule_days}
                                onChange={e => setPolicy({ ...policy, max_reschedule_days: e.target.value })}
                            />
                            <div className="input-suffix">Hari</div>
                        </div>
                        <p className="text-[10px] text-admin-text-muted">Cek H-N sebelum tanggal check-in</p>
                    </div>

                    {/* Min Lead Days */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5 text-orange-600">
                            <Clock size={11} /> Batas Minimum Persiapan Baru
                        </label>
                        <div className="input-with-suffix border-orange-200">
                            <input
                                type="number"
                                min="0"
                                className="w-full text-right pr-2"
                                value={policy.min_reschedule_lead_days}
                                onChange={e => setPolicy({ ...policy, min_reschedule_lead_days: e.target.value })}
                            />
                            <div className="input-suffix">Hari</div>
                        </div>
                        <p className="text-[10px] text-admin-text-muted italic">Minimal jarak tanggal baru dari hari permohonan</p>
                    </div>

                    {/* Admin Fee */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <BadgeDollarSign size={11} className="text-admin-primary" /> Biaya Admin (Flat)
                        </label>
                        <div className="input-with-prefix">
                            <div className="input-prefix">Rp</div>
                            <input
                                type="number"
                                min="0"
                                className="w-full"
                                value={policy.reschedule_admin_fee}
                                onChange={e => setPolicy({ ...policy, reschedule_admin_fee: e.target.value })}
                            />
                        </div>
                        <p className="text-[10px] text-admin-text-muted">Dikenakan per setiap pengajuan reschedule</p>
                    </div>

                    {/* Penalty */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <AlertTriangle size={11} className="text-orange-500" /> Penalty Reschedule
                        </label>
                        <div className="input-with-prefix">
                            <div className="input-prefix">Rp</div>
                            <input
                                type="number"
                                min="0"
                                className="w-full"
                                value={policy.reschedule_penalty}
                                onChange={e => setPolicy({ ...policy, reschedule_penalty: e.target.value })}
                            />
                        </div>
                        <p className="text-[10px] text-admin-text-muted">Denda perubahan jadwal yang dikenakan ke tamu</p>
                    </div>

                    {/* Hold Hours */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5 text-blue-600">
                            <Clock size={11} /> Durasi "Keep Stok" (Hold)
                        </label>
                        <div className="input-with-suffix border-blue-200">
                            <input
                                type="number"
                                min="1"
                                className="w-full text-right pr-2"
                                value={policy.reschedule_hold_hours}
                                onChange={e => setPolicy({ ...policy, reschedule_hold_hours: e.target.value })}
                            />
                            <div className="input-suffix">Jam</div>
                        </div>
                        <p className="text-[10px] text-admin-text-muted italic">Stok akan dilepas otomatis jika tidak dibayar dalam waktu ini.</p>
                    </div>
                </div>

                {/* Formula + Live Example */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formula Box */}
                    <div className="rounded-3xl bg-slate-900 p-7 text-white space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">Rumus Kalkulasi</span>
                        </div>
                        <div className="font-mono text-sm leading-loose space-y-1">
                            <p className="text-slate-400 text-xs">Final Charge =</p>
                            <p className="text-green-400 font-black">{"  max(0, Harga Baru − Harga Lama)"}</p>
                            <p className="text-slate-500 text-xs ml-2">+ Biaya Admin</p>
                            <p className="text-slate-500 text-xs ml-2">+ Penalty Reschedule</p>
                        </div>
                        <div className="pt-4 border-t border-white/10 space-y-1.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Catatan</p>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                Selisih harga dihitung berdasarkan tarif <span className="text-orange-300 font-black">weekday vs. weekend</span> secara otomatis. 
                                Jika harga baru ≤ harga lama, selisih = <span className="text-emerald-400 font-black">Rp 0</span> (tidak ada refund).
                            </p>
                        </div>
                    </div>

                    {/* Live Example */}
                    <div className="rounded-3xl bg-orange-50 border border-orange-100 p-7 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600">Contoh Perhitungan Live</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-gray-500">
                                <span>Harga weekday/malam</span>
                                <span className="font-bold">{formatRupiah(exampleWeekdayPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Harga weekend/malam</span>
                                <span className="font-bold text-orange-600">{formatRupiah(exampleWeekendPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Durasi menginap</span>
                                <span className="font-bold">{exampleNights} malam</span>
                            </div>
                            <div className="border-t border-orange-200 my-3" />
                            <div className="flex justify-between text-gray-600">
                                <span>Harga lama (weekday × {exampleNights})</span>
                                <span className="font-bold line-through text-gray-400">{formatRupiah(exampleOldTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Harga baru (weekend × {exampleNights})</span>
                                <span className="font-bold text-orange-600">{formatRupiah(exampleNewTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Selisih harga max(0, baru−lama)</span>
                                <span className="font-bold text-orange-600">{formatRupiah(examplePriceDiff)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>+ Biaya Admin</span>
                                <span className="font-bold">{formatRupiah(adminFeeNum)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>+ Penalty</span>
                                <span className="font-bold">{formatRupiah(penaltyNum)}</span>
                            </div>
                            <div className="border-t border-orange-300 pt-3 flex justify-between font-black text-admin-primary text-sm">
                                <span>= Total Final Charge</span>
                                <span className="text-eling-green">{formatRupiah(exampleFinal)}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-orange-500 italic">*Contoh: tamu pindah dari weekday ke weekend, 2 malam, dengan biaya konfigurasi di atas.</p>
                    </div>
                </div>
            </div>

            {/* ── Reschedule Requests Table ─────────────────────────────────── */}
            <div className="admin-table-container">
                <div className="table-header-actions mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
                            <Clock size={18} />
                        </div>
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Daftar Permintaan</h3>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Booking</th>
                            <th>Data Pengunjung</th>
                            <th>Jadwal Baru</th>
                            <th>Biaya Tambahan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">Memuat data...</td></tr>
                        ) : filteredRequests.map(req => (
                            <tr key={req.id}>
                                <td>
                                    <span className="font-black text-admin-primary font-mono text-xs uppercase tracking-widest leading-none block">#{req.transaction_id}</span>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-black text-admin-text-main text-sm uppercase tracking-tight">{req.transaction?.user?.name || 'Guest'}</span>
                                        <span className="text-[10px] font-bold text-admin-text-muted flex items-center gap-1 uppercase">
                                            <User size={10} /> {req.transaction?.user?.email || 'Customer'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-admin-text-muted line-through">
                                                {new Date(req.old_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs font-black text-admin-text-main">
                                                <Calendar size={14} className="text-admin-primary" />
                                                {new Date(req.new_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="p-1.5 rounded-full bg-admin-bg text-admin-text-muted">
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {req.final_charge > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-orange-600">{formatRupiah(req.final_charge)}</span>
                                            <span className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest mt-0.5">Final Charge</span>
                                        </div>
                                    ) : (
                                        <span className="badge-status bg-success/5 text-success border-success/10">Gratis</span>
                                    )}
                                </td>
                                <td>{getStatusBadge(req.status)}</td>
                                <td>
                                    <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border w-fit">
                                        <button className="btn-icon" title="View Detail" onClick={() => setSelectedReq(req)}>
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'approved_awaiting_payment' ? 'bg-white shadow-sm text-blue-600' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'approved_awaiting_payment')}
                                            disabled={req.status !== 'pending'}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'rejected' ? 'bg-white shadow-sm text-danger' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'rejected')}
                                            disabled={req.status !== 'pending'}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-24 text-center">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-admin-bg flex items-center justify-center mb-6 text-admin-text-light opacity-30">
                                        <Clock size={40} />
                                    </div>
                                    <p className="text-admin-text-muted font-black uppercase tracking-[0.2em] text-xs">Belum ada permintaan reschedule</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Detail Modal ──────────────────────────────────────────────── */}
            {selectedReq && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up border border-white/20">
                        {/* Modal Header */}
                        <div className="relative p-10 pb-0 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-[1.5rem] bg-admin-primary/10 text-admin-primary">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary mb-1">Request Details</p>
                                    <h2 className="text-3xl font-black text-admin-text-main tracking-tight">Review Case</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="p-3 rounded-2xl bg-admin-bg text-admin-text-muted hover:bg-admin-primary hover:text-white transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 space-y-6">
                            {/* Compact Horizontal Info Bar */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Date Switch Card */}
                                <div className="flex-[2] flex items-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="flex-1 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Lama</p>
                                        <p className="text-xs font-black text-slate-400 line-through decoration-slate-300">
                                            {new Date(selectedReq.old_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-admin-primary shadow-sm">
                                        <ArrowRight size={14} />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-admin-primary mb-1">Baru</p>
                                        <p className="text-sm font-black text-admin-text-main">
                                            {new Date(selectedReq.new_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary Charge Card */}
                                <div className="flex-1 p-5 rounded-2xl bg-orange-600 text-white flex flex-col justify-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Calculator size={32} />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-orange-200 relative z-10">Total Biaya</p>
                                    <p className="text-lg font-black tracking-tighter relative z-10">{formatRupiah(selectedReq.final_charge)}</p>
                                </div>
                            </div>

                            {/* Fee Breakdown Detail (Compact) */}
                            {(selectedReq.price_diff > 0 || selectedReq.admin_fee > 0 || selectedReq.penalty_fee > 0) && (
                                <div className="px-6 py-4 rounded-2xl bg-admin-bg border border-admin-border flex flex-wrap gap-x-8 gap-y-2">
                                    {selectedReq.price_diff > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                                            <span className="text-[10px] font-bold text-admin-text-muted">Selisih: <span className="text-admin-text-main">{formatRupiah(selectedReq.price_diff)}</span></span>
                                        </div>
                                    )}
                                    {selectedReq.admin_fee > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                                            <span className="text-[10px] font-bold text-admin-text-muted">Admin: <span className="text-admin-text-main">{formatRupiah(selectedReq.admin_fee)}</span></span>
                                        </div>
                                    )}
                                    {selectedReq.penalty_fee > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                                            <span className="text-[10px] font-bold text-admin-text-muted">Denda: <span className="text-admin-text-main">{formatRupiah(selectedReq.penalty_fee)}</span></span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <User size={10} className="text-admin-primary" /> Customer
                                    </label>
                                    <p className="text-sm font-black text-admin-text-main uppercase tracking-tight">{selectedReq.transaction?.user?.name || 'Guest User'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <Hash size={10} className="text-admin-primary" /> Booking ID
                                    </label>
                                    <p className="text-sm font-black text-admin-primary font-mono tracking-widest">#{selectedReq.transaction_id}</p>
                                </div>
                                <div className="col-span-2 space-y-2.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <MessageSquare size={10} className="text-admin-primary" /> Alasan Tamu
                                    </label>
                                    <div className="p-5 rounded-2xl bg-admin-bg border border-admin-border italic text-xs font-bold text-admin-text-muted leading-relaxed flex items-start gap-4 shadow-sm">
                                        <AlertCircle size={16} className="text-admin-primary/40 mt-0.5 flex-shrink-0" />
                                        "{selectedReq.reason || 'Tidak ada alasan khusus.'}"
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <Save size={10} className="text-admin-primary" /> Balasan Admin (Catatan)
                                    </label>
                                    <textarea 
                                        className="w-full p-4 rounded-2xl bg-white border border-admin-border text-xs font-bold text-admin-text-main outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all font-serif"
                                        rows="2"
                                        placeholder="Berikan alasan jika ditolak, atau instruksi pembayaran jika diterima..."
                                        value={selectedReq.admin_notes || ''}
                                        onChange={(e) => setSelectedReq({ ...selectedReq, admin_notes: e.target.value })}
                                        disabled={selectedReq.status !== 'pending'}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-2">
                                {selectedReq.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(selectedReq.id, 'rejected')}
                                            className="flex-1 py-4 rounded-2xl border border-danger/20 text-danger font-black text-xs uppercase tracking-widest hover:bg-danger/5 transition-all active:scale-95"
                                        >
                                            Tolak Request
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedReq.id, 'approved_awaiting_payment')}
                                            className="flex-[2] py-4 rounded-2xl bg-admin-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} /> Setujui & Simpan Hold
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <div className="p-4 bg-admin-bg rounded-2xl border border-admin-border text-center text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">
                                            Status: {selectedReq.status.replace(/_/g, ' ')}
                                        </div>
                                        <button
                                            onClick={() => setSelectedReq(null)}
                                            className="w-full py-4 rounded-2xl border border-admin-border text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all"
                                        >
                                            Tutup Modal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
