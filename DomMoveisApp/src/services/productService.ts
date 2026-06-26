import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../api/types/common';
import type { Product, CreateProductDTO, UpdateProductDTO } from '../api/types/product';

export const productService = {
  async getAll(params?: { categoria?: string; destaque?: boolean }): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(ENDPOINTS.products, { params });
    return response.data.data;
  },

  async create(data: CreateProductDTO): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(ENDPOINTS.products, data);
    return response.data.data;
  },

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(
      `${ENDPOINTS.products}/${id}`,
      data
    );
    return response.data.data;
  },

  // Soft delete (desativar)
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.products}/${id}`);
  },

  // Reativar
  async reactivate(id: string): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(
      `${ENDPOINTS.products}/${id}/reactivate`
    );
    return response.data.data;
  },

  // Excluir permanentemente
  async deletePermanently(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.products}/${id}/permanent`);
  },

  // Atualizar estoque
  async updateStock(id: string, stock: number): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(
      `${ENDPOINTS.products}/${id}/stock`,
      { stock }
    );
    return response.data.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`${ENDPOINTS.products}/${id}`);
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`${ENDPOINTS.products}/slug/${slug}`);
    return response.data.data;
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${ENDPOINTS.products}/category/${categoryId}`
    );
    return response.data.data;
  },
};