// src/repositories/peliculas.repository.js — MySQL
const db = require('../config/db');

const findAll = async ({ estado } = {}) => {
  let sql = 'SELECT * FROM peliculas';
  const params = [];
  if (estado) {
    sql += ' WHERE estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY created_at DESC';
  const { rows } = await db.query(sql, params);
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM peliculas WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async ({ titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url, estado = 'activa' }) => {
  const id = require('uuid').v4();
  await db.query(
    `INSERT INTO peliculas (id, titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url, estado]
  );
  return findById(id);
};

const update = async (id, fields) => {
  const allowed = ['titulo','descripcion','duracion','genero','clasificacion','imagen_url','trailer_url','estado'];
  const keys    = Object.keys(fields).filter(k => allowed.includes(k));
  if (!keys.length) return findById(id);
  const values  = keys.map(k => fields[k]);
  const set     = keys.map(k => `${k} = ?`).join(', ');
  await db.query(
    `UPDATE peliculas SET ${set} WHERE id = ?`,
    [...values, id]
  );
  return findById(id);
};

const remove = async (id) => {
  const { rowCount } = await db.query('DELETE FROM peliculas WHERE id = ?', [id]);
  return rowCount > 0;
};

module.exports = { findAll, findById, create, update, remove };
