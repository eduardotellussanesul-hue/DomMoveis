import React, { useState, useEffect } from 'react';
import type { Category } from '../../api/categoriesApi';
import { categoriesApi } from '../../api/categoriesApi';

interface CategoryFormProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                nome: category.nome,
                descricao: category.descricao || '',
            });
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (category) {
                await categoriesApi.update(category._id, formData);
            } else {
                await categoriesApi.create(formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar categoria');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{category ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h2>
                    <button className="modal-close" onClick={onCancel}>✕</button>
                </div>
                
                {error && <div className="error-message">❌ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome da categoria *</label>
                        <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                            disabled={loading}
                            placeholder="Ex: Sofás, Mesas, Cadeiras..."
                        />
                        <small className="form-help">
                            O slug será gerado automaticamente a partir do nome.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            disabled={loading}
                            placeholder="Descreva o que esta categoria abrange (opcional)"
                            rows={3}
                        />
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

export default CategoryForm;