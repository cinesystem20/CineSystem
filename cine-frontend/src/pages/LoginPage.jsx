// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [modo,    setModo]    = useState('login'); // 'login' | 'registro'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', contrasena: '' });
  const [regForm,   setRegForm]   = useState({ nombre: '', email: '', contrasena: '', confirmar: '' });

  const cambiarModo = (m) => { setModo(m); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(loginForm.email, loginForm.contrasena);
      navigate(user.rol === 'admin' ? '/admin' : '/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (regForm.contrasena !== regForm.confirmar) { setError('Las contraseñas no coinciden'); return; }
    if (regForm.contrasena.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { nombre: regForm.nombre, email: regForm.email, contrasena: regForm.contrasena, rol: 'cliente' });
      const user = await login(regForm.email, regForm.contrasena);
      navigate(user.rol === 'admin' ? '/admin' : '/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">

        <div className="text-center mb-8">
          <span className="text-4xl">🎬</span>
          <h1 className="font-display text-3xl font-black text-cinema-light mt-2">
            {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="text-cinema-muted mt-1 text-sm">
            {modo === 'login' ? 'Accede a tu cuenta de CineSystem' : 'Regístrate para comprar tiquetes'}
          </p>
        </div>

        <div className="flex gap-1 mb-5 bg-cinema-card rounded-xl p-1 border border-cinema-border">
          <button onClick={() => cambiarModo('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${modo === 'login' ? 'bg-cinema-amber text-cinema-black' : 'text-cinema-muted hover:text-cinema-light'}`}>
            Iniciar sesión
          </button>
          <button onClick={() => cambiarModo('registro')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${modo === 'registro' ? 'bg-cinema-amber text-cinema-black' : 'text-cinema-muted hover:text-cinema-light'}`}>
            Crear cuenta
          </button>
        </div>

        {modo === 'login' && (
          <form onSubmit={handleLogin} className="card p-6 space-y-4 animate-slide-up">
            {error && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-red-300 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" className="input" required />
            </div>
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Contraseña</label>
              <input type="password" value={loginForm.contrasena} onChange={e => setLoginForm(p => ({ ...p, contrasena: e.target.value }))} placeholder="••••••••" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" />Entrando...</> : 'Ingresar'}
            </button>
          </form>
        )}

        {modo === 'registro' && (
          <form onSubmit={handleRegistro} className="card p-6 space-y-4 animate-slide-up">
            {error && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-red-300 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Nombre completo</label>
              <input type="text" value={regForm.nombre} onChange={e => setRegForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Tu nombre" className="input" required />
            </div>
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Email</label>
              <input type="email" value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" className="input" required />
            </div>
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Contraseña</label>
              <input type="password" value={regForm.contrasena} onChange={e => setRegForm(p => ({ ...p, contrasena: e.target.value }))} placeholder="Mínimo 6 caracteres" className="input" required />
            </div>
            <div>
              <label className="block text-cinema-muted text-sm mb-1.5">Confirmar contraseña</label>
              <input type="password" value={regForm.confirmar} onChange={e => setRegForm(p => ({ ...p, confirmar: e.target.value }))} placeholder="Repite tu contraseña" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" />Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="text-center text-cinema-muted text-sm mt-4">
          ¿Prefieres explorar primero?{' '}
          <Link to="/" className="text-cinema-amber hover:underline">Ver cartelera</Link>
        </p>

        <div className="card p-4 mt-4 text-xs text-cinema-muted">
          <p className="font-semibold text-cinema-amber mb-1">Credenciales de prueba (admin):</p>
          <p>Email: <span className="font-mono text-cinema-light">admin@cine.com</span></p>
          <p>Pass:  <span className="font-mono text-cinema-light">Admin123!</span></p>
        </div>

      </div>
    </main>
  );
}
