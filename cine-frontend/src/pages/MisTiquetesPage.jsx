// src/pages/MisTiquetesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tiquetesService } from '../services/api';
import { useAuth } from '../store/AuthContext';

const ESTADO_CONFIG = {
  activo:    { label: 'Válido',     color: 'text-green-400',  bg: 'bg-green-900/20 border-green-700/50',   dot: 'bg-green-400' },
  usado:     { label: 'Utilizado',  color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700/50', dot: 'bg-yellow-400' },
  cancelado: { label: 'Cancelado',  color: 'text-red-400',    bg: 'bg-red-900/20 border-red-700/50',       dot: 'bg-red-400' },
};

const FILTROS = ['todos', 'activo', 'usado', 'cancelado'];

export default function MisTiquetesPage() {
  const { user } = useAuth();
  const [tiquetes, setTiquetes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filtro, setFiltro]     = useState('todos');

  useEffect(() => {
    tiquetesService.getMisTiquetes()
      .then(r => setTiquetes(r.data.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tiquetesFiltrados = filtro === 'todos'
    ? tiquetes
    : tiquetes.filter(t => t.estado === filtro);

  const totalGastado = tiquetes
    .filter(t => t.estado !== 'cancelado')
    .reduce((sum, t) => sum + parseFloat(t.total), 0);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <p className="text-cinema-muted">{error}</p>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 animate-slide-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-cinema-light mb-1">
          Mis Tiquetes
        </h1>
        <p className="text-cinema-muted">Historial de compras de <span className="text-cinema-amber">{user?.nombre}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card px-5 py-4 text-center">
          <p className="text-cinema-amber font-display text-3xl font-black">{tiquetes.length}</p>
          <p className="text-cinema-muted text-xs uppercase tracking-wide mt-1">Total compras</p>
        </div>
        <div className="card px-5 py-4 text-center">
          <p className="text-green-400 font-display text-3xl font-black">
            {tiquetes.filter(t => t.estado === 'activo').length}
          </p>
          <p className="text-cinema-muted text-xs uppercase tracking-wide mt-1">Tiquetes válidos</p>
        </div>
        <div className="card px-5 py-4 text-center">
          <p className="text-cinema-amber font-display text-2xl font-black font-mono">
            ${totalGastado.toLocaleString('es-CO')}
          </p>
          <p className="text-cinema-muted text-xs uppercase tracking-wide mt-1">Total gastado</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filtro === f
                ? 'bg-cinema-amber text-cinema-black'
                : 'bg-cinema-dark text-cinema-muted hover:text-cinema-light border border-cinema-border'
            }`}
          >
            {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f]?.label}
            <span className="ml-1.5 opacity-70">
              ({f === 'todos' ? tiquetes.length : tiquetes.filter(t => t.estado === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Lista de tiquetes */}
      {tiquetesFiltrados.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-5xl mb-4">🎟️</p>
          <p className="font-display text-xl text-cinema-light mb-2">
            {filtro === 'todos' ? 'Aún no tienes tiquetes' : `No tienes tiquetes "${ESTADO_CONFIG[filtro]?.label}"`}
          </p>
          <p className="text-cinema-muted mb-6">¡Compra entradas para tus películas favoritas!</p>
          <Link to="/" className="btn-primary">Ver cartelera</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tiquetesFiltrados.map(tiquete => {
            const cfg = ESTADO_CONFIG[tiquete.estado] || ESTADO_CONFIG.cancelado;
            return (
              <div key={tiquete.id} className="card overflow-hidden hover:border-cinema-amber/30 transition-colors">
                <div className="flex gap-4 p-5">

                  {/* Imagen de película */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-cinema-dark">
                    {tiquete.pelicula_imagen ? (
                      <img
                        src={tiquete.pelicula_imagen}
                        alt={tiquete.pelicula_titulo}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-cinema-light text-lg leading-tight truncate">
                        {tiquete.pelicula_titulo}
                      </h3>
                      {/* Badge estado */}
                      <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm mb-3">
                      <div>
                        <p className="text-cinema-muted text-xs">Fecha</p>
                        <p className="text-cinema-light font-medium">
                          {new Date(String(tiquete.fecha).slice(0,10) + 'T00:00:00')
                            .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-cinema-muted text-xs">Hora</p>
                        <p className="text-cinema-light font-mono">{tiquete.hora?.slice(0,5)}</p>
                      </div>
                      <div>
                        <p className="text-cinema-muted text-xs">Sala</p>
                        <p className="text-cinema-light">{tiquete.sala_nombre}</p>
                      </div>
                      <div>
                        <p className="text-cinema-muted text-xs">Total</p>
                        <p className="text-cinema-amber font-bold font-mono">
                          ${parseFloat(tiquete.total).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>

                    {/* Asientos */}
                    {Array.isArray(tiquete.asientos) && tiquete.asientos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {tiquete.asientos.map((a, i) => (
                          <span key={i} className="bg-cinema-amber/10 text-cinema-amber text-xs font-mono px-2 py-0.5 rounded">
                            {a.fila}{a.columna}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer de la tarjeta */}
                    <div className="flex items-center justify-between">
                      <p className="text-cinema-muted text-xs font-mono">
                        {tiquete.codigo}
                      </p>
                      <Link
                        to={`/tiquete/${tiquete.codigo}`}
                        className="text-cinema-amber text-xs hover:underline font-medium"
                      >
                        Ver tiquete completo →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
