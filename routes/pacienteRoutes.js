const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { isAuthenticated } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(isAuthenticated);

// Listar pacientes
router.get('/', pacienteController.listarPacientes);

// Buscar pacientes
router.get('/buscar', pacienteController.buscarPacientes);

// Mostrar formulario de registro
router.get('/nuevo', pacienteController.mostrarFormularioRegistro);

// Registrar paciente
router.post('/nuevo', pacienteController.registrarPaciente);

// Ver detalle
router.get('/:id', pacienteController.verDetalle);

// Mostrar formulario de edición
router.get('/:id/editar', pacienteController.mostrarFormularioEdicion);

// Actualizar paciente
router.post('/:id/editar', pacienteController.actualizarPaciente);

// Eliminar paciente
router.post('/:id/eliminar', pacienteController.eliminarPaciente);

module.exports = router;