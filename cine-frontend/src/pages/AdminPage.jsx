// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { adminService, peliculasService, funcionesService } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Sub-componentes ────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-cinema-muted text-sm">{label}</p>
        <p className="font-display text-3xl font-black text-cinema-light mt-1">{value}</p>
        {sub && <p className="text-cinema-muted text-xs mt-1">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const GENEROS    = ['Acción', 'Drama', 'Comedia', 'Ciencia Ficción', 'Terror', 'Animación', 'Historia'];
const CLASIFS    = ['G', 'PG', 'PG-13', 'R', '+13', '+18'];
const SALA_ID    = '00000000-0000-0000-0000-000000000001';

// ── Formulario de película ────────────────────────────────────
const PeliculaForm = ({ inicial, onGuardar, onCancelar }) => {
  const [form, setForm] = useState(inicial || {
    titulo: '', descripcion: '', duracion: '', genero: 'Acción',
    clasificacion: 'PG-13', imagen_url: '', trailer_url: '', estado: 'activa',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await onGuardar({ ...form, duracion: parseInt(form.duracion) });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-6 animate-slide-up">
      <h3 className="font-display text-lg font-bold text-cinema-light">
        {inicial ? 'Editar película' : 'Nueva película'}
      </h3>
      {error && <div className="bg-red-900/20 border border-red-700 rounded p-3 text-red-300 text-sm">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-cinema-muted text-xs mb-1">Título *</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} className="input" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-cinema-muted text-xs mb-1">Descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            className="input resize-none h-20" />
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Duración (min) *</label>
          <input type="number" value={form.duracion} onChange={e => set('duracion', e.target.value)}
            className="input" required min="1" />
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Género</label>
          <select value={form.genero} onChange={e => set('genero', e.target.value)} className="input">
            {GENEROS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Clasificación</label>
          <select value={form.clasificacion} onChange={e => set('clasificacion', e.target.value)} className="input">
            {CLASIFS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)} className="input">
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-cinema-muted text-xs mb-1">URL Imagen (poster)</label>
          <input value={form.imagen_url} onChange={e => set('imagen_url', e.target.value)} className="input" placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-cinema-muted text-xs mb-1">URL Tráiler</label>
          <input value={form.trailer_url} onChange={e => set('trailer_url', e.target.value)} className="input" placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-40">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
};

// ── Formulario de función ─────────────────────────────────────
const FuncionForm = ({ peliculas, onGuardar, onCancelar }) => {
  const [form, setForm] = useState({
    pelicula_id: peliculas[0]?.id || '', sala_id: SALA_ID,
    fecha: '', hora: '', precio: '', estado: 'disponible',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await onGuardar({ ...form, precio: parseFloat(form.precio) });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-6 animate-slide-up">
      <h3 className="font-display text-lg font-bold text-cinema-light">Nueva función</h3>
      {error && <div className="bg-red-900/20 border border-red-700 rounded p-3 text-red-300 text-sm">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-cinema-muted text-xs mb-1">Película *</label>
          <select value={form.pelicula_id} onChange={e => set('pelicula_id', e.target.value)} className="input" required>
            {peliculas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Fecha *</label>
          <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Hora *</label>
          <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Precio (COP) *</label>
          <input type="number" value={form.precio} onChange={e => set('precio', e.target.value)}
            className="input" required min="0" step="500" placeholder="18000" />
        </div>
        <div>
          <label className="block text-cinema-muted text-xs mb-1">Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)} className="input">
            <option value="disponible">Disponible</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-40">
          {loading ? 'Creando...' : 'Crear función'}
        </button>
        <button type="button" onClick={onCancelar} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
};

// ── Página principal ──────────────────────────────────────────
const TABS = ['Dashboard', 'Películas', 'Funciones'];

export default function AdminPage() {
  const [tab,       setTab]       = useState('Dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showPelForm, setShowPelForm] = useState(false);
  const [showFunForm, setShowFunForm] = useState(false);
  const [editando,    setEditando]    = useState(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      adminService.getDashboard(),
      peliculasService.getAll(),
      funcionesService.getAll(),
    ]).then(([rd, rp, rf]) => {
      setDashboard(rd.data.data);
      setPeliculas(rp.data.data);
      setFunciones(rf.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const guardarPelicula = async (data) => {
    if (editando) {
      await peliculasService.update(editando.id, data);
    } else {
      await peliculasService.create(data);
    }
    setShowPelForm(false); setEditando(null);
    cargar();
  };

  const eliminarPelicula = async (id) => {
    if (!confirm('¿Eliminar esta película?')) return;
    await peliculasService.remove(id);
    cargar();
  };

  const guardarFuncion = async (data) => {
    await funcionesService.create(data);
    setShowFunForm(false);
    cargar();
  };

  if (loading && !dashboard) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = dashboard;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <p className="text-cinema-amber font-mono text-xs tracking-widest uppercase mb-1">Administración</p>
        <h1 className="font-display text-4xl font-black text-cinema-light">Panel de Control</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-cinema-card rounded-xl p-1 border border-cinema-border w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-cinema-amber text-cinema-black'
                : 'text-cinema-muted hover:text-cinema-light'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB: DASHBOARD ── */}
      {tab === 'Dashboard' && d && (
        <div className="space-y-8 animate-fade-in">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🎟️" label="Total tiquetes"   value={d.resumen.total_tiquetes} />
            <StatCard icon="💰" label="Ingresos totales" value={`$${parseInt(d.resumen.ingresos_totales).toLocaleString('es-CO')}`} />
            <StatCard icon="📅" label="Ingresos hoy"     value={`$${parseInt(d.resumen.ingresos_hoy).toLocaleString('es-CO')}`} />
            <StatCard icon="🎬" label="Películas activas" value={peliculas.filter(p => p.estado === 'activa').length} />
          </div>

          {/* Gráfico de ventas */}
          {d.ventas_por_dia?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-cinema-light mb-4">Ventas últimos 7 días</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d.ventas_por_dia} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
                  <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8 }}
                    labelStyle={{ color: '#e5e7eb' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Ocupación por función */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-cinema-light mb-4">Ocupación — próximas funciones</h2>
            {d.ocupacion_funciones?.length === 0 ? (
              <p className="text-cinema-muted text-sm">No hay funciones próximas.</p>
            ) : (
              <div className="space-y-3">
                {d.ocupacion_funciones?.map(f => (
                  <div key={f.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-cinema-light text-sm font-medium truncate">{f.pelicula}</p>
                      <p className="text-cinema-muted text-xs">{f.fecha} · {f.hora?.slice(0,5)}</p>
                    </div>
                    <div className="flex items-center gap-2 w-48">
                      <div className="flex-1 bg-cinema-dark rounded-full h-2">
                        <div
                          className="bg-cinema-amber h-2 rounded-full transition-all"
                          style={{ width: `${f.porcentaje || 0}%` }}
                        />
                      </div>
                      <span className="text-cinema-muted text-xs font-mono w-10 text-right">
                        {f.porcentaje || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top películas */}
          {d.top_peliculas?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-cinema-light mb-4">Top películas</h2>
              <div className="space-y-3">
                {d.top_peliculas.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-cinema-amber font-mono font-bold text-lg w-6">{i + 1}</span>
                    {p.imagen_url && (
                      <img src={p.imagen_url} alt="" className="w-8 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="text-cinema-light text-sm font-medium">{p.titulo}</p>
                      <p className="text-cinema-muted text-xs">{p.total_tiquetes} tiquetes</p>
                    </div>
                    <span className="text-cinema-amber font-mono text-sm">
                      ${parseInt(p.ingresos).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PELÍCULAS ── */}
      {tab === 'Películas' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-bold text-cinema-light">Películas</h2>
            <button onClick={() => { setShowPelForm(true); setEditando(null); }} className="btn-primary text-sm">
              + Nueva película
            </button>
          </div>

          {(showPelForm || editando) && (
            <PeliculaForm
              inicial={editando}
              onGuardar={guardarPelicula}
              onCancelar={() => { setShowPelForm(false); setEditando(null); }}
            />
          )}

          <div className="space-y-3">
            {peliculas.map(p => (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                {p.imagen_url
                  ? <img src={p.imagen_url} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  : <div className="w-10 h-14 bg-cinema-dark rounded flex-shrink-0 flex items-center justify-center text-xl">🎬</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-cinema-light font-semibold truncate">{p.titulo}</p>
                  <p className="text-cinema-muted text-xs">{p.genero} · {p.duracion} min · {p.clasificacion}</p>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${p.estado === 'activa' ? 'bg-green-900/30 text-green-400' : 'bg-cinema-border text-cinema-muted'}`}>
                  {p.estado}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditando(p); setShowPelForm(false); }}
                    className="text-cinema-muted hover:text-cinema-amber text-sm transition-colors"
                  >Editar</button>
                  <button
                    onClick={() => eliminarPelicula(p.id)}
                    className="text-cinema-muted hover:text-red-400 text-sm transition-colors"
                  >Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: FUNCIONES ── */}
      {tab === 'Funciones' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-bold text-cinema-light">Funciones</h2>
            <button onClick={() => setShowFunForm(true)} className="btn-primary text-sm">
              + Nueva función
            </button>
          </div>

          {showFunForm && (
            <FuncionForm
              peliculas={peliculas.filter(p => p.estado === 'activa')}
              onGuardar={guardarFuncion}
              onCancelar={() => setShowFunForm(false)}
            />
          )}

          <div className="space-y-3">
            {funciones.length === 0 && <p className="text-cinema-muted text-sm">No hay funciones creadas.</p>}
            {funciones.map(f => (
              <div key={f.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-cinema-light font-semibold truncate">{f.pelicula_titulo}</p>
                  <p className="text-cinema-muted text-xs">
                    {new Date(f.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}{f.hora?.slice(0, 5)}
                    {' · '}{f.sala_nombre}
                  </p>
                </div>
                <span className="text-cinema-amber font-mono text-sm font-bold">
                  ${parseFloat(f.precio).toLocaleString('es-CO')}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  f.estado === 'disponible' ? 'bg-green-900/30 text-green-400' :
                  f.estado === 'cancelada'  ? 'bg-red-900/30 text-red-400'    :
                  'bg-cinema-border text-cinema-muted'
                }`}>{f.estado}</span>
                <span className="text-cinema-muted text-xs">
                  {f.asientos_disponibles} disponibles
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
