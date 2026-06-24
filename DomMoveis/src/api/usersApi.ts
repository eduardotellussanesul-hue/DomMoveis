import api from './api';

export interface User {
    _id: string;
    nome: string;
    email: string;
    telefone?: string;
    role: number;
    roleName: string;
    ativo: boolean;
    dataCriacao: string;
    ultimoAcesso?: string;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UserResponse {
    success: boolean;
    data: User;
}

export const usersApi = {
    // Listar todos os usuários
    getAll: (page: number = 1, limit: number = 10) =>
        api.get<UsersResponse>(`/users?page=${page}&limit=${limit}`),

    // Buscar usuário por ID
    getById: (id: string) =>
        api.get<UserResponse>(`/users/${id}`),

    // Buscar usuário por email
    getByEmail: (email: string) =>
        api.get<UserResponse>(`/users/email/${email}`),

    // Buscar por role
    getByRole: (role: number) =>
        api.get<{ success: boolean; data: User[] }>(`/users/role/${role}`),

    // Criar usuário
    create: (data: { nome: string; email: string; senha: string; telefone?: string; role?: number }) =>
        api.post<UserResponse>('/users', data),

    // Atualizar usuário
    update: (id: string, data: { nome?: string; email?: string; telefone?: string }) =>
        api.put<UserResponse>(`/users/${id}`, data),

    // Atualizar role
    updateRole: (id: string, role: number) =>
        api.put<UserResponse>(`/users/${id}/role`, { role }),

    // Atualizar senha
    updatePassword: (id: string, senhaAtual: string, novaSenha: string) =>
        api.put(`/users/${id}/password`, { senhaAtual, novaSenha }),

    // Soft delete (desativar)
    delete: (id: string) =>
        api.delete<{ success: boolean; message: string }>(`/users/${id}`),

    // Reativar
    reactivate: (id: string) =>
        api.put<UserResponse>(`/users/${id}/reactivate`),

    // Deletar permanentemente
    deletePermanently: (id: string) =>
        api.delete(`/users/${id}/permanent`),

    // Estatísticas
    getStats: () =>
        api.get<{ success: boolean; data: { total: number; active: number; inactive: number; byRole: any[] } }>('/users/count'),
};