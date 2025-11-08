const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { requireLogin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(requireLogin);

// API para buscar pacientes (DEBE IR ANTES de las rutas con :id)
router.get('/api/buscar-pacientes', citaController.buscarPacientes);

// Formulario de nueva cita
router.get('/nueva', citaController.mostrarFormulario);

// Procesar nueva cita
router.post('/nueva', citaController.crearCita);

// Lista de todas las citas
router.get('/lista', citaController.listarCitas);

// Citas del día
router.get('/dia', citaController.citasDelDia);

// Cambiar estado de cita
router.post('/:id/estado', citaController.cambiarEstado);

// Detalle de una cita (DEBE IR AL FINAL)
router.get('/:id', citaController.verDetalle);

module.exports = router;