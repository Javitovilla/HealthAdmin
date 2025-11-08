const HistoriaClinica = require('../models/HistoriaClinica');
const Paciente = require('../models/Paciente');
const PDFDocument = require('pdfkit');

// Ver historia clínica de un paciente
exports.verHistoria = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
            return res.status(404).send('Paciente no encontrado');
        }
        
        let historia = await HistoriaClinica.findOne({ paciente: pacienteId })
            .populate('consultas.medico', 'nombre');
        
        // Si no existe historia, crear una nueva
        if (!historia) {
            historia = new HistoriaClinica({
                paciente: pacienteId,
                alergias: [],
                enfermedadesPreexistentes: [],
                medicamentosActuales: [],
                consultas: []
            });
            await historia.save();
        }
        
        res.render('historia/ver', {
            usuario: req.session.usuario,
            paciente,
            historia
        });
    } catch (error) {
        console.error('Error al ver historia:', error);
        res.status(500).send('Error al cargar historia clínica');
    }
};

// Mostrar formulario para editar información básica
exports.mostrarFormularioEditar = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
            return res.status(404).send('Paciente no encontrado');
        }
        
        let historia = await HistoriaClinica.findOne({ paciente: pacienteId });
        
        if (!historia) {
            historia = new HistoriaClinica({
                paciente: pacienteId,
                alergias: [],
                enfermedadesPreexistentes: [],
                medicamentosActuales: [],
                consultas: []
            });
            await historia.save();
        }
        
        res.render('historia/editar', {
            usuario: req.session.usuario,
            paciente,
            historia,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        res.status(500).send('Error al cargar formulario');
    }
};

// Actualizar información básica
exports.actualizarInformacionBasica = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { tipoSangre, alergias, enfermedadesPreexistentes, medicamentos } = req.body;
        
        // Procesar alergias
        const alergiasArray = [];
        if (req.body.alergiaTipo && Array.isArray(req.body.alergiaTipo)) {
            for (let i = 0; i < req.body.alergiaTipo.length; i++) {
                if (req.body.alergiaTipo[i] && req.body.alergiaDesc[i]) {
                    alergiasArray.push({
                        tipo: req.body.alergiaTipo[i],
                        descripcion: req.body.alergiaDesc[i]
                    });
                }
            }
        }
        
        // Procesar enfermedades
        const enfermedadesArray = typeof enfermedadesPreexistentes === 'string' 
            ? enfermedadesPreexistentes.split(',').map(e => e.trim()).filter(e => e)
            : [];
        
        // Procesar medicamentos
        const medicamentosArray = [];
        if (req.body.medNombre && Array.isArray(req.body.medNombre)) {
            for (let i = 0; i < req.body.medNombre.length; i++) {
                if (req.body.medNombre[i]) {
                    medicamentosArray.push({
                        nombre: req.body.medNombre[i],
                        dosis: req.body.medDosis[i] || '',
                        frecuencia: req.body.medFrecuencia[i] || ''
                    });
                }
            }
        }
        
        await HistoriaClinica.findOneAndUpdate(
            { paciente: pacienteId },
            {
                tipoSangre,
                alergias: alergiasArray,
                enfermedadesPreexistentes: enfermedadesArray,
                medicamentosActuales: medicamentosArray
            },
            { upsert: true, new: true }
        );
        
        res.redirect(`/historia/${pacienteId}`);
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).send('Error al actualizar información');
    }
};

// Agregar consulta
exports.agregarConsulta = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { motivo, diagnostico, tratamiento, observaciones, presionArterial, frecuenciaCardiaca, temperatura, peso, altura } = req.body;
        
        const historia = await HistoriaClinica.findOne({ paciente: pacienteId });
        
        if (!historia) {
            return res.status(404).send('Historia clínica no encontrada');
        }
        
        historia.consultas.push({
            fecha: new Date(),
            medico: req.session.usuario.id,
            motivo,
            diagnostico,
            tratamiento,
            observaciones,
            signosVitales: {
                presionArterial,
                frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca) : null,
                temperatura: temperatura ? parseFloat(temperatura) : null,
                peso: peso ? parseFloat(peso) : null,
                altura: altura ? parseFloat(altura) : null
            }
        });
        
        await historia.save();
        
        res.redirect(`/historia/${pacienteId}`);
    } catch (error) {
        console.error('Error al agregar consulta:', error);
        res.status(500).send('Error al agregar consulta');
    }
};

// Generar PDF
exports.generarPDF = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        
        const paciente = await Paciente.findById(pacienteId);
        const historia = await HistoriaClinica.findOne({ paciente: pacienteId })
            .populate('consultas.medico', 'nombre');
        
        if (!paciente || !historia) {
            return res.status(404).send('Información no encontrada');
        }
        
        // Crear PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=historia-${paciente.numeroDocumento}.pdf`);
        
        doc.pipe(res);
        
        // Título
        doc.fontSize(20).text('HISTORIA CLÍNICA', { align: 'center' });
        doc.moveDown();
        
        // Información del paciente
        doc.fontSize(14).text('DATOS DEL PACIENTE', { underline: true });
        doc.fontSize(10);
        doc.text(`Nombre: ${paciente.nombreCompleto}`);
        doc.text(`Documento: ${paciente.tipoDocumento}-${paciente.numeroDocumento}`);
        doc.text(`Edad: ${paciente.edad} años`);
        doc.text(`Teléfono: ${paciente.telefono}`);
        doc.text(`Tipo de Sangre: ${historia.tipoSangre}`);
        doc.moveDown();
        
        // Alergias
        doc.fontSize(14).text('ALERGIAS', { underline: true });
        doc.fontSize(10);
        if (historia.alergias.length > 0) {
            historia.alergias.forEach(alergia => {
                doc.text(`• ${alergia.tipo}: ${alergia.descripcion}`);
            });
        } else {
            doc.text('No registra alergias');
        }
        doc.moveDown();
        
        // Enfermedades preexistentes
        doc.fontSize(14).text('ENFERMEDADES PREEXISTENTES', { underline: true });
        doc.fontSize(10);
        if (historia.enfermedadesPreexistentes.length > 0) {
            historia.enfermedadesPreexistentes.forEach(enfermedad => {
                doc.text(`• ${enfermedad}`);
            });
        } else {
            doc.text('No registra enfermedades preexistentes');
        }
        doc.moveDown();
        
        // Medicamentos actuales
        doc.fontSize(14).text('MEDICAMENTOS ACTUALES', { underline: true });
        doc.fontSize(10);
        if (historia.medicamentosActuales.length > 0) {
            historia.medicamentosActuales.forEach(med => {
                doc.text(`• ${med.nombre} - ${med.dosis} - ${med.frecuencia}`);
            });
        } else {
            doc.text('No registra medicamentos actuales');
        }
        doc.moveDown();
        
        // Historial de consultas
        doc.addPage();
        doc.fontSize(14).text('HISTORIAL DE CONSULTAS', { underline: true });
        doc.fontSize(10);
        
        if (historia.consultas.length > 0) {
            historia.consultas.forEach((consulta, index) => {
                doc.moveDown();
                doc.fontSize(12).text(`Consulta #${index + 1} - ${new Date(consulta.fecha).toLocaleDateString('es-CO')}`);
                doc.fontSize(10);
                doc.text(`Médico: ${consulta.medico ? consulta.medico.nombre : 'N/A'}`);
                doc.text(`Motivo: ${consulta.motivo}`);
                doc.text(`Diagnóstico: ${consulta.diagnostico}`);
                doc.text(`Tratamiento: ${consulta.tratamiento}`);
                if (consulta.observaciones) {
                    doc.text(`Observaciones: ${consulta.observaciones}`);
                }
                doc.moveDown(0.5);
            });
        } else {
            doc.text('No hay consultas registradas');
        }
        
        doc.end();
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).send('Error al generar PDF');
    }
};