import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../api/types/common';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../api/types/category';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(ENDPOINTS.categories);
    return response.data.data;
  },

  async create(data: CreateCategoryDTO): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>(ENDPOINTS.categories, data);
    return response.data.data;
  },

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(
      `${ENDPOINTS.categories}/${id}`,
      data
    );
    return response.data.data;
  },

  // Soft delete (desativar)
  async desativa(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.categories}/${id}`);
  },

   async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.categories}/${id}/permanent`);
  },

  // Reativar
  async reactivate(id: string): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(
      `${ENDPOINTS.categories}/${id}/reactivate`
    );
    return response.data.data;
  },

  // Excluir permanentemente
  async deletePermanently(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.categories}/${id}/permanent`);
  },

  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(
      `${ENDPOINTS.categories}/${id}`
    );
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(
      `${ENDPOINTS.categories}/slug/${slug}`
    );
    return response.data.data;
  },
};