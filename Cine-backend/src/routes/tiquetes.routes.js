// src/routes/tiquetes.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/tiquetes.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/',                ctrl.comprar);          // Público (opcional auth)
router.post('/validar',         ctrl.validar);           // Validación en puerta
router.get('/mis-tiquetes',     authenticate, ctrl.getMisTiquetes); // Solo clientes autenticados
router.get('/:codigo',          authenticate, ctrl.getByCodigo);

module.exports = router;

// ─────────────────────────────────────────────────────────────
// src/routes/admin.routes.js
// ─────────────────────────────────────────────────────────────
