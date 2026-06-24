import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi, type Category } from '../../api/categoriesApi';
import CategoryCard from './CategoryCard';
import CategoryForm from './CategoryForm';

const CategoryList: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const loadCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await categoriesApi.getAll();
            if (response.data.success) {
                let filteredCategories = response.data.data;
                
                if (filter === 'active') {
                    filteredCategories = filteredCategories.filter(c => c.ativo);
                } else if (filter === 'inactive') {
                    filteredCategories = filteredCategories.filter(c => !c.ativo);
                }
                
                setCategories(filteredCategories);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [filter]);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Deseja desativar esta categoria?')) {
            try {
                await categoriesApi.delete(id);
                loadCategories();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao desativar categoria');
            }
        }
    };

    const handleReactivate = async (id: string) => {
        if (window.confirm('Deseja reativar esta categoria?')) {
            try {
                await categoriesApi.reactivate(id);
                loadCategories();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao reativar categoria');
            }
        }
    };

    const handleDeletePermanent = async (id: string) => {
        if (window.confirm('⚠️ Tem certeza? Esta ação é irreversível!')) {
            try {
                await categoriesApi.deletePermanently(id);
                loadCategories();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao deletar categoria');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingCategory(null);
        loadCategories();
    };

    const activeCount = categories.filter(c => c.ativo).length;
    const inactiveCount = categories.filter(c => !c.ativo).length;

    return (
        <div className="category-list-container">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>
                    ← Voltar ao Dashboard
                </button>
            </div>

            <div className="category-list-header">
                <div className="category-list-title">
                    <h2>🏷️ Categorias</h2>
                    <span className="category-total">{categories.length} categorias</span>
                </div>
                <button className="btn-primary" onClick={() => { setEditingCategory(null); setShowForm(true); }}>
                    ➕ Nova Categoria
                </button>
            </div>

            <div className="category-stats">
                <div className="stat-item total">
                    <span className="stat-number">{categories.length}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item active">
                    <span className="stat-number">{activeCount}</span>
                    <span className="stat-label">Ativas</span>
                </div>
                <div className="stat-item inactive">
                    <span className="stat-number">{inactiveCount}</span>
                    <span className="stat-label">Inativas</span>
                </div>
            </div>

            <div className="category-list-filters">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">Todas</option>
                        <option value="active">🟢 Ativas</option>
                        <option value="inactive">🔴 Inativas</option>
                    </select>
                </div>

                <button className="btn-refresh" onClick={loadCategories}>
                    🔄 Atualizar
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando categorias...</p>
                </div>
            ) : (
                <div className="category-grid">
                    {categories.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🏷️</span>
                            <h3>Nenhuma categoria encontrada</h3>
                            <p>Tente ajustar os filtros ou criar uma nova categoria.</p>
                        </div>
                    ) : (
                        categories.map(category => (
                            <CategoryCard
                                key={category._id}
                                category={category}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onReactivate={handleReactivate}
                                onDeletePermanent={handleDeletePermanent}
                            />
                        ))
                    )}
                </div>
            )}

            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setShowForm(false); setEditingCategory(null); }}
                />
            )}
        </div>
    );
};

export default CategoryList;