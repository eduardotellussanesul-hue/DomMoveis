import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../api/productsApi';

interface CatalogCardProps {
    product: Product;
}

const CatalogCard: React.FC<CatalogCardProps> = ({ product }) => {
    const [imageError, setImageError] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="catalog-card">
            <Link to={`/product/${product._id}`} className="catalog-card-link">
                <div className="catalog-card-image">
                    {product.imagens && product.imagens.length > 0 && !imageError ? (
                        <img 
                            src={product.imagens[0]} 
                            alt={product.nome}
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <span className="catalog-image-placeholder">📦</span>
                    )}
                    {product.destaque && (
                        <span className="catalog-badge">⭐ Destaque</span>
                    )}
                    {product.precoPromocional && (
                        <span className="catalog-badge sale">🔥 Oferta</span>
                    )}
                </div>

                <div className="catalog-card-body">
                    <span className="catalog-category">{product.categoria?.nome || 'Sem categoria'}</span>
                    <h3>{product.nome}</h3>
                    <p className="catalog-description">
                        {product.descricao.substring(0, 60)}...
                    </p>
                    
                    <div className="catalog-price">
                        {product.precoPromocional ? (
                            <>
                                <span className="catalog-price-original">{formatCurrency(product.preco)}</span>
                                <span className="catalog-price-sale">{formatCurrency(product.precoPromocional)}</span>
                            </>
                        ) : (
                            <span className="catalog-price-normal">{formatCurrency(product.preco)}</span>
                        )}
                    </div>

                    <div className="catalog-meta">
                        <span className={`catalog-stock ${product.estoque === 0 ? 'out-of-stock' : ''}`}>
                            {product.estoque > 0 ? '✅ Em estoque' : '❌ Indisponível'}
                        </span>
                        <span className="catalog-color">🎨 {product.cor}</span>
                    </div>

                    <button className="catalog-btn">
                        Ver detalhes
                    </button>
                </div>
            </Link>
        </div>
    );
};

export default CatalogCard;