import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/Product/ProductForm';
import { ArrowLeft } from 'lucide-react';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <div className="product-form-header">
          <span className="icon">📦</span>
          <h1>Novo Produto</h1>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <ProductForm onSuccess={() => navigate('/products')} />
      </div>
    </div>
  );
};