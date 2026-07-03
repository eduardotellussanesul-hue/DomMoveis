import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../api/types/product';
import { ArrowLeft, Pencil, Trash2, Ruler, Tag, DollarSign, Layers, Maximize, Weight } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>(product.imagens?.[0] || '');

  const formatPrice = (value: number) => {
    return value?.toFixed(2).replace('.', ',') ?? '0,00';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product._id);
    } else {
      navigate(`/products/edit/${product._id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product._id);
    }
  };

  return (
    <div className="product-details-container">
      {/* Cabeçalho com botão voltar */}
      <div className="product-details-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="product-details-title">
          <h1>{product.nome}</h1>
          <span className={`status-badge ${product.ativo ? 'active' : 'inactive'}`}>
            {product.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="product-details-actions">
          {isAdmin && (
            <>
              <button onClick={handleEdit} className="btn-edit">
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              {product.ativo && (
                <button onClick={handleDelete} className="btn-delete">
                  <Trash2 className="w-4 h-4" />
                  Desativar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="product-details-content">
        {/* Galeria de imagens */}
        {product.imagens && product.imagens.length > 0 && (
          <div className="product-details-gallery">
            <div className="main-image">
              <img src={selectedImage} alt={product.nome} />
            </div>
            <div className="thumbnail-list">
              {product.imagens.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.nome} - ${index + 1}`}
                  className={`thumbnail ${selectedImage === url ? 'active' : ''}`}
                  onClick={() => setSelectedImage(url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Informações do produto */}
        <div className="product-details-info">
          <div className="info-section">
            <h2>Descrição</h2>
            <p>{product.descricao}</p>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <Tag className="icon" />
              <span className="label">Categoria</span>
              <span className="value">
                {typeof product.categoria === 'string' ? product.categoria : product.categoria?.nome || 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <Palette className="icon" />
              <span className="label">Cor</span>
              <span className="value">{product.cor}</span>
            </div>
            <div className="info-item">
              <DollarSign className="icon" />
              <span className="label">Preço</span>
              <span className="value">R$ {formatPrice(product.preco)}</span>
              {product.precoPromocional && (
                <span className="value promo">
                  Promo: R$ {formatPrice(product.precoPromocional)}
                </span>
              )}
            </div>
            <div className="info-item">
              <Layers className="icon" />
              <span className="label">Estoque</span>
              <span className="value">{product.estoque}</span>
            </div>
          </div>

          {/* Medidas */}
          {product.medidas && (
            <div className="info-section measures">
              <h2>
                <Ruler className="icon" /> Medidas
              </h2>
              <div className="measures-grid">
                {product.medidas.altura && (
                  <div className="measure-item">
                    <Maximize className="icon" />
                    <span>Altura: {product.medidas.altura} {product.medidas.unidadeMedida}</span>
                  </div>
                )}
                {product.medidas.largura && (
                  <div className="measure-item">
                    <Maximize className="icon" />
                    <span>Largura: {product.medidas.largura} {product.medidas.unidadeMedida}</span>
                  </div>
                )}
                {product.medidas.profundidade && (
                  <div className="measure-item">
                    <Maximize className="icon" />
                    <span>Profundidade: {product.medidas.profundidade} {product.medidas.unidadeMedida}</span>
                  </div>
                )}
                {product.medidas.peso && (
                  <div className="measure-item">
                    <Weight className="icon" />
                    <span>Peso: {product.medidas.peso} kg</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="info-section meta">
            <p><strong>Slug:</strong> {product.slug}</p>
            <p><strong>Criado em:</strong> {new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
            <p><strong>Última atualização:</strong> {new Date(product.updatedAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ícone Paleta (caso não exista no lucide-react, podemos importar ou usar um emoji)
// Vou importar do lucide-react: Palette
import { Palette } from 'lucide-react';