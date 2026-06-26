import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Grid, Package, PlusCircle, TrendingUp, Shield, Users } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-icon">
          <span>🛋️</span>
        </div>
        <h1 className="home-title">DomMoveisApp</h1>
        <p className="home-subtitle">
          Gerencie categorias e produtos da sua loja de móveis com facilidade.
        </p>

        {user && (
          <div className="home-greeting">
            <span className="home-greeting-text">👋 Olá,</span>
            <span className="home-greeting-name">{user.nome}</span>
            <span className="home-greeting-role">
              {user.roleName || user.role}
            </span>
          </div>
        )}

        <div className="mt-8">
          {user ? (
            <>
              <div className="home-grid">
                <Link to="/categories" className="home-card-link">
                  <div className="home-card-icon blue">
                    <Grid />
                  </div>
                  <h3 className="home-card-title">Categorias</h3>
                  <p className="home-card-desc">Visualize e gerencie</p>
                </Link>

                <Link to="/products" className="home-card-link">
                  <div className="home-card-icon green">
                    <Package />
                  </div>
                  <h3 className="home-card-title">Produtos</h3>
                  <p className="home-card-desc">Lista completa</p>
                </Link>
              </div>

              <div className="home-features">
                <div className="home-feature">
                  <div className="home-feature-icon blue">
                    <TrendingUp />
                  </div>
                  <h4 className="home-feature-title">Gestão Eficiente</h4>
                  <p className="home-feature-desc">Controle total do seu estoque</p>
                </div>
                <div className="home-feature">
                  <div className="home-feature-icon green">
                    <Shield />
                  </div>
                  <h4 className="home-feature-title">Segurança</h4>
                  <p className="home-feature-desc">Dados protegidos</p>
                </div>
                <div className="home-feature">
                  <div className="home-feature-icon purple">
                    <Users />
                  </div>
                  <h4 className="home-feature-title">Multi-usuário</h4>
                  <p className="home-feature-desc">Gerencie permissões</p>
                </div>
              </div>
            </>
          ) : (
            <div className="home-actions">
              <Link to="/login" className="home-btn-primary">
                Entrar
              </Link>
              <Link to="/register" className="home-btn-secondary">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};