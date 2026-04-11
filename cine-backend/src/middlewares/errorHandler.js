// src/middlewares/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  // Siempre loguear el error completo para poder debuggear
  console.error('[ERROR]', err.code, err.sqlMessage || err.message);

  // Error de trigger MySQL (SIGNAL SQLSTATE '45000') — traslape de horario
  if (err.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(409).json({ error: err.sqlMessage || err.message });
  }

  // Entrada duplicada MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }

  // Error operacional conocido (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error inesperado — devolver mensaje genérico pero loguear detalle
  res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = { AppError, errorHandler };
