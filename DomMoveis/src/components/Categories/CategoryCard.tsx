import React, { useState } from 'react';
import type { Category } from '../../api/categoriesApi';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onReactivate?: (id: string) => void;
    onDeletePermanent?: (id: string) => void;
    showActions?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onEdit,
    onDelete,
    onReactivate,
    onDeletePermanent,
    showActions = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`category-card ${isHovered ? 'category-card-hover' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="category-card-badge">
                <span className={`status-badge ${category.ativo ? 'active' : 'inactive'}`}>
                    {category.ativo ? '🟢 Ativa' : '🔴 Inativa'}
                </span>
            </div>

            <div className="category-card-header">
                <div className="category-icon-wrapper">
                    <span className="category-icon">🏷️</span>
                </div>
                <div className="category-slug-badge">
                    <span className="slug-badge">/{category.slug}</span>
                </div>
            </div>

            <div className="category-card-body">
                <h3>{category.nome}</h3>
                {category.descricao && (
                    <p className="category-description">{category.descricao}</p>
                )}
                <div className="category-meta">
                    <span className="category-created">
                        🗓️ {new Date(category.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>

            {showActions && (
                <div className="category-card-actions">
                    <button className="btn-edit" onClick={() => onEdit(category)}>
                        ✏️ Editar
                    </button>
                    
                    {category.ativo ? (
                        <button className="btn-delete" onClick={() => onDelete(category._id)}>
                            🗑️ Desativar
                        </button>
                    ) : (
                        <>
                            {onReactivate && (
                                <button className="btn-reactivate" onClick={() => onReactivate(category._id)}>
                                    🔄 Reativar
                                </button>
                            )}
                            {onDeletePermanent && (
                                <button className="btn-delete-permanent" onClick={() => onDeletePermanent(category._id)}>
                                    💀 Excluir
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryCard;