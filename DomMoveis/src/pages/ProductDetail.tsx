import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, type Product } from '../api/productsApi';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) {
                setError('Produto não encontrado');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await productsApi.getById(id);
                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Produto não encontrado');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Erro ao carregar produto');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleWhatsAppClick = () => {
        if (!product) return;

        const phoneNumber = '556781091878';
        
        const message = encodeURIComponent(
            `Olá! Vim pelo site e gostaria de falar sobre o produto:\n\n` +
            `*${product.nome}*\n` +
            `Categoria: ${product.categoria?.nome || 'Sem categoria'}\n` +
            `Preço: ${formatCurrency(product.preco)}${product.precoPromocional ? ` (Promoção: ${formatCurrency(product.precoPromocional)})` : ''}\n` +
            `Cor: ${product.cor}\n` +
            `Medidas: ${product.medidas?.altura || 'N/A'}×${product.medidas?.largura || 'N/A'}×${product.medidas?.profundidade || 'N/A'} ${product.medidas?.unidadeMedida || 'cm'}\n` +
            `Link: ${window.location.href}\n\n`
        );

        // Abrir WhatsApp
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div className="spinner"></div>
                <p>Carregando produto...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <span className="error-icon">😕</span>
                <h2>{error || 'Produto não encontrado'}</h2>
                <button className="btn-back-catalog" onClick={() => navigate('/catalog')}>
                    ← Voltar ao Catálogo
                </button>
            </div>
        );
    }

    const images = product.imagens && product.imagens.length > 0 ? product.imagens : [];

    return (
        <div className="product-detail-container">
            {/* Botão Voltar */}
            <button className="btn-back-catalog" onClick={() => navigate('/catalog')}>
                ← Voltar ao Catálogo
            </button>

            <div className="product-detail-content">
                {/* Galeria de Imagens */}
                <div className="product-detail-gallery">
                    <div className="product-detail-main-image">
                        {images.length > 0 && !imageError ? (
                            <img
                                src={images[selectedImage] || images[0]}
                                alt={product.nome}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className="product-detail-placeholder">📦</span>
                        )}
                        {product.destaque && (
                            <span className="product-detail-badge">⭐ Destaque</span>
                        )}
                        {product.precoPromocional && (
                            <span className="product-detail-badge sale">🔥 Oferta</span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="product-detail-thumbnails">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedImage(index);
                                        setImageError(false);
                                    }}
                                >
                                    <img src={img} alt={`${product.nome} - ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Informações do Produto */}
                <div className="product-detail-info">
                    <span className="product-detail-category">
                        {product.categoria?.nome || 'Sem categoria'}
                    </span>
                    <h1>{product.nome}</h1>

                    <div className="product-detail-price">
                        {product.precoPromocional ? (
                            <>
                                <span className="price-original">{formatCurrency(product.preco)}</span>
                                <span className="price-sale">{formatCurrency(product.precoPromocional)}</span>
                            </>
                        ) : (
                            <span className="price-normal">{formatCurrency(product.preco)}</span>
                        )}
                    </div>

                    <div className="product-detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">📦 Estoque:</span>
                            <span className={`meta-value ${product.estoque > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.estoque > 0 ? `✅ ${product.estoque} unidades` : '❌ Indisponível'}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">🎨 Cor:</span>
                            <span className="meta-value">{product.cor}</span>
                        </div>
                        {product.medidas?.altura && (
                            <div className="meta-item">
                                <span className="meta-label">📏 Medidas:</span>
                                <span className="meta-value">
                                    {product.medidas.altura}×{product.medidas.largura}×{product.medidas.profundidade} {product.medidas.unidadeMedida}
                                </span>
                            </div>
                        )}
                        {product.medidas?.peso && (
                            <div className="meta-item">
                                <span className="meta-label">⚖️ Peso:</span>
                                <span className="meta-value">{product.medidas.peso} kg</span>
                            </div>
                        )}
                    </div>

                    <div className="product-detail-description">
                        <h3>Descrição</h3>
                        <p>{product.descricao}</p>
                    </div>

                    <button 
                        className="product-detail-btn-whatsapp" 
                        onClick={handleWhatsAppClick}
                    >
                        💬 Falar com o Vendedor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;