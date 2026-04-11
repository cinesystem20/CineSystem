// src/repositories/funciones.repository.js — MySQL
const db     = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findAll = async ({ pelicula_id, fecha } = {}) => {
  let sql = `
    SELECT f.*, p.titulo AS pelicula_titulo, p.duracion AS pelicula_duracion,
           p.imagen_url, p.clasificacion, p.genero,
           s.nombre AS sala_nombre,
           (SELECT COUNT(*) FROM funcion_asientos fa
            WHERE fa.funcion_id = f.id AND fa.estado = 'disponible') AS asientos_disponibles
    FROM funciones f
    JOIN peliculas p ON p.id = f.pelicula_id
    JOIN salas s ON s.id = f.sala_id
  `;
  const params = [];
  const where  = [];
  if (pelicula_id) { where.push('f.pelicula_id = ?'); params.push(pelicula_id); }
  if (fecha)       { where.push('f.fecha = ?');        params.push(fecha); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY f.fecha ASC, f.hora ASC';
  const { rows } = await db.query(sql, params);
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT f.*, p.titulo AS pelicula_titulo, p.duracion AS pelicula_duracion,
            p.imagen_url, p.clasificacion, s.nombre AS sala_nombre
     FROM funciones f
     JOIN peliculas p ON p.id = f.pelicula_id
     JOIN salas s ON s.id = f.sala_id
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ pelicula_id, sala_id, fecha, hora, precio, estado = 'disponible' }) => {
  const conn = await db.getClient();
  try {
    await conn.beginTransaction();

    const id = uuidv4();
    // El trigger de MySQL valida traslapes automáticamente
    await conn.query(
      `INSERT INTO funciones (id, pelicula_id, sala_id, fecha, hora, precio, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, pelicula_id, sala_id, fecha, hora, precio, estado]
    );

    // Inicializar todos los asientos disponibles para esta función
    await conn.query(
      `INSERT INTO funcion_asientos (id, funcion_id, asiento_id, estado)
       SELECT UUID(), ?, a.id, 'disponible'
       FROM asientos a
       WHERE a.sala_id = ? AND a.activo = 1`,
      [id, sala_id]
    );

    await conn.commit();
    return findById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const update = async (id, fields) => {
  const allowed = ['fecha','hora','precio','estado'];
  const keys    = Object.keys(fields).filter(k => allowed.includes(k));
  if (!keys.length) return findById(id);
  const values  = keys.map(k => fields[k]);
  const set     = keys.map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE funciones SET ${set} WHERE id = ?`, [...values, id]);
  return findById(id);
};

module.exports = { findAll, findById, create, update };
