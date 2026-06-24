import api from './api';

export interface Product {
    _id: string;
    nome: string;
    descricao: string;
    medidas: {
        altura?: number;
        largura?: number;
        profundidade?: number;
        peso?: number;
        unidadeMedida: 'cm' | 'm' | 'kg';
    };
    categoria: {
        _id: string;
        nome: string;
        slug: string;
    };
    cor: string;
    preco: number;
    precoPromocional?: number;
    precoFormatado: string;
    estoque: number;
    imagens: string[];
    slug: string;
    destaque: boolean;
    ativo: boolean;
    dataCriacao: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ProductResponse {
    success: boolean;
    data: Product;
}

export const productsApi = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        categoria?: string;
        destaque?: boolean;
        ativo?: boolean;
        search?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.categoria) queryParams.append('categoria', params.categoria);
        if (params?.destaque !== undefined) queryParams.append('destaque', String(params.destaque));
        if (params?.ativo !== undefined) queryParams.append('ativo', String(params.ativo));
        if (params?.search) queryParams.append('search', params.search);
        
        const query = queryParams.toString();
        return api.get<ProductsResponse>(`/products${query ? `?${query}` : ''}`);
    },

    getById: (id: string) =>
        api.get<ProductResponse>(`/products/${id}`),

    getBySlug: (slug: string) =>
        api.get<ProductResponse>(`/products/slug/${slug}`),

    getByCategory: (categoryId: string) =>
        api.get<{ success: boolean; data: Product[]; count: number }>(`/products/category/${categoryId}`),

    create: (data: any) =>
        api.post<ProductResponse>('/products', data),

    update: (id: string, data: any) =>
        api.put<ProductResponse>(`/products/${id}`, data),

    updateStock: (id: string, quantidade: number) =>
        api.put<ProductResponse>(`/products/${id}/stock`, { quantidade }),

    delete: (id: string) =>
        api.delete<{ success: boolean; message: string }>(`/products/${id}`),

    reactivate: (id: string) =>
        api.put<ProductResponse>(`/products/${id}/reactivate`),

    deletePermanently: (id: string) =>
        api.delete(`/products/${id}/permanent`),
};