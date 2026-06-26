import { apiClient } from '../api/client';

export const imageService = {
  // ========== UPLOAD ==========
  // Upload de múltiplas imagens
  async uploadMultiple(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<{ success: boolean; data: { urls: string[] } }>(
      '/images/upload-multiple',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data.urls;
  },

  // Upload de uma única imagem
  async uploadSingle(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/images/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data.url;
  },

  // ========== CONSULTA ==========
  // Obter imagem por publicId
  async getImage(publicId: string): Promise<any> {
    const response = await apiClient.get(`/images/${publicId}`);
    return response.data;
  },

  // Listar imagens de uma pasta
  async listImages(folder: string): Promise<any[]> {
    const response = await apiClient.get(`/images/list/${folder}`);
    return response.data.data;
  },

  // Buscar imagens por tag
  async getImagesByTag(tag: string): Promise<any[]> {
    const response = await apiClient.get(`/images/tag/${tag}`);
    return response.data.data;
  },

  // ========== DELETE ==========
  // Deletar uma imagem
  async deleteImage(publicId: string): Promise<void> {
    await apiClient.delete(`/images/${publicId}`);
  },

  // Deletar múltiplas imagens
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    await apiClient.post('/images/delete-multiple', { publicIds });
  },

  // ========== UPDATE ==========
  // Atualizar imagem (ex: tags, descrição)
  async updateImage(publicId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/images/${publicId}`, data);
    return response.data;
  },
};