import { useState, useEffect, useRef } from 'react';
import { QrCode, Scan, Search, Camera, StopCircle, RefreshCw, X, CheckCircle2, AlertCircle, User, Fullscreen, CornerUpRight, Terminal } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Scanner() {
    const [scannedId, setScannedId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef(null);
    const scannerId = "qr-reader";

    useEffect(() => {
        return () => {
            if (isScanning) {
                stopScanner();
            }
        };
    }, [isScanning]);

    const startScanner = async () => {
        setIsLoading(true);
        try {
            const html5QrCode = new Html5Qrcode(scannerId);
            scannerRef.current = html5QrCode;

            const config = { fps: 15, qrbox: { width: 280, height: 280 } };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {}
            );

            setIsScanning(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner", err);
            }
        }
    };

    const handleScanSuccess = async (decodedText) => {
        setIsLoading(true);
        try {
            const res = await axios.patch(`/api/tickets/${decodedText}/check-in`);
            const data = res.data;
            
            setScanResult({
                id: data.ticket_id,
                name: data.guest_name,
                type: data.item_name,
                date: data.check_in_date || "Today",
                status: data.is_used ? "Authenticated" : "Standing By",
                is_used: data.is_used,
                booker: data.booker_name
            });
            
            toast.success(data.message);
            stopScanner();
        } catch (err) {
            console.error("Scan processing failed", err);
            toast.error(err.response?.data?.message || "Kode Tiket Tidak Valid");
            // Optional: don't stop scanner on error if you want to keep trying
            stopScanner(); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualCheck = async () => {
        if (!scannedId) return;
        setIsLoading(true);
        try {
            const res = await axios.patch(`/api/tickets/${scannedId.trim()}/check-in`);
            const data = res.data;
            
            setScanResult({
                id: data.ticket_id,
                name: data.guest_name,
                type: data.item_name,
                date: data.check_in_date || "Today",
                status: data.is_used ? "Authenticated" : "Standing By",
                is_used: data.is_used,
                booker: data.booker_name
            });
            
            toast.success(data.message);
        } catch (err) {
            console.error("Manual check failed", err);
            toast.error(err.response?.data?.message || "Gagal Verifikasi Kode");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-10">
            <div className="admin-page-header">
                <div>
                    <h1>Scanner & Pengunjung</h1>
                    <p>Verifikasi kode QR tiket pengunjung untuk otorisasi akses kawasan.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Visual Area */}
                <div className="space-y-6">
                    <div className="relative aspect-square md:aspect-video lg:aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-admin-bg shadow-2xl flex items-center justify-center group">
                        <div id={scannerId} className="w-full h-full object-cover"></div>
                        
                        {/* Futuristic Scanner Overlays */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                <div className="w-[280px] h-[280px] relative">
                                    <div className="absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 border-admin-primary rounded-tl-2xl shadow-[0_0_15px_rgba(var(--admin-primary-rgb),0.3)]" />
                                    <div className="absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 border-admin-primary rounded-tr-2xl shadow-[0_0_15px_rgba(var(--admin-primary-rgb),0.3)]" />
                                    <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 border-admin-primary rounded-bl-2xl shadow-[0_0_15px_rgba(var(--admin-primary-rgb),0.3)]" />
                                    <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 border-admin-primary rounded-br-2xl shadow-[0_0_15px_rgba(var(--admin-primary-rgb),0.3)]" />
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-admin-primary to-transparent animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(var(--admin-primary-rgb),0.5)]" />
                                </div>
                                <div className="absolute inset-0 bg-slate-900/40" />
                            </div>
                        )}

                        {!isScanning && !scanResult && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 backdrop-blur-sm">
                                <div className="w-24 h-24 rounded-full bg-admin-primary/20 border border-admin-primary/20 flex items-center justify-center text-admin-primary mb-8 animate-pulse">
                                    <Camera size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">System Ready</h3>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-sm">
                                    Arahkan kamera ke kode QR pengunjung. Pastikan pencahayaan cukup untuk proses deteksi yang optimal.
                                </p>
                            </div>
                        )}

                        {scanResult && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10 text-center bg-success/95 backdrop-blur-xl animate-fade-in">
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-success mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-scale-up">
                                    <CheckCircle2 size={56} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Authenticated</h3>
                                <p className="text-sm text-white/80 font-mono font-bold tracking-widest">{scanResult.id}</p>
                                <button 
                                    className="mt-10 px-8 py-4 bg-white text-success rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={() => setScanResult(null)}
                                >
                                    Scan Next Ticket
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {!isScanning ? (
                            <button 
                                className="flex-1 btn-primary py-5 rounded-[2rem] shadow-xl shadow-admin-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                onClick={startScanner} disabled={isLoading}
                            >
                                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Scan size={22} />}
                                <span className="font-black text-sm uppercase tracking-widest">Activate Camera</span>
                            </button>
                        ) : (
                            <button 
                                className="flex-1 py-5 rounded-[2rem] bg-danger text-white flex items-center justify-center gap-3 shadow-xl shadow-danger/20 hover:bg-danger/90 transition-all font-black text-sm uppercase tracking-widest"
                                onClick={stopScanner}
                            >
                                <StopCircle size={22} /> Stop Scanning
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Area */}
                <div className="space-y-8">
                    <div className="admin-table-container !p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-admin-primary/10 text-admin-primary">
                                <Terminal size={20} />
                            </div>
                            <h3 className="text-lg font-black text-admin-text-main uppercase tracking-widest">Manual Override</h3>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-light" size={18} />
                                <input
                                    type="text"
                                    placeholder="Order ID / Ticket Code..."
                                    value={scannedId}
                                    onChange={(e) => setScannedId(e.target.value)}
                                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-admin-text-main focus:outline-none focus:border-admin-primary transition-all placeholder:text-admin-text-light/50"
                                />
                            </div>
                            <button 
                                className="btn-primary px-8 rounded-2xl shadow-lg shadow-admin-primary/10"
                                onClick={handleManualCheck} disabled={isLoading || !scannedId}
                            >
                                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Process'}
                            </button>
                        </div>
                    </div>

                    {scanResult ? (
                        <div className="admin-table-container !p-10 border-2 border-admin-primary animate-scale-up relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-admin-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                            
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-success/10 text-success">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-admin-text-main uppercase tracking-widest">Validation Success</h3>
                                </div>
                                <button onClick={() => setScanResult(null)} className="text-admin-text-light hover:text-admin-text-main">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Visitor Name</label>
                                        <p className="text-base font-black text-admin-text-main uppercase">{scanResult.name}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Booker</label>
                                        <p className="text-base font-black text-admin-text-main uppercase">{scanResult.booker || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Service Category</label>
                                        <div className="flex">
                                            <span className="badge-status bg-admin-primary/5 text-admin-primary border-admin-primary/10">
                                                {scanResult.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-admin-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-admin-text-muted uppercase mb-1">Validation Activity</span>
                                        <span className="text-sm font-black text-admin-text-main">{scanResult.date} • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg ${scanResult.is_used ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20 animate-bounce ring-1 ring-white/20' : 'bg-warning text-white shadow-warning/20'}`}>
                                        {scanResult.is_used ? 'Entry Authorized' : 'Standing By'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-table-container !p-20 flex flex-col items-center justify-center text-center bg-admin-bg/50 border-dashed border-2">
                            <div className="w-20 h-20 rounded-[2rem] bg-admin-bg border border-admin-border flex items-center justify-center text-admin-text-light/30 mb-6 font-black text-xs">
                                <QrCode size={40} />
                            </div>
                            <h4 className="text-sm font-black text-admin-text-muted uppercase tracking-[0.2em]">Waiting for Scan</h4>
                            <p className="max-w-[200px] mt-2 text-[11px] font-bold text-admin-text-light/60">
                                Scanned data or manual verification results will be displayed here.
                            </p>
                        </div>
                    )}

                    <div className="p-8 rounded-[2.5rem] bg-warning/5 border border-warning/10 flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={22} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-warning uppercase tracking-widest">Protocol Verification</h4>
                            <p className="text-[11px] font-bold text-warning/70 leading-relaxed">
                                Selalu pastikan pencahayaan cukup untuk deteksi QR. Jika layar rusak, gunakan Input Manual dengan kode pesanan 12-digit. Verifikasi kartu identitas fisik jika perlu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                :root {
                    --admin-primary-rgb: 79, 70, 229; /* Default Indigo RGB */
                }
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                #qr-reader {
                    background: transparent !important;
                    border: none !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    background: transparent !important;
                }
                /* Hide html5-qrcode labels/buttons that might appear */
                #qr-reader__dashboard, #qr-reader__status_span, #qr-reader img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
