const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');
const { requireLogin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(requireLogin);

// Ver historia clínica de un paciente
router.get('/:pacienteId', historiaController.verHistoria);

// Formulario para editar información básica
router.get('/:pacienteId/editar', historiaController.mostrarFormularioEditar);

// Actualizar información básica
router.post('/:pacienteId/actualizar', historiaController.actualizarInformacionBasica);

// Agregar consulta
router.post('/:pacienteId/consulta', historiaController.agregarConsulta);

// Generar PDF
router.get('/:pacienteId/pdf', historiaController.generarPDF);

module.exports = router;