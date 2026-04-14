// src/repositories/asientos.repository.js — MySQL
const db = require('../config/db');

const findByFuncion = async (funcion_id) => {
  const { rows } = await db.query(
    `SELECT a.id, a.fila, a.columna, a.numero, a.tipo,
            fa.estado AS estado_funcion
     FROM funcion_asientos fa
     JOIN asientos a ON a.id = fa.asiento_id
     WHERE fa.funcion_id = ?
     ORDER BY a.fila ASC, a.columna ASC`,
    [funcion_id]
  );
  return rows;
};

const checkDisponibilidad = async (funcion_id, asiento_ids) => {
  if (!asiento_ids.length) return [];
  const placeholders = asiento_ids.map(() => '?').join(',');
  const { rows } = await db.query(
    `SELECT asiento_id, estado
     FROM funcion_asientos
     WHERE funcion_id = ? AND asiento_id IN (${placeholders})`,
    [funcion_id, ...asiento_ids]
  );
  return rows;
};

// Marcar asientos como ocupados (dentro de una transacción externa)
const marcarOcupados = async (conn, funcion_id, asiento_ids) => {
  if (!asiento_ids.length) return;
  const placeholders = asiento_ids.map(() => '?').join(',');
  await conn.query(
    `UPDATE funcion_asientos
     SET estado = 'ocupado'
     WHERE funcion_id = ? AND asiento_id IN (${placeholders}) AND estado = 'disponible'`,
    [funcion_id, ...asiento_ids]
  );
};

module.exports = { findByFuncion, checkDisponibilidad, marcarOcupados };
