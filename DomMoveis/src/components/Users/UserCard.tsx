import React, { useState } from 'react';
import type { User } from '../../api/usersApi';

interface UserCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onReactivate?: (id: string) => void;
    onDeletePermanent?: (id: string) => void;
    showActions?: boolean;
}

const getRoleBadge = (roleName: string) => {
    const colors: Record<string, string> = {
        'Administrador': 'badge-admin',
        'Gerente': 'badge-manager',
        'Vendedor': 'badge-seller',
        'Usuário': 'badge-user',
    };
    return colors[roleName] || 'badge-user';
};

const getRoleIcon = (roleName: string) => {
    const icons: Record<string, string> = {
        'Administrador': '👑',
        'Gerente': '📊',
        'Vendedor': '🛒',
        'Usuário': '👤',
    };
    return icons[roleName] || '👤';
};

const UserCard: React.FC<UserCardProps> = ({
    user,
    onEdit,
    onDelete,
    onReactivate,
    onDeletePermanent,
    showActions = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`user-card ${isHovered ? 'user-card-hover' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badge de status flutuante */}
            <div className="user-card-badge">
                <span className={`status-badge ${user.ativo ? 'active' : 'inactive'}`}>
                    {user.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                </span>
            </div>

            <div className="user-card-header">
                <div className="user-avatar-wrapper">
                    <div className="user-avatar">
                        {user.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-avatar-ring"></div>
                </div>
                <div className="user-role-badge">
                    <span className={`role-badge ${getRoleBadge(user.roleName)}`}>
                        {getRoleIcon(user.roleName)} {user.roleName}
                    </span>
                </div>
            </div>

            <div className="user-card-body">
                <h3>{user.nome}</h3>
                <p className="user-email">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {user.email}
                </p>
                {user.telefone && (
                    <p className="user-phone">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {user.telefone}
                    </p>
                )}
                <div className="user-meta">
                    <span className="user-created">
                        🗓️ {new Date(user.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                    {user.ultimoAcesso && (
                        <span className="user-last-access">
                            🔄 {new Date(user.ultimoAcesso).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
            </div>

            {showActions && (
                <div className="user-card-actions">
                    <button className="btn-edit" onClick={() => onEdit(user)}>
                        ✏️ Editar
                    </button>
                    
                    {user.ativo ? (
                        <button className="btn-delete" onClick={() => onDelete(user._id)}>
                            🗑️ Desativar
                        </button>
                    ) : (
                        <>
                            {onReactivate && (
                                <button className="btn-reactivate" onClick={() => onReactivate(user._id)}>
                                    🔄 Reativar
                                </button>
                            )}
                            {onDeletePermanent && (
                                <button className="btn-delete-permanent" onClick={() => onDeletePermanent(user._id)}>
                                    💀 Excluir
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserCard;