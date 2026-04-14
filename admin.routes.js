// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticación requerido', 401));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Token inválido o expirado', 401));
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return next(new AppError('Acceso denegado: se requiere rol admin', 403));
  }
  next();
};

module.exports = { authenticate, requireAdmin };
