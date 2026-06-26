import React from 'react';
import type { Product } from '../../api/types/product';
import { Pencil, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onDelete,
  onEdit,
  onReactivate,
  onPermanentDelete,
  isAdmin = false,
}) => {
  if (products.length === 0) {
    return (
      <div className="products-empty">
        <div className="empty-icon">📦</div>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente recarregar ou criar um novo.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product._id} className="product-card">
          {product.imagens && product.imagens.length > 0 && (
            <img
              src={product.imagens[0]}
              alt={product.nome}
              className="product-card-image"
            />
          )}
          <div>
            <div className="product-card-header">
              <h3 className="product-card-name">{product.nome}</h3>
              <span
                className={`product-card-status ${
                  product.ativo ? 'active' : 'inactive'
                }`}
              >
                {product.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="product-card-desc">
              {product.descricao.length > 100
                ? `${product.descricao.substring(0, 100)}...`
                : product.descricao}
            </p>
            <div className="product-card-price">
              R$ {product.preco?.toFixed(2) ?? '0,00'}
            </div>
            {product.precoPromocional && (
              <div className="product-card-price-promo">
                Promoção: R$ {product.precoPromocional.toFixed(2)}
              </div>
            )}
            <div className="product-card-meta">
              <span>Cor: {product.cor}</span>
              <span>Estoque: {product.estoque}</span>
              <span>Slug: {product.slug}</span>
            </div>
          </div>
          <div className="product-card-actions">
            {onEdit && (
              <button
                onClick={() => onEdit(product._id)}
                className="product-card-btn edit"
                title="Editar"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
            )}
            {product.ativo ? (
              onDelete && (
                <button
                  onClick={() => onDelete(product._id)}
                  className="product-card-btn delete"
                  title="Desativar"
                >
                  <Trash2 className="w-3 h-3" />
                  Desativar
                </button>
              )
            ) : (
              <>
                {onReactivate && (
                  <button
                    onClick={() => onReactivate(product._id)}
                    className="product-card-btn reactivate"
                    title="Reativar"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reativar
                  </button>
                )}
                {isAdmin && onPermanentDelete && (
                  <button
                    onClick={() => onPermanentDelete(product._id)}
                    className="product-card-btn permanent-delete"
                    title="Excluir permanentemente"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Excluir
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};