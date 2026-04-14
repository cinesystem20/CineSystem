// src/controllers/admin.controller.js — MySQL
const db = require('../config/db');

const getDashboard = async (req, res, next) => {
  try {
    // Resumen general
    const { rows: ventas } = await db.query(`
      SELECT
        COUNT(*)                                                      AS total_tiquetes,
        COALESCE(SUM(total), 0)                                       AS ingresos_totales,
        COALESCE(SUM(CASE WHEN fecha_compra >= NOW() - INTERVAL 1 DAY
                          THEN total END), 0)                         AS ingresos_hoy
      FROM tiquetes
      WHERE estado != 'cancelado'
    `);

    // Ventas por día (últimos 7 días)
    const { rows: ventas_por_dia } = await db.query(`
      SELECT
        DATE(fecha_compra)        AS fecha,
        COUNT(*)                  AS cantidad,
        COALESCE(SUM(total), 0)   AS total
      FROM tiquetes
      WHERE estado != 'cancelado'
        AND fecha_compra >= NOW() - INTERVAL 7 DAY
      GROUP BY DATE(fecha_compra)
      ORDER BY fecha ASC
    `);

    // Ocupación por función
    const { rows: ocupacion } = await db.query(`
      SELECT
        f.id,
        p.titulo                                              AS pelicula,
        f.fecha,
        f.hora,
        COUNT(fa.asiento_id)                                  AS total_asientos,
        SUM(fa.estado = 'ocupado')                            AS ocupados,
        ROUND(SUM(fa.estado = 'ocupado') * 100.0
              / NULLIF(COUNT(fa.asiento_id), 0), 1)           AS porcentaje
      FROM funciones f
      JOIN peliculas p   ON p.id = f.pelicula_id
      LEFT JOIN funcion_asientos fa ON fa.funcion_id = f.id
      WHERE f.fecha >= CURDATE()
        AND f.estado = 'disponible'
      GROUP BY f.id, p.titulo, f.fecha, f.hora
      ORDER BY f.fecha ASC, f.hora ASC
      LIMIT 10
    `);

    // Películas más vistas
    const { rows: top_peliculas } = await db.query(`
      SELECT
        p.titulo,
        p.imagen_url,
        COUNT(DISTINCT t.id)      AS total_tiquetes,
        COALESCE(SUM(t.total), 0) AS ingresos
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      WHERE t.estado != 'cancelado'
      GROUP BY p.id, p.titulo, p.imagen_url
      ORDER BY total_tiquetes DESC
      LIMIT 5
    `);

    res.json({
      data: {
        resumen:             ventas[0],
        ventas_por_dia,
        ocupacion_funciones: ocupacion,
        top_peliculas,
      },
    });
  } catch (err) { next(err); }
};


const getTiquetes = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT t.id, t.codigo, t.total, t.estado, t.fecha_compra, t.qr_url,
             f.fecha, f.hora,
             p.titulo AS pelicula_titulo,
             s.nombre AS sala_nombre,
             u.nombre AS usuario_nombre, u.email AS usuario_email,
             (SELECT GROUP_CONCAT(CONCAT(a.fila, a.columna) ORDER BY a.fila, a.columna SEPARATOR ', ')
              FROM detalle_tiquete dt
              JOIN asientos a ON a.id = dt.asiento_id
              WHERE dt.tiquete_id = t.id) AS asientos
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      JOIN salas s ON s.id = f.sala_id
      LEFT JOIN usuarios u ON u.id = t.usuario_id
      ORDER BY t.fecha_compra DESC
      LIMIT 200
    `);
    res.json({ data: rows });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getTiquetes };

