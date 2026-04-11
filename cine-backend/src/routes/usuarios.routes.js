// src/routes/usuarios.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/usuarios.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Todas las rutas requieren estar autenticado como admin
router.use(authenticate, requireAdmin);

router.get('/',                  ctrl.getAll);
router.post('/',                 ctrl.create);
router.patch('/:id/activo',      ctrl.toggleActivo);
router.patch('/:id/rol',         ctrl.cambiarRol);

module.exports = router;
