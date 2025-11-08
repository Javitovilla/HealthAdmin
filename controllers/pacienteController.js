const Paciente = require('../models/Paciente');
const HistoriaClinica = require('../models/HistoriaClinica');

// Mostrar formulario de registro
exports.mostrarFormulario = (req, res) => {
    res.render('pacientes/formulario', {
        usuario: req.session.usuario,
        paciente: null,
        error: null,
        titulo: 'Registrar Nuevo Paciente'
    });
};

// Registrar nuevo paciente
exports.crearPaciente = async (req, res) => {
    try {
        const { nombre, apellidos, tipoDocumento, numeroDocumento, 
                fechaNacimiento, genero, telefono, email } = req.body;

        // Verificar si ya existe el documento
        const existente = await Paciente.findOne({ numeroDocumento });
        if (existente) {
            return res.render('pacientes/formulario', {
                usuario: req.session.usuario,
                paciente: null,
                error: 'Este número de documento ya está registrado',
                titulo: 'Registrar Nuevo Paciente'
            });
        }

        // Crear el paciente
        const paciente = await Paciente.create({
            nombre,
            apellidos,
            tipoDocumento,
            numeroDocumento,
            fechaNacimiento,
            genero,
            telefono,
            email: email || undefined,
            usuarioRegistro: req.session.usuario.id
        });

        // Crear historia clínica vacía
        await HistoriaClinica.create({
            paciente: paciente._id,
            evoluciones: []
        });

        res.redirect('/pacientes?mensaje=Paciente registrado exitosamente');

    } catch (error) {
        console.error('Error al registrar paciente:', error);
        res.render('pacientes/formulario', {
            usuario: req.session.usuario,
            paciente: null,
            error: 'Error al registrar el paciente. Verifica los datos.',
            titulo: 'Registrar Nuevo Paciente'
        });
    }
};

// Listar pacientes con paginación
exports.listarPacientes = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = 15;
        const skip = (pagina - 1) * limite;

        const totalPacientes = await Paciente.countDocuments({ activo: true });
        const totalPaginas = Math.ceil(totalPacientes / limite);

        const pacientes = await Paciente.find({ activo: true })
            .sort({ fechaRegistro: -1 })
            .skip(skip)
            .limit(limite);

        res.render('pacientes/lista', {
            usuario: req.session.usuario,
            pacientes,
            paginaActual: pagina,
            totalPaginas,
            mensaje: req.query.mensaje || null
        });

    } catch (error) {
        console.error('Error al listar pacientes:', error);
        res.status(500).send('Error al cargar la lista de pacientes');
    }
};

// Buscar pacientes
exports.buscarPacientes = async (req, res) => {
    try {
        const { busqueda } = req.query;

        if (!busqueda) {
            return res.redirect('/pacientes');
        }

        // Buscar por nombre, apellidos o documento
        const pacientes = await Paciente.find({
            activo: true,
            $or: [
                { nombre: { $regex: busqueda, $options: 'i' } },
                { apellidos: { $regex: busqueda, $options: 'i' } },
                { numeroDocumento: busqueda }
            ]
        }).limit(15);

        res.render('pacientes/lista', {
            usuario: req.session.usuario,
            pacientes,
            paginaActual: 1,
            totalPaginas: 1,
            mensaje: pacientes.length === 0 ? 'No se encontraron pacientes' : null
        });

    } catch (error) {
        console.error('Error al buscar pacientes:', error);
        res.status(500).send('Error al buscar pacientes');
    }
};

// Ver detalle de paciente
exports.verDetalle = async (req, res) => {
    try {
        const paciente = await Paciente.findById(req.params.id);
        
        if (!paciente) {
            return res.redirect('/pacientes?mensaje=Paciente no encontrado');
        }

        res.render('pacientes/detalle', {
            usuario: req.session.usuario,
            paciente,
            error: null
        });

    } catch (error) {
        console.error('Error al ver detalle:', error);
        res.redirect('/pacientes?mensaje=Error al cargar paciente');
    }
};

// Mostrar formulario de edición
exports.mostrarFormularioEdicion = async (req, res) => {
    try {
        const paciente = await Paciente.findById(req.params.id);
        
        if (!paciente) {
            return res.redirect('/pacientes?mensaje=Paciente no encontrado');
        }

        res.render('pacientes/formulario', {
            usuario: req.session.usuario,
            paciente,
            error: null,
            titulo: 'Editar Paciente'
        });

    } catch (error) {
        console.error('Error al cargar formulario:', error);
        res.redirect('/pacientes?mensaje=Error al cargar el paciente');
    }
};

// Actualizar paciente
exports.actualizarPaciente = async (req, res) => {
    try {
        const { nombre, apellidos, telefono, email } = req.body;

        await Paciente.findByIdAndUpdate(req.params.id, {
            nombre,
            apellidos,
            telefono,
            email: email || undefined
        });

        res.redirect('/pacientes?mensaje=Paciente actualizado exitosamente');

    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        const paciente = await Paciente.findById(req.params.id);
        res.render('pacientes/formulario', {
            usuario: req.session.usuario,
            paciente,
            error: 'Error al actualizar el paciente',
            titulo: 'Editar Paciente'
        });
    }
};

// Eliminar paciente (soft delete)
exports.eliminarPaciente = async (req, res) => {
    try {
        await Paciente.findByIdAndUpdate(req.params.id, {
            activo: false
        });

        res.redirect('/pacientes?mensaje=Paciente eliminado exitosamente');

    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        res.redirect('/pacientes?mensaje=Error al eliminar el paciente');
    }
};