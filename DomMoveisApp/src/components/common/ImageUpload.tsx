import React, { useRef, useState, useEffect } from 'react';
import { imageService } from '../../services/imageService';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxFiles?: number;
  initialImages?: string[]; // Adiciona a prop
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxFiles = 5,
  initialImages = [],
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializa com as imagens existentes se for edição
  useEffect(() => {
    if (initialImages.length > 0 && previews.length === 0) {
      setPreviews(initialImages);
    }
  }, [initialImages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles - previews.length);

    // Gerar previews locais
    const localPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...localPreviewUrls]);

    setUploading(true);
    try {
      const urls = await imageService.uploadMultiple(fileArray);
      const allUrls = [...previews, ...urls];
      setPreviews(allUrls);
      onImagesChange(allUrls);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao enviar imagens');
      setPreviews((prev) => prev.slice(0, prev.length - fileArray.length));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesChange(newPreviews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const openFileSelector = () => {
    if (!uploading && previews.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload-container">
      <div
        className={`image-upload-dropzone ${isDragging ? 'dragging' : ''} ${
          previews.length >= maxFiles ? 'full' : ''
        }`}
        onClick={openFileSelector}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading || previews.length >= maxFiles}
        />
        <div className="image-upload-content">
          {uploading ? (
            <div className="image-upload-loading">
              <div className="spinner"></div>
              <span>Enviando imagens...</span>
            </div>
          ) : previews.length >= maxFiles ? (
            <div className="image-upload-full">
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <span>Limite de {maxFiles} imagens</span>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-blue-500" />
              <span className="image-upload-text">Clique ou arraste imagens</span>
              <span className="image-upload-hint">
                PNG, JPG • Máximo {maxFiles} imagens
              </span>
            </>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="image-preview-grid">
          {previews.map((url, index) => (
            <div key={index} className="image-preview-item">
              <img src={url} alt={`Preview ${index}`} className="image-preview-img" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                className="image-preview-remove"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="image-preview-index">{index + 1}</span>
            </div>
          ))}
          {previews.length < maxFiles && !uploading && (
            <div className="image-preview-add" onClick={openFileSelector}>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Adicionar</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};