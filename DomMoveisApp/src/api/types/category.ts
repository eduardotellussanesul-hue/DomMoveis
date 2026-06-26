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

export interface CreateCategoryDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateCategoryDTO {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}