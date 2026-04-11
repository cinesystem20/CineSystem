// src/pages/ValidarPage.jsx
import { useState } from 'react';
import { tiquetesService } from '../services/api';

const RESULTADO_CONFIG = {
  valido:    { icon: '✅', bg: 'bg-green-900/30 border-green-600',   title: '¡Tiquete Válido!',    color: 'text-green-400' },
  usado:     { icon: '⚠️', bg: 'bg-yellow-900/30 border-yellow-600', title: 'Tiquete Ya Usado',    color: 'text-yellow-400' },
  invalido:  { icon: '❌', bg: 'bg-red-900/30 border-red-600',       title: 'Tiquete Inválido',    color: 'text-red-400' },
  cancelado: { icon: '🚫', bg: 'bg-red-900/30 border-red-600',       title: 'Tiquete Cancelado',   color: 'text-red-400' },
};

export default function ValidarPage() {
  const [codigo,    setCodigo]    = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const validar = async (e) => {
    e?.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setResultado(null);
    try {
      const r = await tiquetesService.validar(codigo.trim().toUpperCase());
      setResultado(r.data);
    } catch (err) {
      setResultado({ valido: false, estado: 'invalido', mensaje: err.message });
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => { setCodigo(''); setResultado(null); };

  const cfg = resultado ? (RESULTADO_CONFIG[resultado.estado] || RESULTADO_CONFIG.invalido) : null;

  return (
    <main className="max-w-lg mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-10">
        <p className="text-cinema-amber font-mono text-sm tracking-widest uppercase mb-2">Control de acceso</p>
        <h1 className="font-display text-4xl font-black text-cinema-light">Validar Tiquete</h1>
        <p className="text-cinema-muted mt-2">Ingresa el código del tiquete para verificar su validez.</p>
      </div>

      {/* Formulario */}
      <form onSubmit={validar} className="card p-6 mb-6">
        <label className="block text-cinema-muted text-sm mb-2">Código del tiquete</label>
        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value.toUpperCase())}
          placeholder="CIN-XXXX-XXXX-XXXX"
          className="input font-mono text-lg text-center tracking-widest mb-4"
          autoFocus
        />
        <button
          type="submit"
          disabled={!codigo.trim() || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" /> Validando...</>
          ) : 'Verificar Tiquete'}
        </button>
      </form>

      {/* Resultado */}
      {resultado && cfg && (
        <div className={`rounded-xl border p-6 animate-slide-up ${cfg.bg}`}>
          <div className="text-center mb-4">
            <span className="text-5xl">{cfg.icon}</span>
            <h2 className={`font-display text-2xl font-bold mt-2 ${cfg.color}`}>{cfg.title}</h2>
            <p className="text-cinema-muted mt-1">{resultado.mensaje}</p>
          </div>

          {resultado.tiquete && (
            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span className="text-cinema-muted">Película</span>
                <span className="text-cinema-light font-medium">{resultado.tiquete.pelicula_titulo || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cinema-muted">Código</span>
                <span className="text-cinema-light font-mono">{resultado.tiquete.codigo}</span>
              </div>
              {resultado.tiquete.fecha_uso && (
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Usado el</span>
                  <span className="text-cinema-light">{new Date(resultado.tiquete.fecha_uso).toLocaleString('es-CO')}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={limpiar}
            className="btn-ghost w-full mt-4 text-sm"
          >
            Validar otro tiquete
          </button>
        </div>
      )}
    </main>
  );
}
