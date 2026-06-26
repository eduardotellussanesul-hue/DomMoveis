import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-field">
        <label className="login-label">E-mail</label>
        <div className="login-input-wrapper">
          <Mail className="login-input-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="seu@email.com"
            required
          />
        </div>
      </div>

      <div className="login-field">
        <label className="login-label">Senha</label>
        <div className="login-input-wrapper">
          <Lock className="login-input-icon" />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-input"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {error && (
        <div className="login-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="login-btn">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Entrando...
          </>
        ) : (
          <>
            <LogIn />
            Entrar
          </>
        )}
      </button>
    </form>
  );
};