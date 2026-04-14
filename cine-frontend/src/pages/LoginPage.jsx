// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.contrasena);
      navigate(user.rol === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl">🎬</span>
          <h1 className="font-display text-3xl font-black text-cinema-light mt-2">Iniciar sesión</h1>
          <p className="text-cinema-muted mt-1 text-sm">Accede a tu cuenta de CineSystem</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-cinema-muted text-sm mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@cine.com"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-cinema-muted text-sm mb-1.5">Contraseña</label>
            <input
              type="password"
              value={form.contrasena}
              onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 mt-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" />Entrando...</>
            ) : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-cinema-muted text-sm mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/" className="text-cinema-amber hover:underline">Explorar cartelera</Link>
        </p>

        {/* Credenciales de prueba */}
        <div className="card p-4 mt-4 text-xs text-cinema-muted">
          <p className="font-semibold text-cinema-amber mb-1">Credenciales de prueba (admin):</p>
          <p>Email: <span className="font-mono text-cinema-light">admin@cine.com</span></p>
          <p>Pass:  <span className="font-mono text-cinema-light">Admin123!</span></p>
        </div>
      </div>
    </main>
  );
}
