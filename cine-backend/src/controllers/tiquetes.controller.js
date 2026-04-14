// src/controllers/tiquetes.controller.js
const tiquetesService = require('../services/tiquetes.service');
const tiquetesRepo    = require('../repositories/tiquetes.repository');

const comprar = async (req, res, next) => {
  try {
    const { funcion_id, asiento_ids } = req.body;
    const usuario_id = req.user?.id || null;
    const resultado  = await tiquetesService.comprar({ funcion_id, asiento_ids, usuario_id });
    res.status(201).json({ data: resultado, message: '¡Compra exitosa!' });
  } catch (err) { next(err); }
};

const validar = async (req, res, next) => {
  try {
    const { codigo } = req.body;
    if (!codigo) {
      return res.status(400).json({ error: 'Código requerido' });
    }
    const resultado = await tiquetesService.validar(codigo.trim().toUpperCase());
    res.json(resultado);
  } catch (err) { next(err); }
};

const getByCodigo = async (req, res, next) => {
  try {
    const t = await tiquetesRepo.findByCodigo(req.params.codigo);
    if (!t) return res.status(404).json({ error: 'Tiquete no encontrado' });
    res.json({ data: t });
  } catch (err) { next(err); }
};


const getMisTiquetes = async (req, res, next) => {
  try {
    const usuario_id = req.user.id;
    const { rows } = await require('../config/db').query(
      `SELECT t.id, t.codigo, t.total, t.estado, t.fecha_compra, t.qr_url,
              f.fecha, f.hora,
              p.titulo AS pelicula_titulo, p.imagen_url, p.clasificacion,
              s.nombre AS sala_nombre,
              (SELECT GROUP_CONCAT(CONCAT(a.fila, a.columna) ORDER BY a.fila, a.columna SEPARATOR ', ')
               FROM detalle_tiquete dt
               JOIN asientos a ON a.id = dt.asiento_id
               WHERE dt.tiquete_id = t.id) AS asientos
       FROM tiquetes t
       JOIN funciones f ON f.id = t.funcion_id
       JOIN peliculas p ON p.id = f.pelicula_id
       JOIN salas s ON s.id = f.sala_id
       WHERE t.usuario_id = ?
       ORDER BY t.fecha_compra DESC`,
      [usuario_id]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
};

module.exports = { comprar, validar, getByCodigo, getMisTiquetes };

