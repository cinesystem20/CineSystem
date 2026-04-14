// src/routes/funciones.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/funciones.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);
router.post('/',     authenticate, requireAdmin, ctrl.create);
router.put('/:id',   authenticate, requireAdmin, ctrl.update);

module.exports = router;
