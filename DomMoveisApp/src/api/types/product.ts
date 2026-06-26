import { Category } from './category';

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
  categoria: string | Category;
  cor: string;
  preco: number;
  precoPromocional?: number;
  estoque: number;
  imagens: string[];
  slug: string;
  destaque: boolean;
  ativo: boolean;
  dataCriacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  nome: string;
  descricao: string;
  medidas?: {
    altura?: number;
    largura?: number;
    profundidade?: number;
    peso?: number;
    unidadeMedida?: 'cm' | 'm' | 'kg';
  };
  categoria: string;
  cor: string;
  preco: number;
  precoPromocional?: number;
  estoque?: number;
  imagens?: string[];
  destaque?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  ativo?: boolean;
}