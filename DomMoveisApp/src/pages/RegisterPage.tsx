import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/Auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            <span>✨</span>
          </div>
          <h1 className="register-title">Criar Conta</h1>
          <p className="register-subtitle">Comece a gerenciar sua loja</p>
        </div>

        <RegisterForm />

        <div className="register-footer">
          Já tem conta? <Link to="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
};