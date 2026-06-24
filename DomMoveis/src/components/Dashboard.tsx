import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header>
                <h1>🛒 DomMoveis</h1>
                <div className="user-info">
                    <span>👤 {user?.nome}</span>
                    <span className="role">{user?.roleName}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Sair
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <h2>Bem-vindo, {user?.nome}! 🎉</h2>
                <p>Você está logado como <strong>{user?.roleName}</strong></p>
                
                <div className="cards">
                    <div className="card" onClick={() => navigate('/users')}>
                        <h3>👥 Usuários</h3>
                        <p>Gerencie todos os usuários do sistema</p>
                        <button>Ver Usuários</button>
                    </div>
                    
                    <div className="card" onClick={() => navigate('/categories')}>
                        <h3>🏷️ Categorias</h3>
                        <p>Gerencie as categorias dos produtos</p>
                        <button>Ver Categorias</button>
                    </div>
                    
                    <div className="card" onClick={() => navigate('/products')}>
                        <h3>📦 Produtos</h3>
                        <p>Gerencie seus produtos</p>
                        <button>Ver Produtos</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;