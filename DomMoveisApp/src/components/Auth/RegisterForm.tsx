import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(nome, email, senha);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="register-field">
        <label className="register-label">Nome</label>
        <div className="register-input-wrapper">
          <User className="register-input-icon" />
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="register-input"
            placeholder="Seu nome completo"
            required
          />
        </div>
      </div>

      <div className="register-field">
        <label className="register-label">E-mail</label>
        <div className="register-input-wrapper">
          <Mail className="register-input-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            placeholder="seu@email.com"
            required
          />
        </div>
      </div>

      <div className="register-field">
        <label className="register-label">Senha</label>
        <div className="register-input-wrapper">
          <Lock className="register-input-icon" />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="register-input"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>
      </div>

      {error && (
        <div className="register-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="register-btn">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cadastrando...
          </>
        ) : (
          <>
            <UserPlus />
            Cadastrar
          </>
        )}
      </button>
    </form>
  );
};