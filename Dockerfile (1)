// src/routes/admin.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/dashboard', authenticate, requireAdmin, ctrl.getDashboard);

module.exports = router;
