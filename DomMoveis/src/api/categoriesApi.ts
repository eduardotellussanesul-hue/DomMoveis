import api from './api';

export interface Category {
    _id: string;
    nome: string;
    descricao?: string;
    slug: string;
    ativo: boolean;
    dataCriacao: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
    count: number;
}

export interface CategoryResponse {
    success: boolean;
    data: Category;
}

export const categoriesApi = {
    // Listar todas as categorias
    getAll: (ativo?: boolean) => {
        const params = ativo !== undefined ? `?ativo=${ativo}` : '';
        return api.get<CategoriesResponse>(`/categories${params}`);
    },

    // Buscar categoria por ID
    getById: (id: string) =>
        api.get<CategoryResponse>(`/categories/${id}`),

    // Buscar categoria por slug
    getBySlug: (slug: string) =>
        api.get<CategoryResponse>(`/categories/slug/${slug}`),

    // Criar categoria
    create: (data: { nome: string; descricao?: string }) =>
        api.post<CategoryResponse>('/categories', data),

    // Atualizar categoria
    update: (id: string, data: { nome?: string; descricao?: string }) =>
        api.put<CategoryResponse>(`/categories/${id}`, data),

    // Soft delete (desativar)
    delete: (id: string) =>
        api.delete<{ success: boolean; message: string }>(`/categories/${id}`),

    // Reativar
    reactivate: (id: string) =>
        api.put<CategoryResponse>(`/categories/${id}/reactivate`),

    // Deletar permanentemente
    deletePermanently: (id: string) =>
        api.delete(`/categories/${id}/permanent`),
};