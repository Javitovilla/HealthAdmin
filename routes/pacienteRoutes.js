const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { requireLogin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(requireLogin);

// Lista de pacientes
router.get('/', pacienteController.listarPacientes);

// Formulario nuevo paciente
router.get('/nuevo', pacienteController.mostrarFormulario);

// Crear paciente
router.post('/nuevo', pacienteController.crearPaciente);

// BÚSQUEDA - DEBE IR ANTES DE /:id
router.get('/buscar', pacienteController.buscarPacientes);

// Ver detalle - DEBE IR DESPUÉS de rutas específicas
router.get('/:id', pacienteController.verDetalle);

// Editar paciente
router.get('/:id/editar', pacienteController.mostrarFormularioEdicion);
router.post('/:id/editar', pacienteController.actualizarPaciente);

// Eliminar paciente
router.post('/:id/eliminar', pacienteController.eliminarPaciente);

module.exports = router;