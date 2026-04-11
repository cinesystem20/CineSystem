// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-cinema-black/95 backdrop-blur border-b border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="font-display font-bold text-xl text-cinema-amber tracking-wide">
            CineSystem
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-cinema-muted hover:text-cinema-amber transition-colors">
            Cartelera
          </Link>
          <Link to="/validar" className="text-cinema-muted hover:text-cinema-amber transition-colors">
            Validar Tiquete
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-cinema-muted hover:text-cinema-amber transition-colors">
              Panel Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-cinema-muted">{user.nombre}</span>
              <button onClick={handleLogout} className="btn-ghost text-sm py-1.5 px-4">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-1.5">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
