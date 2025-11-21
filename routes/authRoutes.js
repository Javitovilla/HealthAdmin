const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireLogin, requireAdmin } = require('../middlewares/auth');

// Rutas públicas
router.get('/login', authController.mostrarLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Rutas protegidas - Solo administradores
router.get('/registro', requireLogin, requireAdmin, authController.mostrarRegistro);
router.post('/registro', requireLogin, requireAdmin, authController.registrarUsuario);
router.get('/usuarios/lista', requireLogin, requireAdmin, authController.listarUsuarios);
router.post('/usuarios/:id/toggle', requireLogin, requireAdmin, authController.toggleEstadoUsuario);

module.exports = router;