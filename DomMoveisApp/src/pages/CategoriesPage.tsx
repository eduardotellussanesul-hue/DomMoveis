import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { CategoryList } from '../components/Category/CategoryList';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { categoryService } from '../services/categoryService';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading, error, refetch } = useCategories();

  const isAdmin = user?.role === 3;

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar esta categoria?')) {
      try {
        await categoryService.delete(id);
        refetch();
        alert('Categoria desativada com sucesso!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao desativar categoria');
      }
    }
  };

  const handleReactivate = async (id: string) => {
    if (window.confirm('Tem certeza que deseja reativar esta categoria?')) {
      try {
        await categoryService.reactivate(id);
        refetch();
        alert('Categoria reativada com sucesso!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao reativar categoria');
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('Excluir permanentemente esta categoria? Esta ação não pode ser desfeita!')) {
      try {
        await categoryService.deletePermanently(id);
        refetch();
        alert('Categoria excluída permanentemente!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir permanentemente');
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/categories/edit/${id}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1 className="categories-title">
          <span className="icon">📂</span> Categorias
          <span className="count">({categories.length})</span>
        </h1>
        <div className="categories-actions">
          <button
            onClick={() => navigate('/')} // ← VOLTA PARA A HOME
            className="categories-btn-back"
            title="Voltar para Home"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <Link to="/categories/new" className="categories-btn-add">
            <PlusCircle className="w-4 h-4" />
            Nova Categoria
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty">
          <div className="empty-icon">📁</div>
          <h3>Nenhuma categoria cadastrada</h3>
          <p>Clique em "Nova Categoria" para adicionar a primeira.</p>
        </div>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReactivate={handleReactivate}
          onPermanentDelete={isAdmin ? handlePermanentDelete : undefined}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};