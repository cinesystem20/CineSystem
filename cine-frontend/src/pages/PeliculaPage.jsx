// src/pages/PeliculaPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { peliculasService, funcionesService } from '../services/api';

const formatFecha = (fecha) => {
  const soloFecha = String(fecha).slice(0, 10);
  return new Date(soloFecha + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatHora = (hora) => hora?.slice(0, 5);

export default function PeliculaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pelicula,  setPelicula]  = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      peliculasService.getOne(id),
      funcionesService.getAll({ pelicula_id: id }),
    ]).then(([rp, rf]) => {
      setPelicula(rp.data.data);
      setFunciones(rf.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!pelicula) return <div className="text-center py-20 text-cinema-muted">Película no encontrada.</div>;

  // Agrupar funciones por fecha
  const porFecha = funciones.reduce((acc, f) => {
    const key = f.fecha;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-cinema-muted hover:text-cinema-amber text-sm mb-6 flex items-center gap-1 transition-colors">
        ← Volver a cartelera
      </button>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        {/* Poster */}
        <div className="rounded-xl overflow-hidden aspect-[2/3] bg-cinema-card border border-cinema-border">
          {pelicula.imagen_url
            ? <img src={pelicula.imagen_url} alt={pelicula.titulo} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-7xl">🎬</div>
          }
        </div>

        {/* Info + Funciones */}
        <div>
          <div className="mb-6">
            <span className="text-cinema-amber font-mono text-xs tracking-widest uppercase">{pelicula.genero}</span>
            <h1 className="font-display text-4xl font-black text-cinema-light mt-1 mb-2">{pelicula.titulo}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-cinema-muted mb-4">
              <span className="bg-cinema-card border border-cinema-border px-2 py-0.5 rounded font-mono">
                {pelicula.clasificacion}
              </span>
              <span>{pelicula.duracion} min</span>
            </div>
            <p className="text-cinema-muted leading-relaxed">{pelicula.descripcion}</p>
            {pelicula.trailer_url && (
              <a
                href={pelicula.trailer_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-cinema-amber hover:underline text-sm"
              >
                ▶ Ver tráiler
              </a>
            )}
          </div>

          {/* Selección de funciones */}
          <div>
            <h2 className="font-display text-xl font-bold text-cinema-light mb-4">Funciones disponibles</h2>
            {Object.keys(porFecha).length === 0 ? (
              <p className="text-cinema-muted">No hay funciones programadas para esta película.</p>
            ) : (
              Object.entries(porFecha).map(([fecha, fns]) => (
                <div key={fecha} className="mb-6">
                  <p className="text-cinema-muted text-sm capitalize mb-2">{formatFecha(fecha)}</p>
                  <div className="flex flex-wrap gap-3">
                    {fns.map(f => (
                      <button
                        key={f.id}
                        onClick={() => navigate(`/funcion/${f.id}/asientos`)}
                        disabled={f.estado !== 'disponible'}
                        className={`card px-4 py-3 text-left transition-all hover:border-cinema-amber group ${
                          f.estado !== 'disponible' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <p className="font-mono font-bold text-cinema-amber text-lg">{formatHora(f.hora)}</p>
                        <p className="text-cinema-muted text-xs">{f.sala_nombre}</p>
                        <p className="text-cinema-light text-sm font-medium mt-1">
                          ${parseFloat(f.precio).toLocaleString('es-CO')}
                        </p>
                        <p className="text-xs text-cinema-muted mt-0.5">
                          {f.asientos_disponibles} disponibles
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
