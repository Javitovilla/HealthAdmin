const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { isAuthenticated } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(isAuthenticated);

// Listar citas del día
router.get('/dia', citaController.listarCitasDelDia);

// Listar todas las citas
router.get('/', citaController.listarTodasCitas);

// Buscar paciente para cita (API)
router.get('/buscar-paciente', citaController.buscarPacienteParaCita);

// Mostrar formulario de agendar
router.get('/agendar', citaController.mostrarFormularioAgendar);

// Agendar cita
router.post('/agendar', citaController.agendarCita);

// Ver detalle
router.get('/:id', citaController.verDetalle);

// Cambiar estado
router.post('/:id/estado', citaController.cambiarEstado);

module.exports = router;