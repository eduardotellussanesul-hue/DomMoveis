import React from 'react';
import type { Category } from '../../api/types/category';
import { Pencil, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onDelete,
  onEdit,
  onReactivate,
  onPermanentDelete,
  isAdmin = false,
}) => {
  if (categories.length === 0) {
    return (
      <div className="categories-empty">
        <div className="empty-icon">📁</div>
        <h3>Nenhuma categoria encontrada</h3>
        <p>Tente recarregar ou criar uma nova.</p>
      </div>
    );
  }

  return (
    <div className="categories-grid">
      {categories.map((category) => (
        <div key={category._id} className="category-card">
          <div>
            <div className="category-card-header">
              <h3 className="category-card-title">{category.nome}</h3>
              <span
                className={`category-card-status ${
                  category.ativo ? 'active' : 'inactive'
                }`}
              >
                {category.ativo ? 'Ativo' : 'Inativo'}
              </span> 
            </div>
            {category.descricao && (
              <p className="category-card-desc">{category.descricao}</p>
            )}
            <p className="category-card-slug">slug: {category.slug}</p>
          </div>
          <div className="category-card-actions">
            {onEdit && (
              <button
                onClick={() => onEdit(category._id)}
                className="category-card-btn edit"
                title="Editar"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
            )}
            {category.ativo ? (
              onDelete && (
                <button
                  onClick={() => onDelete(category._id)}
                  className="category-card-btn delete"
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
                    onClick={() => onReactivate(category._id)}
                    className="category-card-btn reactivate"
                    title="Reativar"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reativar
                  </button>
                )}
                {isAdmin && onPermanentDelete && (
                  <button
                    onClick={() => onPermanentDelete(category._id)}
                    className="category-card-btn permanent-delete"
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