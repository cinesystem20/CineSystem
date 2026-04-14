// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 15000,
});

// Interceptor de respuesta: manejo de errores global
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || 'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Servicios específicos ──────────────────────────────────────
export const peliculasService = {
  getAll:  (params) => api.get('/peliculas', { params }),
  getOne:  (id)     => api.get(`/peliculas/${id}`),
  create:  (data)   => api.post('/peliculas', data),
  update:  (id, d)  => api.put(`/peliculas/${id}`, d),
  remove:  (id)     => api.delete(`/peliculas/${id}`),
};

export const funcionesService = {
  getAll:    (params) => api.get('/funciones', { params }),
  getOne:    (id)     => api.get(`/funciones/${id}`),
  create:    (data)   => api.post('/funciones', data),
  getAsientos: (id)   => api.get(`/asientos/funciones/${id}/asientos`),
};

export const tiquetesService = {
  comprar:       (data)   => api.post('/tiquetes', data),
  validar:       (codigo) => api.post('/tiquetes/validar', { codigo }),
  getOne:        (codigo) => api.get(`/tiquetes/${codigo}`),
  getMisTiquetes: ()      => api.get('/tiquetes/mis-tiquetes'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
};

export const usuariosService = {
  getAll:       ()           => api.get('/usuarios'),
  create:       (data)       => api.post('/usuarios', data),
  toggleActivo: (id)         => api.patch(`/usuarios/${id}/activo`),
  cambiarRol:   (id, rol)    => api.patch(`/usuarios/${id}/rol`, { rol }),
};
