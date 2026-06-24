import api from './api';

export interface ImageUploadResponse {
    success: boolean;
    data: {
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
    };
    message: string;
}

export interface ImagesListResponse {
    success: boolean;
    data: {
        images: Array<{
            url: string;
            publicId: string;
            width: number;
            height: number;
            format: string;
            bytes: number;
            createdAt: string;
        }>;
        total: number;
        folder: string;
    };
}

export interface DeleteMultipleResponse {
    success: boolean;
    data: {
        results: Array<{
            publicId: string;
            success: boolean;
            error?: string;
        }>;
        total: number;
        successCount: number;
        failedCount: number;
    };
    message: string;
}

export const imagesApi = {
    // Upload de uma imagem
    upload: async (file: File, folder?: string): Promise<ImageUploadResponse> => {
        const formData = new FormData();
        formData.append('image', file);
        if (folder) {
            formData.append('folder', folder);
        }

        const response = await api.post<ImageUploadResponse>('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload de múltiplas imagens
    uploadMultiple: async (files: File[], folder?: string): Promise<{ success: boolean; data: Array<{ url: string; publicId: string }>; message: string }> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        if (folder) {
            formData.append('folder', folder);
        }

        const response = await api.post('/images/upload-multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Buscar imagem por publicId
    getImage: (publicId: string) =>
        api.get<{ success: boolean; data: { url: string; publicId: string } }>(`/images/${publicId}`),

    // Listar imagens de uma pasta
    listImages: (folder: string, maxResults?: number) =>
        api.get<ImagesListResponse>(`/images/list/${folder}?maxResults=${maxResults || 50}`),

    // Buscar imagens por tag
    getImagesByTag: (tag: string, maxResults?: number) =>
        api.get<{ success: boolean; data: { images: any[]; total: number; tag: string } }>(`/images/tag/${tag}?maxResults=${maxResults || 50}`),

    // Deletar imagem
    deleteImage: (publicId: string) =>
        api.delete<{ success: boolean; message: string }>(`/images/${publicId}`),

    // Deletar múltiplas imagens
    deleteMultiple: (publicIds: string[]) =>
        api.post<DeleteMultipleResponse>('/images/delete-multiple', { publicIds }),
};