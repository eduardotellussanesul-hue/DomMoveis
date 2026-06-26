import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryForm } from '../components/Category/CategoryForm';
import { ArrowLeft } from 'lucide-react';

export const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="category-form-container">
      <div className="category-form-card">
        <div className="category-form-header">
          <span className="icon">📂</span>
          <h1>Nova Categoria</h1>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <CategoryForm onSuccess={() => navigate('/categories')} />
      </div>
    </div>
  );
};