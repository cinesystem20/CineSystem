// src/pages/CartelaPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { peliculasService } from '../services/api';

const GENEROS = ['Todos', 'Acción', 'Drama', 'Ciencia Ficción', 'Comedia', 'Terror', 'Animación'];

export default function CartelaPage() {
  const [peliculas, setPeliculas] = useState([]);
  const [filtro, setFiltro]       = useState('Todos');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    peliculasService.getAll({ estado: 'activa' })
      .then(r => setPeliculas(r.data.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = filtro === 'Todos'
    ? peliculas
    : peliculas.filter(p => p.genero.toLowerCase().includes(filtro.toLowerCase()));

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="text-cinema-amber font-mono text-sm tracking-widest mb-2 uppercase">En cartelera</p>
        <h1 className="font-display text-5xl font-black text-cinema-light mb-4">
          Películas disponibles
        </h1>
        <p className="text-cinema-muted max-w-xl mx-auto">
          Selecciona una película, elige tu función y reserva tus asientos en segundos.
        </p>
      </div>

      {/* Filtros de género */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {GENEROS.map(g => (
          <button
            key={g}
            onClick={() => setFiltro(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filtro === g
                ? 'bg-cinema-amber text-cinema-black'
                : 'bg-cinema-card border border-cinema-border text-cinema-muted hover:border-cinema-amber'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300 text-center">
          {error}
        </div>
      )}

      {/* Grid de películas */}
      {filtradas.length === 0 ? (
        <div className="text-center text-cinema-muted py-20">
          No hay películas disponibles con ese filtro.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtradas.map((p, i) => (
            <Link
              to={`/pelicula/${p.id}`}
              key={p.id}
              className="group card overflow-hidden hover:border-cinema-amber transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-cinema-dark">
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
                )}
                {/* Clasificación badge */}
                <span className="absolute top-2 right-2 bg-cinema-black/80 text-cinema-amber text-xs font-mono px-2 py-0.5 rounded">
                  {p.clasificacion}
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-display font-bold text-sm text-cinema-light line-clamp-2 mb-1">
                  {p.titulo}
                </h3>
                <p className="text-cinema-muted text-xs">{p.genero}</p>
                <p className="text-cinema-muted text-xs mt-0.5">{p.duracion} min</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
