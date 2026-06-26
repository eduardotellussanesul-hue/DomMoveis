import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryForm } from '../components/Category/CategoryForm';
import { categoryService } from '../services/categoryService';
import { ArrowLeft } from 'lucide-react';
import { Loading } from '../components/common/Loading';

export const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      categoryService.getById(id)
        .then((data) => {
          setInitialData({ nome: data.nome, descricao: data.descricao });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Erro ao carregar categoria');
          navigate('/categories');
        });
    }
  }, [id, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="category-form-container">
      <div className="category-form-card">
        <div className="category-form-header">
          <span className="icon">✏️</span>
          <h1>Editar Categoria</h1>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <CategoryForm
          initialData={initialData}
          isEditing={true}
          categoryId={id}
          onSuccess={() => navigate('/categories')}
          onCancel={() => navigate('/categories')}
        />
      </div>
    </div>
  );
};