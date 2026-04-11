// src/repositories/tiquetes.repository.js — MySQL
const db     = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findByCodigo = async (codigo) => {
  // MySQL no tiene json_agg; obtenemos el tiquete y los asientos por separado
  const { rows: tiquetes } = await db.query(
    `SELECT t.*,
            f.fecha, f.hora, f.precio AS precio_funcion,
            p.titulo AS pelicula_titulo,
            s.nombre AS sala_nombre
     FROM tiquetes t
     JOIN funciones f ON f.id = t.funcion_id
     JOIN peliculas p ON p.id = f.pelicula_id
     JOIN salas    s ON s.id  = f.sala_id
     WHERE t.codigo = ?`,
    [codigo]
  );
  if (!tiquetes.length) return null;

  const tiquete = tiquetes[0];

  // Traer asientos asociados
  const { rows: asientos } = await db.query(
    `SELECT a.fila, a.columna, a.numero
     FROM detalle_tiquete dt
     JOIN asientos a ON a.id = dt.asiento_id
     WHERE dt.tiquete_id = ?`,
    [tiquete.id]
  );
  tiquete.asientos = asientos;
  return tiquete;
};

const create = async (conn, { codigo, qr_url, usuario_id, funcion_id, total }) => {
  const id = uuidv4();
  await conn.query(
    `INSERT INTO tiquetes (id, codigo, qr_url, usuario_id, funcion_id, total)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, codigo, qr_url, usuario_id || null, funcion_id, total]
  );
  const { rows } = await conn.query('SELECT * FROM tiquetes WHERE id = ?', [id]);
  return rows[0];
};

const createDetalle = async (conn, detalles) => {
  if (!detalles.length) return;
  const values = detalles.map(() => '(UUID(), ?, ?, ?, ?)').join(',');
  const params = detalles.flatMap(d => [d.tiquete_id, d.asiento_id, d.funcion_id, d.precio_unitario]);
  await conn.query(
    `INSERT INTO detalle_tiquete (id, tiquete_id, asiento_id, funcion_id, precio_unitario) VALUES ${values}`,
    params
  );
};

const marcarUsado = async (codigo) => {
  await db.query(
    `UPDATE tiquetes SET estado = 'usado', fecha_uso = NOW()
     WHERE codigo = ? AND estado = 'activo'`,
    [codigo]
  );
  const { rows } = await db.query('SELECT * FROM tiquetes WHERE codigo = ?', [codigo]);
  return rows[0] || null;
};

const findAll = async ({ limit = 50, offset = 0 } = {}) => {
  const { rows } = await db.query(
    `SELECT t.*, p.titulo AS pelicula_titulo, f.fecha, f.hora
     FROM tiquetes t
     JOIN funciones f ON f.id = t.funcion_id
     JOIN peliculas p ON p.id = f.pelicula_id
     ORDER BY t.fecha_compra DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

module.exports = { findByCodigo, create, createDetalle, marcarUsado, findAll };
