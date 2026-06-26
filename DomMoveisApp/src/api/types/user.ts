// ============================================
// TIPOS PARA AUTENTICAÇÃO
// ============================================

export interface User {
  _id: string;
  id: string; // alias para _id
  nome: string;
  email: string;
  telefone?: string;
  role: number; // RoleType: 0=Usuario, 1=Vendedor, 2=Gerente, 3=Administrador
  ativo: boolean;
  dataCriacao: string;
  ultimoAcesso?: string;
  roleName: string; // virtual
  roleIcon: string; // virtual
  isAdmin: boolean;
  isManager: boolean;
  isSeller: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Resposta completa do backend (login e registro)
export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

// O que o AuthContext realmente precisa (user + accessToken)
export interface AuthData {
  user: User;
  token: string; // accessToken
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  role?: number;
}