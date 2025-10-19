const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { requireLogin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(requireLogin);

// Formulario de nueva cita
router.get('/nueva', citaController.mostrarFormulario);

// Procesar nueva cita
router.post('/nueva', citaController.crearCita);

// Lista de todas las citas
router.get('/lista', citaController.listarCitas);

// Citas del día
router.get('/dia', citaController.citasDelDia);

// Detalle de una cita
router.get('/:id', citaController.verDetalle);

// Cambiar estado de cita
router.post('/:id/estado', citaController.cambiarEstado);

// API para buscar pacientes
router.get('/api/buscar-pacientes', citaController.buscarPacientes);

module.exports = router;