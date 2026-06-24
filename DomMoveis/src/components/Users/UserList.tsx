import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, type User } from '../../api/usersApi';
import UserCard from './UserCard';
import UserForm from './UserForm';

const UserList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await usersApi.getAll(page, 10);
            if (response.data.success) {
                let filteredUsers = response.data.data;
                
                if (filter === 'active') {
                    filteredUsers = filteredUsers.filter(u => u.ativo);
                } else if (filter === 'inactive') {
                    filteredUsers = filteredUsers.filter(u => !u.ativo);
                }
                
                if (roleFilter !== 'all') {
                    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
                }
                
                setUsers(filteredUsers);
                setTotalPages(response.data.pagination.pages);
                setTotalUsers(response.data.pagination.total);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, filter, roleFilter]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Deseja desativar este usuário?')) {
            try {
                await usersApi.delete(id);
                loadUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao desativar usuário');
            }
        }
    };

    const handleReactivate = async (id: string) => {
        if (window.confirm('Deseja reativar este usuário?')) {
            try {
                await usersApi.reactivate(id);
                loadUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao reativar usuário');
            }
        }
    };

    const handleDeletePermanent = async (id: string) => {
        if (window.confirm('⚠️ Tem certeza? Esta ação é irreversível!')) {
            try {
                await usersApi.deletePermanently(id);
                loadUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Erro ao deletar usuário');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingUser(null);
        loadUsers();
    };

    const roleLabels: Record<number, string> = {
        0: 'Usuário',
        1: 'Vendedor',
        2: 'Gerente',
        3: 'Administrador'
    };

    // Contagem de usuários por status
    const activeCount = users.filter(u => u.ativo).length;
    const inactiveCount = users.filter(u => !u.ativo).length;

    return (
        <div className="user-list-container">
            {/* Header com navegação */}
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>
                    ← Voltar ao Dashboard
                </button>
            </div>

            {/* Cabeçalho principal */}
            <div className="user-list-header">
                <div className="user-list-title">
                    <h2>👥 Usuários</h2>
                    <span className="user-total">{totalUsers} usuários</span>
                </div>
                <button className="btn-primary" onClick={() => { setEditingUser(null); setShowForm(true); }}>
                    ➕ Novo Usuário
                </button>
            </div>

            {/* Estatísticas rápidas */}
            <div className="user-stats">
                <div className="stat-item total">
                    <span className="stat-number">{totalUsers}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item active">
                    <span className="stat-number">{activeCount}</span>
                    <span className="stat-label">Ativos</span>
                </div>
                <div className="stat-item inactive">
                    <span className="stat-number">{inactiveCount}</span>
                    <span className="stat-label">Inativos</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="user-list-filters">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">Todos</option>
                        <option value="active">🟢 Ativos</option>
                        <option value="inactive">🔴 Inativos</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Role:</label>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                        <option value="all">Todas</option>
                        {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <button className="btn-refresh" onClick={loadUsers}>
                    🔄 Atualizar
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {/* Lista de usuários */}
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando usuários...</p>
                </div>
            ) : (
                <>
                    <div className="user-grid">
                        {users.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">👥</span>
                                <h3>Nenhum usuário encontrado</h3>
                                <p>Tente ajustar os filtros ou criar um novo usuário.</p>
                            </div>
                        ) : (
                            users.map(user => (
                                <UserCard
                                    key={user._id}
                                    user={user}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onReactivate={handleReactivate}
                                    onDeletePermanent={handleDeletePermanent}
                                />
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ◀ Anterior
                            </button>
                            <span>Página {page} de {totalPages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Próxima ▶
                            </button>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <UserForm
                    user={editingUser}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setShowForm(false); setEditingUser(null); }}
                />
            )}
        </div>
    );
};

export default UserList;