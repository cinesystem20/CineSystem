// src/controllers/peliculas.controller.js
const peliculasRepo = require('../repositories/peliculas.repository');
const { AppError } = require('../middlewares/errorHandler');

const getAll = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const peliculas = await peliculasRepo.findAll({ estado });
    res.json({ data: peliculas, total: peliculas.length });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const p = await peliculasRepo.findById(req.params.id);
    if (!p) throw new AppError('Película no encontrada', 404);
    res.json({ data: p });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const p = await peliculasRepo.create(req.body);
    res.status(201).json({ data: p, message: 'Película creada exitosamente' });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const p = await peliculasRepo.update(req.params.id, req.body);
    if (!p) throw new AppError('Película no encontrada', 404);
    res.json({ data: p, message: 'Película actualizada' });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const ok = await peliculasRepo.remove(req.params.id);
    if (!ok) throw new AppError('Película no encontrada', 404);
    res.json({ message: 'Película eliminada' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
