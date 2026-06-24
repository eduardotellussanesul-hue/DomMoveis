import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, type Product } from '../../api/productsApi';
import { categoriesApi, type Category } from '../../api/categoriesApi';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filters, setFilters] = useState({
        status: 'all' as 'all' | 'active' | 'inactive',
        categoria: '',
        search: '',
        destaque: 'all' as 'all' | 'true' | 'false',
    });

    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = {
                page,
                limit: 10,
            };

            if (filters.categoria) params.categoria = filters.categoria;
            if (filters.search) params.search = filters.search;
            if (filters.destaque !== 'all') params.destaque = filters.destaque === 'true';
            if (filters.status !== 'all') params.ativo = filters.status === 'active';

            const response = await productsApi.getAll(params);
            if (response.data.success) {
                setProducts(response.data.data);
                setTotalPages(response.data.pagination.pages);
                setTotalProducts(response.data.pagination.total);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, filters]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoriesApi.getAll(true);
                setCategories(response.data.data);
            } catch (err) {
                console.error('Erro ao carregar categorias:', err);
            }
        };
        loadCategories();
    }, []);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Deseja desativar este produto?')) {
            try {
                await productsApi.delete(id);
                loadProducts();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao desativar produto');
            }
        }
    };

    const handleReactivate = async (id: string) => {
        if (window.confirm('Deseja reativar este produto?')) {
            try {
                await productsApi.reactivate(id);
                loadProducts();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao reativar produto');
            }
        }
    };

    const handleDeletePermanent = async (id: string) => {
        if (window.confirm('⚠️ Tem certeza? Esta ação é irreversível!')) {
            try {
                await productsApi.deletePermanently(id);
                loadProducts();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao deletar produto');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingProduct(null);
        loadProducts();
    };

    const activeCount = products.filter(p => p.ativo).length;
    const inactiveCount = products.filter(p => !p.ativo).length;

    return (
        <div className="product-list-container">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>
                    ← Voltar ao Dashboard
                </button>
            </div>

            <div className="product-list-header">
                <div className="product-list-title">
                    <h2>📦 Produtos</h2>
                    <span className="product-total">{totalProducts} produtos</span>
                </div>
                <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                    ➕ Novo Produto
                </button>
            </div>

            <div className="product-stats">
                <div className="stat-item total">
                    <span className="stat-number">{totalProducts}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item active">
                    <span className="stat-number">{activeCount}</span>
                    <span className="stat-label">Ativos</span>
                </div>
                <div className="stat-item inactive">
                    <span className="stat-number">{inactiveCount}</span>
                    <span className="stat-label">Inativos</span>
                </div>
            </div>

            <div className="product-list-filters">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}>
                        <option value="all">Todos</option>
                        <option value="active">🟢 Ativos</option>
                        <option value="inactive">🔴 Inativos</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Categoria:</label>
                    <select value={filters.categoria} onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}>
                        <option value="">Todas</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Destaque:</label>
                    <select value={filters.destaque} onChange={(e) => setFilters({ ...filters, destaque: e.target.value as any })}>
                        <option value="all">Todos</option>
                        <option value="true">⭐ Destaque</option>
                        <option value="false">Não destaque</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label>Buscar:</label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Nome ou descrição..."
                        className="filter-search"
                    />
                </div>

                <button className="btn-refresh" onClick={loadProducts}>
                    🔄 Atualizar
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando produtos...</p>
                </div>
            ) : (
                <>
                    <div className="product-grid">
                        {products.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📦</span>
                                <h3>Nenhum produto encontrado</h3>
                                <p>Tente ajustar os filtros ou criar um novo produto.</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onReactivate={handleReactivate}
                                    onDeletePermanent={handleDeletePermanent}
                                />
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ◀ Anterior
                            </button>
                            <span>Página {page} de {totalPages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Próxima ▶
                            </button>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                />
            )}
        </div>
    );
};

export default ProductList;