// src/controllers/auth.controller.js — MySQL
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db     = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

const register = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol = 'cliente' } = req.body;
    const hash = await bcrypt.hash(contrasena, 10);
    const id   = uuidv4();
    await db.query(
      `INSERT INTO usuarios (id, nombre, email, contrasena, rol)
       VALUES (?, ?, ?, ?, ?)`,
      [id, nombre, email, hash, rol]
    );
    const { rows } = await db.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?', [id]
    );
    const usuario = rows[0];
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.status(201).json({ data: usuario, token });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;
    const { rows } = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]
    );
    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      throw new AppError('Credenciales inválidas', 401);
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const { contrasena: _, ...data } = usuario;
    res.json({ data, token });
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    res.json({ data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { register, login, me };
