import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;      // URLs já upadas (edição)
  onFilesChange?: (files: File[]) => void;       // arquivos selecionados para upload posterior
  maxFiles?: number;
  initialImages?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  onFilesChange,
  maxFiles = 5,
  initialImages = [],
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializa com imagens existentes (edição)
  useEffect(() => {
    if (initialImages.length > 0 && previews.length === 0) {
      setPreviews(initialImages);
      // Notifica o pai com as URLs iniciais
      onImagesChange(initialImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  // Função auxiliar para filtrar URLs reais (não blob:)
  const getRealUrls = (urls: string[]) => urls.filter((url) => !url.startsWith('blob:'));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const remaining = maxFiles - previews.length;
    const newFiles = Array.from(selectedFiles).slice(0, remaining);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Notifica o pai sobre os arquivos (para upload futuro)
    if (onFilesChange) {
      onFilesChange([...files, ...newFiles]);
    }

    // Limpa o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setFiles(newFiles);

    // Notifica o pai com as URLs reais (filtra blob:)
    const realUrls = getRealUrls(newPreviews);
    onImagesChange(realUrls);

    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      droppedFiles.forEach((file) => dataTransfer.items.add(file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const openFileSelector = () => {
    if (previews.length < maxFiles) {
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
          style={{ display: 'none' }}
          disabled={previews.length >= maxFiles}
        />
        <div className="image-upload-content">
          {previews.length >= maxFiles ? (
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
          {previews.length < maxFiles && (
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