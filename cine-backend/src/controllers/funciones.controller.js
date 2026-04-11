// src/controllers/funciones.controller.js
const funcionesRepo = require('../repositories/funciones.repository');
const { AppError }  = require('../middlewares/errorHandler');

const getAll = async (req, res, next) => {
  try {
    const { pelicula_id, fecha } = req.query;
    const funciones = await funcionesRepo.findAll({ pelicula_id, fecha });
    res.json({ data: funciones });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const f = await funcionesRepo.findById(req.params.id);
    if (!f) throw new AppError('Función no encontrada', 404);
    res.json({ data: f });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    // sala_id por defecto si solo hay una sala
    if (!req.body.sala_id) {
      req.body.sala_id = '00000000-0000-0000-0000-000000000001';
    }
    const f = await funcionesRepo.create(req.body);
    res.status(201).json({ data: f, message: 'Función creada exitosamente' });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const f = await funcionesRepo.update(req.params.id, req.body);
    if (!f) throw new AppError('Función no encontrada', 404);
    res.json({ data: f });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update };

// ─────────────────────────────────────────────────────────────────
// src/controllers/asientos.controller.js
// ─────────────────────────────────────────────────────────────────
// (exportado en el mismo archivo para brevedad, separar en producción)
