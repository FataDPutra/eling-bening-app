import { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, Calendar, User, Hash, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Reschedule() {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [policy, setPolicy] = useState({ max_reschedule_days: '7' });

    const fetchPolicy = async () => {
        try {
            const res = await axios.get('/api/settings/public');
            setPolicy(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSavePolicy = async () => {
        const load = toast.loading('Memperbarui kebijakan...');
        try {
            await axios.post('/api/settings', policy);
            toast.success('Kebijakan diperbarui!', { id: load });
        } catch (err) {
            toast.error('Gagal memperbarui kebijakan', { id: load });
        }
    };

    const fetchReschedules = async () => {
        try {
            const res = await axios.get('/api/reschedules');
            setRequests(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch reschedules", error);
            toast.error("Gagal memuat data reschedule");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReschedules();
        fetchPolicy();
    }, []);

    const handleAction = async (id, newStatus) => {
        try {
            const res = await axios.put(`/api/reschedules/${id}`, { status: newStatus });
            const updatedItem = res.data;
            setRequests(requests.map(r => r.id === id ? updatedItem : r));
            toast.success(`Permintaan ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
            if (selectedReq && selectedReq.id === id) {
                setSelectedReq(updatedItem);
            }
        } catch (error) {
            console.error("Failed to update reschedule status", error);
            toast.error("Gagal memperbarui status");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return (
                <span className="badge-status bg-warning/5 text-warning border-warning/10">
                    <Clock size={12} className="mr-1.5" /> Pending
                </span>
            );
            case 'approved': return (
                <span className="badge-status bg-success/5 text-success border-success/10">
                    <Check size={12} className="mr-1.5" /> Approved
                </span>
            );
            case 'rejected': return (
                <span className="badge-status bg-danger/5 text-danger border-danger/10">
                    <X size={12} className="mr-1.5" /> Rejected
                </span>
            );
            default: return <span className="badge-status font-bold uppercase">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-admin-border shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-admin-text-main uppercase tracking-widest">Kebijakan Reschedule</h3>
                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mt-1">Batas minimum hari pengajuan sebelum check-in</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input 
                                type="number" 
                                className="pl-4 pr-12 py-3 bg-admin-bg border border-admin-border rounded-xl text-sm font-black text-admin-text-main w-28 focus:outline-none focus:border-admin-primary transition-all"
                                value={policy.max_reschedule_days}
                                onChange={e => setPolicy({ ...policy, max_reschedule_days: e.target.value })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-admin-text-muted uppercase">Hari</span>
                        </div>
                        <button 
                            onClick={handleSavePolicy}
                            className="px-6 py-3 bg-admin-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-admin-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Simpan Kebijakan
                        </button>
                    </div>
                </div>

                <div className="admin-page-header">
                    <div>
                        <h1>Permintaan Reschedule</h1>
                        <p>Tinjau dan proses permohonan perubahan jadwal kunjungan atau reservasi.</p>
                    </div>
                </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Booking</th>
                            <th>Data Pengunjung</th>
                            <th>Layanan / Item</th>
                            <th>Jadwal Baru</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-admin-text-muted font-bold animate-pulse">
                                    Fetching schedule revision requests...
                                </td>
                            </tr>
                        ) : requests.map(req => (
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
                                    <div className="flex flex-col gap-0.5 text-[11px] font-bold text-admin-text-muted italic leading-tight">
                                        {req.transaction?.item?.name || 'Unknown Item'}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-black text-admin-text-main">
                                        <Calendar size={14} className="text-admin-primary" />
                                        {new Date(req.new_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>{getStatusBadge(req.status)}</td>
                                <td>
                                    <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border w-fit">
                                        <button className="btn-icon" title="View Detail" onClick={() => setSelectedReq(req)}>
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'approved' ? 'bg-white shadow-sm text-success' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'approved')} title="Approve"
                                            disabled={req.status !== 'pending'}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'rejected' ? 'bg-white shadow-sm text-danger' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'rejected')} title="Reject"
                                            disabled={req.status !== 'pending'}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && requests.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-24 text-center">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-admin-bg flex items-center justify-center mb-6 text-admin-text-light opacity-30">
                                        <Clock size={40} />
                                    </div>
                                    <p className="text-admin-text-muted font-black uppercase tracking-[0.2em] text-xs">Semua permintaan telah diproses</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Overlay / Modal */}
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
                            <button
                                onClick={() => setSelectedReq(null)}
                                className="p-3 rounded-2xl bg-admin-bg text-admin-text-muted hover:bg-admin-primary hover:text-white transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 space-y-10">
                            {/* Comparison Row */}
                            <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-admin-bg border border-admin-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-admin-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />

                                <div className="flex-1 text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Previous Schedule</p>
                                    <p className="text-lg font-black text-admin-text-light line-through decoration-danger/40 uppercase tracking-tighter">
                                        {new Date(selectedReq.old_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="px-6">
                                    <div className="w-12 h-12 rounded-full border border-admin-primary flex items-center justify-center text-admin-primary bg-white shadow-xl shadow-admin-primary/10 group-hover:scale-110 transition-transform">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>

                                <div className="flex-1 text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-admin-primary">Requested Date</p>
                                    <p className="text-xl font-black text-admin-text-main uppercase tracking-tighter">
                                        {new Date(selectedReq.new_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <User size={10} className="text-admin-primary" /> Customer Identity
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
                                        <MessageSquare size={10} className="text-admin-primary" /> Reason for Rescheduling
                                    </label>
                                    <div className="p-6 rounded-2xl bg-white border border-admin-border italic text-xs font-bold text-admin-text-muted leading-relaxed flex items-start gap-4 shadow-sm">
                                        <AlertCircle size={16} className="text-admin-primary/40 mt-0.5" />
                                        "{selectedReq.reason || 'Tidak ada alasan khusus.'}"
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                {selectedReq.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(selectedReq.id, 'rejected')}
                                            className="flex-1 py-4 rounded-2xl border border-danger/20 text-danger font-black text-xs uppercase tracking-widest hover:bg-danger/5 transition-all"
                                        >
                                            Decline Request
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedReq.id, 'approved')}
                                            className="flex-[2] py-4 rounded-2xl bg-admin-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} /> Approve & Update Schedule
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setSelectedReq(null)}
                                        className="w-full py-4 rounded-2xl bg-admin-bg text-admin-text-main font-black text-xs uppercase tracking-widest hover:bg-admin-border transition-all"
                                    >
                                        Close Case
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
