import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange, maxFiles = 5 }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles);

    // Gerar previews locais
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);

    // Fazer upload para o servidor
    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:3000/api/images/upload-multiple', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('@DomMoveis:token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const urls = result.data.urls; // ajuste conforme sua resposta
        onImagesChange(urls);
      } else {
        alert('Erro ao fazer upload das imagens');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    // Notificar o pai que a lista mudou (opcional)
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Selecionar Imagens'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <span className="text-sm text-gray-500">
          Máximo {maxFiles} imagens
        </span>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((url, index) => (
            <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};