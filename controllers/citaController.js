const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');
const Usuario = require('../models/Usuario');

// Generar horarios disponibles
const generarHorarios = () => {
    const horarios = [];
    for (let hora = 8; hora < 18; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
    }
    return horarios;
};

// Mostrar formulario de agendar cita
const mostrarFormularioAgendar = async (req, res) => {
    try {
        // Obtener médicos (usuarios asistenciales)
        const medicos = await Usuario.find({ rol: 'asistencial' }).sort({ nombre: 1 });
        
        const horarios = generarHorarios();
        
        res.render('citas/formulario', {
            usuario: req.session.usuario,
            medicos,
            horarios,
            pacienteSeleccionado: null,
            error: null,
            titulo: 'Agendar Nueva Cita'
        });
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};

// Buscar paciente para agendar cita
const buscarPacienteParaCita = async (req, res) => {
    try {
        const { busqueda } = req.query;
        
        if (!busqueda) {
            return res.json({ pacientes: [] });
        }

        const pacientes = await Paciente.find({
            activo: true,
            $or: [
                { nombre: { $regex: busqueda, $options: 'i' } },
                { apellidos: { $regex: busqueda, $options: 'i' } },
                { numeroDocumento: busqueda }
            ]
        }).limit(10);

        res.json({ pacientes });

    } catch (error) {
        console.error('Error al buscar paciente:', error);
        res.status(500).json({ error: 'Error al buscar paciente' });
    }
};

// Agendar nueva cita
const agendarCita = async (req, res) => {
    try {
        const { pacienteId, medicoAsignado, fecha, hora, motivoConsulta } = req.body;

        // Validar que todos los campos estén presentes
        if (!pacienteId || !medicoAsignado || !fecha || !hora || !motivoConsulta) {
            const medicos = await Usuario.find({ rol: 'asistencial' }).sort({ nombre: 1 });
            const horarios = generarHorarios();
            
            return res.render('citas/formulario', {
                usuario: req.session.usuario,
                medicos,
                horarios,
                pacienteSeleccionado: null,
                error: 'Todos los campos son obligatorios',
                titulo: 'Agendar Nueva Cita'
            });
        }

        // Verificar disponibilidad
        const fechaCita = new Date(fecha);
        const disponible = await Cita.verificarDisponibilidad(medicoAsignado, fechaCita, hora);

        if (!disponible) {
            const medicos = await Usuario.find({ rol: 'asistencial' }).sort({ nombre: 1 });
            const horarios = generarHorarios();
            
            return res.render('citas/formulario', {
                usuario: req.session.usuario,
                medicos,
                horarios,
                pacienteSeleccionado: null,
                error: 'El médico ya tiene una cita agendada en ese horario',
                titulo: 'Agendar Nueva Cita'
            });
        }

        // Crear la cita
        await Cita.create({
            paciente: pacienteId,
            medicoAsignado,
            fecha: fechaCita,
            hora,
            motivoConsulta,
            usuarioCreador: req.session.usuario.id
        });

        res.redirect('/citas?mensaje=Cita agendada exitosamente');

    } catch (error) {
        console.error('Error al agendar cita:', error);
        const medicos = await Usuario.find({ rol: 'asistencial' }).sort({ nombre: 1 });
        const horarios = generarHorarios();
        
        res.render('citas/formulario', {
            usuario: req.session.usuario,
            medicos,
            horarios,
            pacienteSeleccionado: null,
            error: 'Error al agendar la cita. Intenta de nuevo.',
            titulo: 'Agendar Nueva Cita'
        });
    }
};

// Listar citas del día actual
const listarCitasDelDia = async (req, res) => {
    try {
        // Obtener fecha actual (inicio y fin del día)
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const finDia = new Date(inicioDia);
        finDia.setDate(finDia.getDate() + 1);

        const citas = await Cita.find({
            fecha: {
                $gte: inicioDia,
                $lt: finDia
            }
        })
        .populate('paciente')
        .populate('medicoAsignado', 'nombre')
        .sort({ hora: 1 });

        res.render('citas/lista-dia', {
            usuario: req.session.usuario,
            citas,
            fecha: hoy,
            mensaje: req.query.mensaje || null
        });

    } catch (error) {
        console.error('Error al listar citas del día:', error);
        res.status(500).send('Error al cargar las citas');
    }
};

// Listar todas las citas con filtros
const listarTodasCitas = async (req, res) => {
    try {
        const { fecha, estado, pagina = 1 } = req.query;
        const limite = 15;
        const skip = (pagina - 1) * limite;

        // Construir filtros
        const filtros = {};
        
        if (fecha) {
            const fechaFiltro = new Date(fecha);
            const finDia = new Date(fechaFiltro);
            finDia.setDate(finDia.getDate() + 1);
            
            filtros.fecha = {
                $gte: fechaFiltro,
                $lt: finDia
            };
        }
        
        if (estado) {
            filtros.estado = estado;
        }

        const totalCitas = await Cita.countDocuments(filtros);
        const totalPaginas = Math.ceil(totalCitas / limite);

        const citas = await Cita.find(filtros)
            .populate('paciente')
            .populate('medicoAsignado', 'nombre')
            .sort({ fecha: -1, hora: -1 })
            .skip(skip)
            .limit(limite);

        res.render('citas/lista', {
            usuario: req.session.usuario,
            citas,
            paginaActual: parseInt(pagina),
            totalPaginas,
            filtros: { fecha, estado },
            mensaje: req.query.mensaje || null
        });

    } catch (error) {
        console.error('Error al listar citas:', error);
        res.status(500).send('Error al cargar las citas');
    }
};

// Cambiar estado de cita
const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['atendida', 'cancelada'].includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        await Cita.findByIdAndUpdate(id, { estado });

        res.redirect('/citas/dia?mensaje=Estado actualizado exitosamente');

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.redirect('/citas/dia?mensaje=Error al actualizar el estado');
    }
};

// Ver detalle de cita
const verDetalle = async (req, res) => {
    try {
        const cita = await Cita.findById(req.params.id)
            .populate('paciente')
            .populate('medicoAsignado', 'nombre')
            .populate('usuarioCreador', 'nombre');

        if (!cita) {
            return res.redirect('/citas?mensaje=Cita no encontrada');
        }

        res.render('citas/detalle', {
            usuario: req.session.usuario,
            cita
        });

    } catch (error) {
        console.error('Error al ver detalle:', error);
        res.redirect('/citas?mensaje=Error al cargar la cita');
    }
};

module.exports = {
    mostrarFormulario: mostrarFormularioAgendar,
    crearCita: agendarCita,
    listarCitas: listarTodasCitas,
    citasDelDia: listarCitasDelDia,
    buscarPacientes: buscarPacienteParaCita,
    verDetalle,
    cambiarEstado
};