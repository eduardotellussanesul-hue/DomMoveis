import React, { useState, useEffect } from 'react';
import { productsApi, type Product } from '../api/productsApi';
import { categoriesApi, type Category } from '../api/categoriesApi';
import CatalogCard from '../components/Catalog/CatalogCard';
import CatalogFilters from '../components/Catalog/CatalogFilters';

const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = {
                page,
                limit: 12,
                ativo: true, // ✅ Apenas produtos ativos
            };

            if (selectedCategory) params.categoria = selectedCategory;
            if (search) params.search = search;

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
    }, [page, selectedCategory, search]);

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

    return (
        <div className="catalog-container">
            {/* Filtros */}
            <CatalogFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                search={search}
                onSearchChange={setSearch}
            />

            {/* Resultados */}
            {error && <div className="error-message">❌ {error}</div>}

            {loading ? (
                <div className="catalog-loading">
                    <div className="spinner"></div>
                    <p>Carregando produtos...</p>
                </div>
            ) : (
                <>
                    {products.length === 0 ? (
                        <div className="catalog-empty">
                            <span className="empty-icon">🔍</span>
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                        </div>
                    ) : (
                        <div className="catalog-grid">
                            {products.map(product => (
                                <CatalogCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
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
        </div>
    );
};

export default Catalog;