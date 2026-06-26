import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/Product/ProductList';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { productService } from '../services/productService';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading, error, refetch } = useProducts();

  const isAdmin = user?.role === 3;

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este produto?')) {
      try {
        await productService.delete(id);
        refetch();
        alert('Produto desativado com sucesso!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao desativar produto');
      }
    }
  };

  const handleReactivate = async (id: string) => {
    if (window.confirm('Tem certeza que deseja reativar este produto?')) {
      try {
        await productService.reactivate(id);
        refetch();
        alert('Produto reativado com sucesso!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao reativar produto');
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('Excluir permanentemente este produto? Esta ação não pode ser desfeita!')) {
      try {
        await productService.deletePermanently(id);
        refetch();
        alert('Produto excluído permanentemente!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir permanentemente');
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/products/edit/${id}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">
          <span className="icon">📦</span> Produtos
          <span className="count">({products.length})</span>
        </h1>
        <div className="products-actions">
          <button
            onClick={() => navigate('/')}
            className="products-btn-back"
            title="Voltar para Home"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <Link to="/products/new" className="products-btn-add">
            <PlusCircle className="w-4 h-4" />
            Novo Produto
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="products-empty">
          <div className="empty-icon">📦</div>
          <h3>Nenhum produto cadastrado</h3>
          <p>Clique em "Novo Produto" para adicionar o primeiro.</p>
        </div>
      ) : (
        <ProductList
          products={products}
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