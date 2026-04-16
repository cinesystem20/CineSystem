// src/routes/tiquetes.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/tiquetes.controller');
const { authenticate, authenticateOptional } = require('../middlewares/auth');

router.post('/',             authenticateOptional, ctrl.comprar);          // Opcional: asigna usuario si está logueado
router.post('/validar',      ctrl.validar);                                 // Validación en puerta
router.get('/mis-tiquetes',  authenticate, ctrl.getMisTiquetes);            // Debe ir ANTES de /:codigo
router.get('/:codigo',       ctrl.getByCodigo);  // Público: cualquiera con el código puede ver su tiquete

module.exports = router;
