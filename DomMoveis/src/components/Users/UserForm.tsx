import React, { useState, useEffect } from 'react';
import { usersApi, type User } from '../../api/usersApi';

interface UserFormProps {
    user?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        role: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome,
                email: user.email,
                senha: '',
                telefone: user.telefone || '',
                role: user.role,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (user) {
                await usersApi.update(user._id, {
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                });
                if (formData.role !== user.role) {
                    await usersApi.updateRole(user._id, formData.role);
                }
            } else {
                await usersApi.create({
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha,
                    telefone: formData.telefone,
                    role: formData.role,
                });
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: 0, label: '👤 Usuário' },
        { value: 1, label: '🛒 Vendedor' },
        { value: 2, label: '📊 Gerente' },
        { value: 3, label: '👑 Administrador' },
    ];

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{user ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</h2>
                    <button className="modal-close" onClick={onCancel}>✕</button>
                </div>
                
                {error && <div className="error-message">❌ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome completo *</label>
                        <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Digite o nome completo"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>E-mail *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="usuario@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {!user && (
                        <div className="form-group">
                            <label>Senha *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.senha}
                                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    required={!user}
                                    minLength={6}
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Telefone</label>
                            <input
                                type="text"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                placeholder="(11) 99999-9999"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nível de acesso</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}
                                disabled={loading}
                            >
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Salvando...
                                </>
                            ) : (
                                '💾 Salvar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;