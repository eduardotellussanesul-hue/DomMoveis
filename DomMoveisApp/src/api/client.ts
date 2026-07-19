// src/api/client.ts
import axios from 'axios';

// Fallback para localhost caso a variável de ambiente não esteja definida
// (ex.: build sem .env). Em device físico via USB use `adb reverse tcp:3000 tcp:3000`.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// 🔥 INTERCEPTOR DE REQUISIÇÃO - ADICIONA O TOKEN
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@DomMoveis:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔒 INTERCEPTOR DE RESPOSTA - trata sessão expirada (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || '';
    const isLoginCall = url.includes('/auth/login');
    const hadToken = !!localStorage.getItem('@DomMoveis:token');

    // Se o token expirou/ficou inválido em uma rota autenticada, limpa a sessão
    // e volta para o login. Ignora falhas do próprio login (credenciais inválidas).
    if (status === 401 && hadToken && !isLoginCall) {
      localStorage.removeItem('@DomMoveis:token');
      localStorage.removeItem('@DomMoveis:user');
      delete apiClient.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);