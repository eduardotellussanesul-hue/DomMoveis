import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductDetails } from '../components/Product/ProductDetails';
import { Loading } from '../components/common/Loading';
import type { Product } from '../api/types/product';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      productService.getById(id)
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Erro ao carregar produto');
          setLoading(false);
        });
    } else {
      setError('ID do produto não fornecido');
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja desativar este produto?')) {
      try {
        await productService.delete(productId);
        alert('Produto desativado com sucesso!');
        navigate('/products');
      } catch (err) {
        alert('Erro ao desativar produto');
      }
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/edit/${productId}`);
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Produto não encontrado</div>;

  return (
    <ProductDetails
      product={product}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isAdmin={true} // ou defina com base no role do usuário
    />
  );
};