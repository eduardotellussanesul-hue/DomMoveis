import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '../components/Product/ProductForm';
import { productService } from '../services/productService';
import { ArrowLeft } from 'lucide-react';
import { Loading } from '../components/common/Loading';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      productService.getById(id)
        .then((data) => {
          setInitialData({
            nome: data.nome,
            descricao: data.descricao,
            categoria: typeof data.categoria === 'string' ? data.categoria : data.categoria._id,
            cor: data.cor,
            preco: data.preco?.toString() || '',
            precoPromocional: data.precoPromocional?.toString() || '',
            estoque: data.estoque?.toString() || '0',
            medidas: data.medidas ? {
              altura: data.medidas.altura?.toString() || '',
              largura: data.medidas.largura?.toString() || '',
              profundidade: data.medidas.profundidade?.toString() || '',
              peso: data.medidas.peso?.toString() || '',
              unidadeMedida: data.medidas.unidadeMedida || 'cm',
            } : { unidadeMedida: 'cm' },
            destaque: data.destaque || false,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Erro ao carregar produto');
          navigate('/products');
        });
    }
  }, [id, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <div className="product-form-header">
          <span className="icon">✏️</span>
          <h1>Editar Produto</h1>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <ProductForm
          initialData={initialData}
          isEditing={true}
          productId={id}
          onSuccess={() => navigate('/products')}
          onCancel={() => navigate('/products')}
        />
      </div>
    </div>
  );
};