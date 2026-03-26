import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Play, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaUpload({ images = [], setImages, maxImages = 5 }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        if (images.length + files.length > maxImages) {
            toast.error(`Maksimal ${maxImages} media diperbolehkan`);
            return;
        }

        const validFiles = files.filter(file => {
            const sizeInMB = file.size / (1024 * 1024);
            if (sizeInMB > 10) {
                toast.error(`${file.name} melebihi batas 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newMediaPromises = validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newMediaPromises).then(newMedia => {
            setImages([...images, ...newMedia]);
        });
    };

    const removeMedia = (index) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
    };

    const isVideo = (src) => {
        return src.startsWith('data:video/') || src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.webm');
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    return (
        <div className="space-y-4">
            <div 
                className={`border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center cursor-pointer
                    ${isDragging ? 'border-admin-primary bg-admin-primary/5' : 'border-admin-border hover:border-admin-primary/50 bg-white/50'}`}
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
                <p className="text-[10px] text-admin-text-muted mt-2 font-bold uppercase">Images or Video up to 10MB</p>
            </div>

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
                                <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute inset-0 bg-admin-primary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewMedia(src);
                                    }}
                                    className="p-2 bg-white text-admin-primary rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    title="View Fullscreen"
                                >
                                    <Eye size={18} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeMedia(index);
                                    }}
                                    className="p-2 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    title="Remove"
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
