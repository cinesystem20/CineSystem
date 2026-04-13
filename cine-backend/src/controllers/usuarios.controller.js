// src/controllers/usuarios.controller.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

// GET /api/usuarios — listar todos
const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, email, rol, activo, created_at
       FROM usuarios
       ORDER BY created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
};

// POST /api/usuarios — crear cuenta nueva
const create = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol = 'cliente' } = req.body;

    if (!nombre || !email || !contrasena) {
      throw new AppError('nombre, email y contrasena son requeridos', 400);
    }
    if (!['admin', 'cliente'].includes(rol)) {
      throw new AppError('rol debe ser "admin" o "cliente"', 400);
    }

    // Verificar si el email ya existe
    const { rows: existe } = await db.query(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    );
    if (existe.length > 0) {
      throw new AppError('Ya existe un usuario con ese email', 409);
    }

    const id   = uuidv4();
    const hash = await bcrypt.hash(contrasena, 10);

    await db.query(
      `INSERT INTO usuarios (id, nombre, email, contrasena, rol)
       VALUES (?, ?, ?, ?, ?)`,
      [id, nombre, email, hash, rol]
    );

    const { rows } = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) { next(err); }
};

// PATCH /api/usuarios/:id/activo — activar o desactivar cuenta
const toggleActivo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No se puede desactivar a sí mismo
    if (id === req.user.id) {
      throw new AppError('No puedes desactivar tu propia cuenta', 400);
    }

    const { rows } = await db.query(
      'SELECT id, activo FROM usuarios WHERE id = ?', [id]
    );
    if (rows.length === 0) throw new AppError('Usuario no encontrado', 404);

    const nuevoEstado = rows[0].activo ? 0 : 1;
    await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    res.json({ data: { id, activo: nuevoEstado } });
  } catch (err) { next(err); }
};

// PATCH /api/usuarios/:id/rol — cambiar rol (cliente ↔ admin)
const cambiarRol = async (req, res, next) => {
  try {
    const { id }  = req.params;
    const { rol } = req.body;

    if (!['admin', 'cliente'].includes(rol)) {
      throw new AppError('rol debe ser "admin" o "cliente"', 400);
    }

    // No se puede cambiar su propio rol
    if (id === req.user.id) {
      throw new AppError('No puedes cambiar tu propio rol', 400);
    }

    const { rows } = await db.query(
      'SELECT id FROM usuarios WHERE id = ?', [id]
    );
    if (rows.length === 0) throw new AppError('Usuario no encontrado', 404);

    await db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);

    res.json({ data: { id, rol } });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, toggleActivo, cambiarRol };
