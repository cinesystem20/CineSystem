// src/controllers/asientos.controller.js
const asientosRepo = require('../repositories/asientos.repository');
const { AppError } = require('../middlewares/errorHandler');

const getByFuncion = async (req, res, next) => {
  try {
    const asientos = await asientosRepo.findByFuncion(req.params.id);
    res.json({ data: asientos });
  } catch (err) { next(err); }
};

module.exports = { getByFuncion };

// ─────────────────────────────────────────────────────────────
// src/controllers/tiquetes.controller.js
// ─────────────────────────────────────────────────────────────
