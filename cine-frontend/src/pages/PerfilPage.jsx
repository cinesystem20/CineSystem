// src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { tiquetesService } from '../services/api';

const ESTADO_BADGE = {
  activo:    { label: 'Válido',    cls: 'bg-green-900/30 text-green-400 border-green-800' },
  usado:     { label: 'Usado',     cls: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-900/30 text-red-400 border-red-800' },
};

const formatFecha = (fecha) => {
  const soloFecha = String(fecha).slice(0, 10);
  return new Date(soloFecha + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tiquetes, setTiquetes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    tiquetesService.getMisTiquetes()
      .then(r => setTiquetes(r.data.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Agrupar en próximos y pasados
  const hoy = new Date().toISOString().slice(0, 10);
  const proximos = tiquetes.filter(t => t.estado !== 'cancelado' && String(t.fecha).slice(0, 10) >= hoy);
  const pasados  = tiquetes.filter(t => t.estado === 'cancelado' || String(t.fecha).slice(0, 10) < hoy);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">

      {/* Header perfil */}
      <div className="card p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-cinema-amber/20 flex items-center justify-center flex-shrink-0">
          <span className="text-cinema-amber font-black text-2xl">
            {user?.nombre?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-black text-cinema-light truncate">{user?.nombre}</h1>
          <p className="text-cinema-muted text-sm">{user?.email}</p>
          <span className={`inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded ${
            user?.rol === 'admin'
              ? 'bg-cinema-amber/20 text-cinema-amber'
              : 'bg-cinema-border text-cinema-muted'
          }`}>{user?.rol}</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-sm py-1.5 px-4 flex-shrink-0">
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total compras',  value: tiquetes.length },
          { label: 'Próximas',       value: proximos.length },
          { label: 'Historial',      value: pasados.length },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-3xl font-black text-cinema-amber">{value}</p>
            <p className="text-cinema-muted text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-300 text-sm text-center mb-6">
          {error}
        </div>
      )}

      {!loading && tiquetes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎟️</p>
          <h2 className="font-display text-xl font-bold text-cinema-light mb-2">Sin tiquetes aún</h2>
          <p className="text-cinema-muted text-sm mb-6">Compra tu primer tiquete y aparecerá aquí</p>
          <Link to="/" className="btn-primary">Ver cartelera</Link>
        </div>
      )}

      {/* Próximas funciones */}
      {proximos.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-cinema-light mb-4">
            🎬 Próximas funciones
          </h2>
          <div className="space-y-3">
            {proximos.map(t => <TarjetaTiquete key={t.id} tiquete={t} />)}
          </div>
        </section>
      )}

      {/* Historial */}
      {pasados.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-cinema-light mb-4">
            📋 Historial
          </h2>
          <div className="space-y-3">
            {pasados.map(t => <TarjetaTiquete key={t.id} tiquete={t} dimmed />)}
          </div>
        </section>
      )}

    </main>
  );
}

function TarjetaTiquete({ tiquete: t, dimmed }) {
  const badge = ESTADO_BADGE[t.estado] || ESTADO_BADGE.cancelado;

  return (
    <Link
      to={`/tiquete/${t.codigo}`}
      className={`card p-4 flex items-center gap-4 hover:border-cinema-amber/40 transition-colors group ${dimmed ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      {/* Póster */}
      {t.imagen_url
        ? <img src={t.imagen_url} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
        : <div className="w-10 h-14 bg-cinema-dark rounded flex-shrink-0 flex items-center justify-center text-xl">🎬</div>
      }

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-cinema-light font-semibold truncate group-hover:text-cinema-amber transition-colors">
          {t.pelicula_titulo}
        </p>
        <p className="text-cinema-muted text-xs mt-0.5">
          {formatFecha(t.fecha)} · {t.hora?.slice(0, 5)} · {t.sala_nombre}
        </p>
        {t.asientos && (
          <p className="text-cinema-muted text-xs mt-0.5">
            Asientos: <span className="font-mono text-cinema-light">{t.asientos}</span>
          </p>
        )}
      </div>

      {/* Derecha */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="text-cinema-amber font-bold font-mono text-sm">
          ${parseFloat(t.total).toLocaleString('es-CO')}
        </span>
      </div>
    </Link>
  );
}
