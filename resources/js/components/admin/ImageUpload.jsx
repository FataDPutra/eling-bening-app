import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Play, Eye, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaUpload({ images = [], setImages, onChange, maxImages = 5 }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);
    // pendingPreviews: array of { file, src } — waiting for user to confirm
    const [pendingPreviews, setPendingPreviews] = useState([]);

    // Normalize callback
    const updateImages = (newList) => {
        if (setImages) setImages(newList);
        if (onChange) onChange(newList);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Reset input so same file can be re-selected
        e.target.value = '';
        loadPreviews(files);
    };

    const loadPreviews = (files) => {
        const total = images.length + pendingPreviews.length + files.length;
        if (total > maxImages) {
            toast.error(`Maksimal ${maxImages} gambar diperbolehkan`);
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size / (1024 * 1024) > 10) {
                toast.error(`${file.name} melebihi batas 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const promises = validFiles.map(file =>
            new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({ file, src: reader.result });
                reader.readAsDataURL(file);
            })
        );

        Promise.all(promises).then(previews => {
            setPendingPreviews(prev => [...prev, ...previews]);
        });
    };

    const confirmPending = () => {
        const confirmed = pendingPreviews.map(p => p.src);
        updateImages([...images, ...confirmed]);
        setPendingPreviews([]);
        toast.success(`${confirmed.length} gambar berhasil ditambahkan`);
    };

    const cancelPending = () => {
        setPendingPreviews([]);
    };

    const removePending = (index) => {
        setPendingPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeMedia = (index) => {
        updateImages(images.filter((_, i) => i !== index));
    };

    const isVideo = (src) =>
        src.startsWith('data:video/') || src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.webm');

    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        loadPreviews(Array.from(e.dataTransfer.files));
    };

    return (
        <div className="space-y-5">
            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center cursor-pointer
                    ${isDragging ? 'border-admin-primary bg-admin-primary/5 scale-[1.01]' : 'border-admin-border hover:border-admin-primary/50 bg-white/50'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-admin-primary mb-4 border border-admin-border">
                    <Upload size={28} />
                </div>
                <p className="font-black text-admin-text-main uppercase tracking-widest text-xs">Drop media here or click to upload</p>
                <p className="text-[10px] text-admin-text-muted mt-2 font-bold uppercase">Images or Video up to 10MB · Maks {maxImages} file</p>
            </div>

            {/* ─── PENDING PREVIEW PANEL ─── */}
            {pendingPreviews.length > 0 && (
                <div className="rounded-[2rem] border-2 border-amber-300 bg-amber-50/60 p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                                Preview — {pendingPreviews.length} gambar dipilih
                            </p>
                            <p className="text-[10px] text-amber-600 font-bold mt-0.5">Pastikan gambar sudah benar sebelum dikonfirmasi</p>
                        </div>
                        <button
                            type="button"
                            onClick={cancelPending}
                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-100 transition-all"
                            title="Batalkan semua"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Pending grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {pendingPreviews.map((p, index) => (
                            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-amber-200 bg-white shadow-sm">
                                <img src={p.src} alt={`pending-${index}`} className="w-full h-full object-cover" />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMedia(p.src)}
                                        className="p-1.5 bg-white text-admin-primary rounded-lg hover:scale-110 transition-transform shadow"
                                        title="Lihat penuh"
                                    >
                                        <Eye size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removePending(index)}
                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform shadow"
                                        title="Hapus dari pilihan"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg truncate">
                                    {p.file.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Confirm / Cancel actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={cancelPending}
                            className="flex-1 py-2.5 rounded-xl border border-amber-300 text-amber-700 font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmPending}
                            className="flex-[2] py-2.5 rounded-xl bg-admin-primary text-white font-black text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-admin-primary/20"
                        >
                            <Check size={16} /> Konfirmasi & Tambahkan ({pendingPreviews.length})
                        </button>
                    </div>
                </div>
            )}

            {/* ─── CONFIRMED GALLERY GRID ─── */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((src, index) => (
                        <div key={index} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border border-admin-border bg-slate-900 shadow-sm transition-all hover:shadow-xl">
                            {isVideo(src) ? (
                                <div className="relative w-full h-full">
                                    <video src={src} className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                </div>
                            ) : (
                                <img src={src} alt={`Media ${index}`} className="w-full h-full object-cover" />
                            )}

                            <div className="absolute inset-0 bg-admin-primary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setPreviewMedia(src); }}
                                    className="p-2 bg-white text-admin-primary rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    title="Lihat Penuh"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeMedia(index); }}
                                    className="p-2 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    title="Hapus"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {index === 0 && (
                                <div className="absolute top-3 left-3 bg-admin-primary text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-widest">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {previewMedia && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-12 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md cursor-zoom-out" onClick={() => setPreviewMedia(null)} />
                    <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center animate-scale-up">
                        <button
                            onClick={() => setPreviewMedia(null)}
                            className="absolute -top-16 right-0 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 shadow-xl"
                        >
                            <X size={24} />
                        </button>
                        {isVideo(previewMedia) ? (
                            <video src={previewMedia} controls autoPlay className="max-w-full max-h-[85vh] rounded-[2rem] shadow-2xl border-4 border-white/10" />
                        ) : (
                            <img src={previewMedia} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-[2rem] shadow-2xl border-4 border-white/10" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
