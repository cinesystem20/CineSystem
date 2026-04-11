// src/middlewares/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'Error interno del servidor';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  // Errores de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado: ' + (err.detail || '') });
  }
  if (err.code === 'P0001') {
    // Errores de triggers (RAISE EXCEPTION)
    return res.status(409).json({ error: err.message });
  }

  res.status(statusCode).json({ error: message });
};

module.exports = { AppError, errorHandler };
