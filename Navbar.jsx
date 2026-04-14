// src/services/tiquetes.service.js — MySQL
const db            = require('../config/db');
const asientosRepo  = require('../repositories/asientos.repository');
const tiquetesRepo  = require('../repositories/tiquetes.repository');
const funcionesRepo = require('../repositories/funciones.repository');
const { generarCodigo, generarQR } = require('../utils/codigo');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Compra atómica con transacción MySQL + SELECT FOR UPDATE
 * Garantiza que no haya doble venta del mismo asiento por función.
 */
const comprar = async ({ funcion_id, asiento_ids, usuario_id }) => {
  if (!asiento_ids || asiento_ids.length === 0) {
    throw new AppError('Debe seleccionar al menos un asiento', 400);
  }
  if (asiento_ids.length > 10) {
    throw new AppError('Máximo 10 asientos por compra', 400);
  }

  const conn = await db.getClient();
  try {
    await conn.beginTransaction();

    // 1. Bloquear filas para evitar race conditions
    const placeholders = asiento_ids.map(() => '?').join(',');
    const { rows: bloqueados } = await conn.query(
      `SELECT asiento_id, estado
       FROM funcion_asientos
       WHERE funcion_id = ? AND asiento_id IN (${placeholders})
       FOR UPDATE`,
      [funcion_id, ...asiento_ids]
    );

    if (bloqueados.length !== asiento_ids.length) {
      throw new AppError('Uno o más asientos no existen para esta función', 404);
    }

    const noDisponibles = bloqueados.filter(a => a.estado !== 'disponible');
    if (noDisponibles.length > 0) {
      throw new AppError('Los siguientes asientos ya no están disponibles. Por favor selecciona otros.', 409);
    }

    // 2. Verificar función disponible
    const funcion = await funcionesRepo.findById(funcion_id);
    if (!funcion || funcion.estado !== 'disponible') {
      throw new AppError('Función no disponible', 400);
    }

    const total = parseFloat(funcion.precio) * asiento_ids.length;

    // 3. Generar código único y QR
    const codigo = generarCodigo();
    const qr_url = await generarQR(codigo);

    // 4. Crear tiquete
    const tiquete = await tiquetesRepo.create(conn, {
      codigo, qr_url, usuario_id, funcion_id, total,
    });

    // 5. Crear detalles
    const detalles = asiento_ids.map(asiento_id => ({
      tiquete_id:      tiquete.id,
      asiento_id,
      funcion_id,
      precio_unitario: funcion.precio,
    }));
    await tiquetesRepo.createDetalle(conn, detalles);

    // 6. Marcar asientos como ocupados
    await asientosRepo.marcarOcupados(conn, funcion_id, asiento_ids);

    await conn.commit();
    return { ...tiquete, asientos_count: asiento_ids.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Valida un tiquete por código y lo marca como usado si está activo.
 */
const validar = async (codigo) => {
  const tiquete = await tiquetesRepo.findByCodigo(codigo);

  if (!tiquete) {
    return { valido: false, estado: 'invalido', mensaje: 'Tiquete no encontrado' };
  }
  if (tiquete.estado === 'usado') {
    return { valido: false, estado: 'usado', mensaje: 'Este tiquete ya fue utilizado', tiquete };
  }
  if (tiquete.estado === 'cancelado') {
    return { valido: false, estado: 'cancelado', mensaje: 'Tiquete cancelado', tiquete };
  }

  const actualizado = await tiquetesRepo.marcarUsado(codigo);
  return { valido: true, estado: 'valido', mensaje: '¡Bienvenido! Tiquete válido', tiquete: actualizado };
};

module.exports = { comprar, validar };
