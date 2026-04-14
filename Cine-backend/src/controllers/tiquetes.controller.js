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
    const usuario_id = req.user?.id;
    if (!usuario_id) {
      return res.status(401).json({ error: 'Debes iniciar sesión para ver tus tiquetes' });
    }
    const tiquetes = await tiquetesRepo.findByUsuario(usuario_id);
    res.json({ data: tiquetes });
  } catch (err) { next(err); }
};

module.exports = { comprar, validar, getByCodigo, getMisTiquetes };
