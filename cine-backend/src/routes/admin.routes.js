// src/routes/admin.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/dashboard', authenticate, requireAdmin, ctrl.getDashboard);
router.get('/tiquetes',   authenticate, requireAdmin, ctrl.getTiquetes);

module.exports = router;
