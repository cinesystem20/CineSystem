// src/pages/AsientosPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funcionesService, tiquetesService } from '../services/api';

export default function AsientosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcion,    setFuncion]    = useState(null);
  const [asientos,   setAsientos]   = useState([]);
  const [seleccion,  setSeleccion]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [comprando,  setComprando]  = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    Promise.all([
      funcionesService.getOne(id),
      funcionesService.getAsientos(id),
    ]).then(([rf, ra]) => {
      setFuncion(rf.data.data);
      setAsientos(ra.data.data);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleAsiento = (asiento) => {
    if (asiento.estado_funcion !== 'disponible') return;
    setSeleccion(prev =>
      prev.includes(asiento.id)
        ? prev.filter(s => s !== asiento.id)
        : prev.length >= 10 ? prev : [...prev, asiento.id]
    );
  };

  const total = funcion ? seleccion.length * parseFloat(funcion.precio) : 0;

  const handleComprar = async () => {
    if (seleccion.length === 0) return;
    setComprando(true);
    setError('');
    try {
      const r = await tiquetesService.comprar({ funcion_id: id, asiento_ids: seleccion });
      navigate(`/tiquete/${r.data.data.codigo}`);
    } catch (e) {
      setError(e.message);
      setComprando(false);
    }
  };

  // Agrupar asientos por fila
  const filas = asientos.reduce((acc, a) => {
    if (!acc[a.fila]) acc[a.fila] = [];
    acc[a.fila].push(a);
    return acc;
  }, {});

  const getSeatClass = (asiento) => {
    const isSelected = seleccion.includes(asiento.id);
    const isOccupied = asiento.estado_funcion !== 'disponible';
    const isVip      = asiento.tipo === 'vip';
    if (isOccupied) return 'seat-occupied ' + (isVip ? 'seat-vip' : '');
    if (isSelected) return 'seat-selected ' + (isVip ? 'border-amber-400' : '');
    return 'seat-available ' + (isVip ? 'seat-vip border-amber-700' : '');
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-cinema-muted hover:text-cinema-amber text-sm mb-6 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      {funcion && (
        <div className="mb-8 text-center">
          <p className="text-cinema-amber font-mono text-xs tracking-widest uppercase mb-1">Selección de asientos</p>
          <h1 className="font-display text-3xl font-black text-cinema-light">{funcion.pelicula_titulo}</h1>
          <p className="text-cinema-muted mt-1">
            {new Date(funcion.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}
            {funcion.hora?.slice(0, 5)}
            {' · '}
            {funcion.sala_nombre}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300 text-center">
          {error}
        </div>
      )}

      {/* Pantalla */}
      <div className="mb-8">
        <div className="mx-auto max-w-2xl h-2 bg-gradient-to-r from-transparent via-cinema-amber/60 to-transparent rounded-full mb-1" />
        <p className="text-center text-cinema-muted text-xs tracking-widest uppercase">Pantalla</p>
      </div>

      {/* Grid de asientos */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {Object.entries(filas).map(([fila, seats]) => (
            <div key={fila} className="flex items-center gap-1 mb-1.5 justify-center">
              {/* Label de fila */}
              <span className="w-6 text-center text-cinema-muted text-xs font-mono flex-shrink-0">{fila}</span>
              {/* Asientos */}
              <div className="flex gap-1">
                {seats.map((asiento, idx) => (
                  <>
                    {/* Pasillo central */}
                    {idx === 7 && <div key="pasillo" className="w-4" />}
                    <button
                      key={asiento.id}
                      onClick={() => toggleAsiento(asiento)}
                      disabled={asiento.estado_funcion !== 'disponible'}
                      title={`${asiento.fila}${asiento.columna} · ${asiento.tipo}`}
                      className={`w-7 h-7 text-xs font-mono transition-all duration-150 ${getSeatClass(asiento)}`}
                    >
                      {seleccion.includes(asiento.id) ? '✓' : ''}
                    </button>
                  </>
                ))}
              </div>
              <span className="w-6 text-center text-cinema-muted text-xs font-mono flex-shrink-0">{fila}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 justify-center mt-6 mb-8 text-xs text-cinema-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 seat-available rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 seat-selected rounded" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 seat-occupied rounded" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 seat-available seat-vip rounded" />
          <span>VIP</span>
        </div>
      </div>

      {/* Panel de compra */}
      <div className="card p-6 max-w-md mx-auto">
        <h3 className="font-display font-bold text-lg text-cinema-light mb-4">Resumen de compra</h3>

        {seleccion.length === 0 ? (
          <p className="text-cinema-muted text-sm text-center py-2">
            Selecciona al menos un asiento
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Asientos seleccionados</span>
                <span className="text-cinema-light font-mono">{seleccion.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Precio por asiento</span>
                <span className="text-cinema-light font-mono">
                  ${funcion && parseFloat(funcion.precio).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="border-t border-cinema-border pt-2 flex justify-between font-semibold">
                <span className="text-cinema-light">Total</span>
                <span className="text-cinema-amber font-mono text-lg">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
            {/* Asientos elegidos */}
            <div className="flex flex-wrap gap-1 mb-4">
              {asientos
                .filter(a => seleccion.includes(a.id))
                .map(a => (
                  <span key={a.id} className="bg-cinema-amber/20 text-cinema-amber text-xs font-mono px-2 py-0.5 rounded">
                    {a.fila}{a.columna}
                  </span>
                ))
              }
            </div>
          </>
        )}

        <button
          onClick={handleComprar}
          disabled={seleccion.length === 0 || comprando}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {comprando ? (
            <>
              <div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            `Comprar ${seleccion.length > 0 ? seleccion.length + ' tiquete(s)' : ''}`
          )}
        </button>
      </div>
    </main>
  );
}
