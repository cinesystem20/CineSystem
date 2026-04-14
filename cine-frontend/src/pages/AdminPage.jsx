// src/pages/TiquetePage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tiquetesService } from '../services/api';

const ESTADO_CONFIG = {
  activo:    { label: 'Tiquete Válido',    color: 'text-green-400',  bg: 'bg-green-900/20 border-green-700',  icon: '✅' },
  usado:     { label: 'Ya Utilizado',      color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700', icon: '⚠️' },
  cancelado: { label: 'Tiquete Cancelado', color: 'text-red-400',    bg: 'bg-red-900/20 border-red-700',      icon: '❌' },
};

export default function TiquetePage() {
  const { codigo } = useParams();
  const [tiquete, setTiquete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    tiquetesService.getOne(codigo)
      .then(r => setTiquete(r.data.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [codigo]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !tiquete) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🎟️</p>
      <h2 className="font-display text-2xl font-bold text-cinema-light mb-2">Tiquete no encontrado</h2>
      <p className="text-cinema-muted mb-6">{error || 'El código ingresado no es válido.'}</p>
      <Link to="/" className="btn-primary">Volver a cartelera</Link>
    </div>
  );

  const cfg = ESTADO_CONFIG[tiquete.estado] || ESTADO_CONFIG.cancelado;

  return (
    <main className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
      {/* Estado del tiquete */}
      <div className={`rounded-xl border p-4 mb-6 text-center ${cfg.bg}`}>
        <span className="text-3xl">{cfg.icon}</span>
        <p className={`font-bold mt-1 ${cfg.color}`}>{cfg.label}</p>
      </div>

      {/* Tarjeta del tiquete */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cinema-amber/20 to-cinema-gold/10 border-b border-cinema-border px-6 py-4">
          <p className="text-cinema-amber font-mono text-xs tracking-widest uppercase mb-1">🎬 CineSystem</p>
          <h1 className="font-display text-2xl font-black text-cinema-light">{tiquete.pelicula_titulo}</h1>
        </div>

        {/* Detalles */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm border-b border-cinema-border">
          <div>
            <p className="text-cinema-muted text-xs uppercase tracking-wide mb-0.5">Fecha</p>
            <p className="text-cinema-light font-medium">
              {new Date(String(tiquete.fecha).slice(0,10) + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div>
            <p className="text-cinema-muted text-xs uppercase tracking-wide mb-0.5">Hora</p>
            <p className="text-cinema-light font-medium font-mono">{tiquete.hora?.slice(0, 5)}</p>
          </div>
          <div>
            <p className="text-cinema-muted text-xs uppercase tracking-wide mb-0.5">Sala</p>
            <p className="text-cinema-light font-medium">{tiquete.sala_nombre}</p>
          </div>
          <div>
            <p className="text-cinema-muted text-xs uppercase tracking-wide mb-0.5">Total pagado</p>
            <p className="text-cinema-amber font-bold font-mono">
              ${parseFloat(tiquete.total).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Asientos */}
        <div className="px-6 py-4 border-b border-cinema-border">
          <p className="text-cinema-muted text-xs uppercase tracking-wide mb-2">Asientos</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tiquete.asientos) && tiquete.asientos.map((a, i) => (
              <span key={i} className="bg-cinema-amber/20 text-cinema-amber font-mono text-sm px-3 py-1 rounded-lg">
                {a.fila}{a.columna} — F{a.numero}
              </span>
            ))}
          </div>
        </div>

        {/* QR */}
        {tiquete.qr_url && (
          <div className="px-6 py-5 flex flex-col items-center">
            <p className="text-cinema-muted text-xs uppercase tracking-wide mb-3">Código QR</p>
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <img src={tiquete.qr_url} alt="QR Tiquete" className="w-44 h-44" />
            </div>
            <p className="text-cinema-muted font-mono text-sm mt-3 tracking-widest">{tiquete.codigo}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-cinema-dark px-6 py-3 flex justify-between items-center">
          <p className="text-cinema-muted text-xs">
            Comprado: {new Date(tiquete.fecha_compra).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link to="/" className="btn-ghost flex-1 text-center text-sm">
          Ir a cartelera
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary flex-1 text-sm"
        >
          Imprimir tiquete
        </button>
      </div>
    </main>
  );
}
