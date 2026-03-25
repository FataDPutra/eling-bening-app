import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUpload({ images = [], onChange, maxImages = 5 }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        if (images.length + files.length > maxImages) {
            toast.error(`Maksimal ${maxImages} gambar diperbolehkan`);
            return;
        }

        const newImagesPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newImagesPromises).then(newImages => {
            onChange([...images, ...newImages]);
        });
    };

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
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
            <label className="admin-label">Galeri Gambar ({images.length}/{maxImages})</label>
            
            <div 
                className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer
                    ${isDragging ? 'border-primary bg-primary-light/30' : 'border-gray-200 hover:border-primary/50 bg-gray-50'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                />
                
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-3">
                    <Upload size={24} />
                </div>
                <p className="font-semibold text-gray-900">Klik atau seret gambar ke sini</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB (Maks {maxImages})</p>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                            <img 
                                src={img} 
                                alt={`Preview ${index}`} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    UTAMA
                                </div>
                            )}
                        </div>
                    ))}
                    {images.length < maxImages && (
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all bg-gray-50/50"
                        >
                            <Plus size={24} />
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Tambah</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
