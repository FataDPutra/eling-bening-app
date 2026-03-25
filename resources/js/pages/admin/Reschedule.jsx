import { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, Calendar, User, FileText, Hash, ArrowLeft, ArrowRight, MoreVertical, MessageSquare, AlertCircle } from 'lucide-react';
import { getReschedules, saveReschedules, formatRupiah } from '../../utils/data';
import toast from 'react-hot-toast';

export default function Reschedule() {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);

    useEffect(() => {
        setRequests(getReschedules());
    }, []);

    const handleAction = (id, newStatus) => {
        const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
        setRequests(updated);
        saveReschedules(updated);
        toast.success(`Permintaan ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
        if (selectedReq && selectedReq.id === id) {
            setSelectedReq({ ...selectedReq, status: newStatus });
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
            default: return <span className="badge-status">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
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
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>
                                    <span className="font-black text-admin-primary font-mono text-sm uppercase tracking-widest">{req.bookingId}</span>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-black text-admin-text-main text-sm uppercase tracking-tight">{req.customerName}</span>
                                        <span className="text-[10px] font-bold text-admin-text-muted flex items-center gap-1 uppercase">
                                            <User size={10} /> Customer
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-0.5 text-xs font-bold text-admin-text-muted italic">
                                        {req.itemName}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-black text-admin-text-main">
                                        <Calendar size={14} className="text-admin-primary" />
                                        {new Date(req.newDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>{getStatusBadge(req.status)}</td>
                                <td>
                                    <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border">
                                        <button className="btn-icon" title="View Detail" onClick={() => setSelectedReq(req)}>
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'approved' ? 'bg-white shadow-sm text-success' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'approved')} title="Approve"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className={`p-2 rounded-lg transition-all ${req.status === 'rejected' ? 'bg-white shadow-sm text-danger' : 'text-admin-text-light hover:text-admin-text-main'}`}
                                            onClick={() => handleAction(req.id, 'rejected')} title="Reject"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
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
                                        {new Date(selectedReq.oldDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
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
                                        {new Date(selectedReq.newDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <User size={10} className="text-admin-primary" /> Customer Identity
                                    </label>
                                    <p className="text-sm font-black text-admin-text-main uppercase tracking-tight">{selectedReq.customerName}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <Hash size={10} className="text-admin-primary" /> Booking ID
                                    </label>
                                    <p className="text-sm font-black text-admin-primary font-mono tracking-widest">{selectedReq.bookingId}</p>
                                </div>
                                <div className="col-span-2 space-y-2.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted flex items-center gap-1.5">
                                        <MessageSquare size={10} className="text-admin-primary" /> Reason for Rescheduling
                                    </label>
                                    <div className="p-6 rounded-2xl bg-white border border-admin-border italic text-xs font-bold text-admin-text-muted leading-relaxed flex items-start gap-4 shadow-sm">
                                        <AlertCircle size={16} className="text-admin-primary/40 mt-0.5" />
                                        "{selectedReq.reason}"
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
