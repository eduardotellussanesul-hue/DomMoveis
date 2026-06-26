import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, LogIn, UserPlus, LogOut, Grid, Package, PlusCircle } from 'lucide-react';
import '../../styles/NavBar.css'; // ← importando o CSS

export const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🛋️</span>
          <span className="navbar-logo-text">DomMoveis</span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/categories" className="navbar-btn" title="Categorias">
                <Grid />
              </Link>
              <Link to="/products" className="navbar-btn" title="Produtos">
                <Package />
              </Link>
              <Link to="/categories/new" className="navbar-btn" title="Nova Categoria">
                <PlusCircle />
              </Link>
              <Link to="/products/new" className="navbar-btn" title="Novo Produto">
                <PlusCircle />
              </Link>
              <div className="navbar-divider"></div>
              <span className="navbar-username">
                {user.nome.split(' ')[0]}
              </span>
              <button onClick={logout} className="navbar-btn navbar-logout" title="Sair">
                <LogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-auth-btn primary">
                <LogIn />
                <span>Entrar</span>
              </Link>
              <Link to="/register" className="navbar-auth-btn secondary">
                <UserPlus />
                <span>Registrar</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};