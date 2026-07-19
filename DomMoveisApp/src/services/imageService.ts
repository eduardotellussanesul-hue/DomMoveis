import { apiClient } from '../api/client';

export const imageService = {
  // ========== UPLOAD ==========
  // Upload de múltiplas imagens
  async uploadMultiple(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Não definir Content-Type manualmente: o navegador/axios precisa gerar
    // o boundary do multipart/form-data automaticamente.
    const response = await apiClient.post<{
      success: boolean;
      data: Array<{ url: string; publicId: string }>;
    }>('/images/upload-multiple', formData);

    // A API retorna um array de objetos { url, publicId }
    return response.data.data.map((item) => item.url);
  },

  // Upload de uma única imagem
  async uploadSingle(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/images/upload',
      formData
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