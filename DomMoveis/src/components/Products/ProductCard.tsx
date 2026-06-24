import React, { useState } from 'react';
import type { Product } from '../../api/productsApi';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onReactivate?: (id: string) => void;
    onDeletePermanent?: (id: string) => void;
    showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onEdit,
    onDelete,
    onReactivate,
    onDeletePermanent,
    showActions = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div 
            className={`product-card ${isHovered ? 'product-card-hover' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card-badge">
                <span className={`status-badge ${product.ativo ? 'active' : 'inactive'}`}>
                    {product.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                </span>
                {product.destaque && (
                    <span className="badge-highlight">⭐ Destaque</span>
                )}
            </div>

            <div className="product-card-header">
                <div className="product-image">
                    {product.imagens && product.imagens.length > 0 && !imageError ? (
                        <img 
                            src={product.imagens[0]} 
                            alt={product.nome}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="product-image-placeholder">📦</span>
                    )}
                </div>
            </div>

            <div className="product-card-body">
                <div className="product-category-badge">
                    {product.categoria?.nome || 'Sem categoria'}
                </div>
                <h3>{product.nome}</h3>
                <p className="product-description">
                    {product.descricao.substring(0, 80)}...
                </p>
                
                <div className="product-details">
                    <span className="product-price">{formatCurrency(product.preco)}</span>
                    {product.precoPromocional && (
                        <span className="product-price-promo">
                            {formatCurrency(product.precoPromocional)}
                        </span>
                    )}
                    <span className="product-stock">📦 {product.estoque} und.</span>
                </div>
                
                <div className="product-meta">
                    <span className="product-color">🎨 {product.cor}</span>
                    {product.medidas?.altura && (
                        <span className="product-size">
                            📏 {product.medidas.altura}×{product.medidas.largura}×{product.medidas.profundidade} {product.medidas.unidadeMedida}
                        </span>
                    )}
                </div>
            </div>

            {showActions && (
                <div className="product-card-actions">
                    <button className="btn-edit" onClick={() => onEdit(product)}>
                        ✏️ Editar
                    </button>
                    
                    {product.ativo ? (
                        <button className="btn-delete" onClick={() => onDelete(product._id)}>
                            🗑️ Desativar
                        </button>
                    ) : (
                        <>
                            {onReactivate && (
                                <button className="btn-reactivate" onClick={() => onReactivate(product._id)}>
                                    🔄 Reativar
                                </button>
                            )}
                            {onDeletePermanent && (
                                <button className="btn-delete-permanent" onClick={() => onDeletePermanent(product._id)}>
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

export default ProductCard;