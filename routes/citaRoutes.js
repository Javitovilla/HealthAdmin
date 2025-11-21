const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { requireLogin } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(requireLogin);

// API para buscar pacientes (DEBE IR ANTES de las rutas con :id)
router.get('/api/buscar-pacientes', citaController.buscarPacientes);

// API para obtener médicos por especialidad - SIMPLIFICANDO EL NOMBRE
router.get('/api/medicos', citaController.obtenerMedicosPorEspecialidad);

// API para obtener todas las especialidades
router.get('/api/especialidades', citaController.obtenerEspecialidades);

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