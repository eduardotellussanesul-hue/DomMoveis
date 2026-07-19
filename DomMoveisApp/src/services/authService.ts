import { apiClient } from '../api/client';
import type { AuthData, LoginCredentials, RegisterCredentials, User } from '../api/types/user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthData> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        user: User;
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        };
      };
    }>('/auth/login', credentials);

    const { user, tokens } = response.data.data;
    return { user, token: tokens.accessToken };
  },

  async register(data: RegisterCredentials): Promise<User> {
    // O endpoint /users cria a conta e retorna o usuário em `data` (sem tokens).
    const response = await apiClient.post<{ success: boolean; data: User }>('/users', data);
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/users/me');
    return response.data.data;
  },
};