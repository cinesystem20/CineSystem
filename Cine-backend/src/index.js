// src/index.js
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const { initDb } = require('./config/initDb');

const peliculasRoutes = require('./routes/peliculas.routes');
const funcionesRoutes = require('./routes/funciones.routes');
const asientosRoutes  = require('./routes/asientos.routes');
const tiquetesRoutes  = require('./routes/tiquetes.routes');
const authRoutes      = require('./routes/auth.routes');
const adminRoutes     = require('./routes/admin.routes');
const usuariosRoutes  = require('./routes/usuarios.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middlewares globales ──────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rutas ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/asientos',  asientosRoutes);
app.use('/api/tiquetes',  tiquetesRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/usuarios',  usuariosRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Manejador de errores global ───────────────────────────────
app.use(errorHandler);

// Inicializar BD (solo si está vacía) y luego arrancar
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🎬 Cinema API corriendo en http://localhost:${PORT}`);
  });
});

module.exports = app;
