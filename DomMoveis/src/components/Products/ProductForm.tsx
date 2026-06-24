import React, { useState, useEffect } from 'react';
import type { Product } from '../../api/productsApi';
import { productsApi } from '../../api/productsApi';
import { categoriesApi, type Category } from '../../api/categoriesApi';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        medidas: {
            altura: '',
            largura: '',
            profundidade: '',
            peso: '',
            unidadeMedida: 'cm' as 'cm' | 'm' | 'kg',
        },
        categoria: '',
        cor: '',
        preco: '',
        precoPromocional: '',
        estoque: '0',
        imagens: [] as string[],
        destaque: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoriesApi.getAll(true);
                setCategories(response.data.data);
            } catch (err) {
                console.error('Erro ao carregar categorias:', err);
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                nome: product.nome,
                descricao: product.descricao,
                medidas: {
                    altura: product.medidas?.altura?.toString() || '',
                    largura: product.medidas?.largura?.toString() || '',
                    profundidade: product.medidas?.profundidade?.toString() || '',
                    peso: product.medidas?.peso?.toString() || '',
                    unidadeMedida: product.medidas?.unidadeMedida || 'cm',
                },
                categoria: product.categoria?._id || '',
                cor: product.cor,
                preco: product.preco.toString(),
                precoPromocional: product.precoPromocional?.toString() || '',
                estoque: product.estoque.toString(),
                imagens: product.imagens || [],
                destaque: product.destaque,
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = {
                ...formData,
                medidas: {
                    altura: formData.medidas.altura ? Number(formData.medidas.altura) : undefined,
                    largura: formData.medidas.largura ? Number(formData.medidas.largura) : undefined,
                    profundidade: formData.medidas.profundidade ? Number(formData.medidas.profundidade) : undefined,
                    peso: formData.medidas.peso ? Number(formData.medidas.peso) : undefined,
                    unidadeMedida: formData.medidas.unidadeMedida,
                },
                preco: Number(formData.preco),
                precoPromocional: formData.precoPromocional ? Number(formData.precoPromocional) : undefined,
                estoque: Number(formData.estoque),
                imagens: formData.imagens,
            };

            if (product) {
                await productsApi.update(product._id, data);
            } else {
                await productsApi.create(data);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar produto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="modal-content modal-large">
                <div className="modal-header">
                    <h2>{product ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
                    <button className="modal-close" onClick={onCancel}>✕</button>
                </div>
                
                {error && <div className="error-message">❌ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome do produto *</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                                disabled={loading}
                                placeholder="Ex: Sofá Retrátil 3 Lugares"
                            />
                        </div>

                        <div className="form-group">
                            <label>Categoria *</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                required
                                disabled={loading || loadingCategories}
                            >
                                <option value="">Selecione uma categoria</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descrição *</label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            required
                            disabled={loading}
                            rows={4}
                            placeholder="Descreva o produto em detalhes..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cor *</label>
                            <input
                                type="text"
                                value={formData.cor}
                                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                                required
                                disabled={loading}
                                placeholder="Ex: Cinza, Preto, Azul"
                            />
                        </div>

                        <div className="form-group">
                            <label>Preço (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.preco}
                                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                                required
                                disabled={loading}
                                min="0"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label>Preço Promocional (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.precoPromocional}
                                onChange={(e) => setFormData({ ...formData, precoPromocional: e.target.value })}
                                disabled={loading}
                                min="0"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estoque *</label>
                            <input
                                type="number"
                                value={formData.estoque}
                                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                                required
                                disabled={loading}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Destaque</label>
                            <select
                                value={formData.destaque ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, destaque: e.target.value === 'true' })}
                                disabled={loading}
                            >
                                <option value="false">Não</option>
                                <option value="true">⭐ Sim</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Unidade de Medida</label>
                            <select
                                value={formData.medidas.unidadeMedida}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    medidas: { ...formData.medidas, unidadeMedida: e.target.value as 'cm' | 'm' | 'kg' }
                                })}
                                disabled={loading}
                            >
                                <option value="cm">cm</option>
                                <option value="m">m</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Altura (cm)</label>
                            <input
                                type="number"
                                value={formData.medidas.altura}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    medidas: { ...formData.medidas, altura: e.target.value }
                                })}
                                disabled={loading}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Largura (cm)</label>
                            <input
                                type="number"
                                value={formData.medidas.largura}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    medidas: { ...formData.medidas, largura: e.target.value }
                                })}
                                disabled={loading}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Profundidade (cm)</label>
                            <input
                                type="number"
                                value={formData.medidas.profundidade}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    medidas: { ...formData.medidas, profundidade: e.target.value }
                                })}
                                disabled={loading}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Peso (kg)</label>
                            <input
                                type="number"
                                value={formData.medidas.peso}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    medidas: { ...formData.medidas, peso: e.target.value }
                                })}
                                disabled={loading}
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* ✅ Image Uploader */}
                    <div className="form-group">
                        <label>Imagens do Produto</label>
                        <ImageUploader
                            images={formData.imagens}
                            onImagesChange={(newImages) => setFormData({ ...formData, imagens: newImages })}
                            maxImages={10}
                            disabled={loading}
                            folder="dommoveis/produtos"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Salvando...
                                </>
                            ) : (
                                '💾 Salvar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;