import React, { useRef, useState, useEffect } from 'react';
import { imagesApi } from '../../api/imagesApi';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
    folder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false,
    folder = 'dommoveis/produtos',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const result = await imagesApi.upload(file, folder);
            
            if (result.success && result.data.url) {
                const newImages = [...images, result.data.url];
                onImagesChange(newImages);
            } else {
                setError(result.message || 'Erro ao fazer upload');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length >= maxImages) {
            setError(`Máximo de ${maxImages} imagens permitidas`);
            return;
        }

        const remainingSlots = maxImages - images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        // Upload em sequência
        const uploadFiles = async () => {
            let uploaded = 0;
            for (const file of filesToUpload) {
                await handleUpload(file);
                uploaded++;
                setUploadProgress((uploaded / filesToUpload.length) * 100);
            }
        };

        uploadFiles();
        
        // Resetar input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = e.dataTransfer.files;
            
            if (images.length >= maxImages) {
                setError(`Máximo de ${maxImages} imagens permitidas`);
                return;
            }

            const remainingSlots = maxImages - images.length;
            const filesToUpload = Array.from(files).slice(0, remainingSlots);

            filesToUpload.forEach(file => handleUpload(file));
        }
    };

    return (
        <div className="image-uploader">
            {error && (
                <div className="upload-error">
                    ❌ {error}
                    <button type="button" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={disabled || uploading}
                    className="file-input"
                />
                
                <div className="upload-content">
                    {uploading ? (
                        <>
                            <div className="upload-spinner">⏳</div>
                            <p>Enviando... {Math.round(uploadProgress)}%</p>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="upload-icon">📤</span>
                            <p>Arraste ou clique para enviar imagens</p>
                            <small>
                                {images.length}/{maxImages} imagens • JPG, PNG, WEBP, GIF (máx. 5MB)
                            </small>
                        </>
                    )}
                </div>
            </div>

            {images.length > 0 && (
                <div className="image-grid">
                    {images.map((url, index) => (
                        <div key={index} className="image-item">
                            <img src={url} alt={`Produto ${index + 1}`} />
                            <button 
                                type="button"
                                className="remove-image"
                                onClick={() => handleRemoveImage(index)}
                                disabled={disabled}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;