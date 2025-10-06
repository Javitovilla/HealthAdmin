const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Ruta para mostrar el formulario de login
router.get('/login', authController.mostrarLogin);

// Ruta para procesar el login
router.post('/login', authController.procesarLogin);

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

// Ruta del dashboard (protegida)
router.get('/dashboard', isAuthenticated, authController.mostrarDashboard);

module.exports = router;