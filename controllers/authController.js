const Usuario = require('../models/Usuario');

// Mostrar formulario de login
exports.mostrarLogin = (req, res) => {
    res.render('login', { error: null });
};

// Procesar login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.render('login', {
                error: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña   
        const esValida = await usuario.compararPassword(password);  

        if (!esValida) {
            return res.render('login', {
                error: 'Email o contraseña incorrectos'
            });
        }

        // Verificar que el usuario esté activo
        if (!usuario.activo) {    
            return res.render('login', {
                error: 'Tu cuenta está desactivada. Contacta al administrador.'
            });
        }

        // Crear sesión
        req.session.usuario = {   
            id: usuario._id,      
            nombre: usuario.nombre,
            email: usuario.email, 
            rol: usuario.rol      
        };

        // Redirigir al dashboard 
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error en login:', error);
        res.render('login', {     
            error: 'Error al iniciar sesión. Intenta de nuevo.'     
        });
    }
};

// Cerrar sesión
exports.logout = (req, res) => {  
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/auth/login');
    });
};

// Mostrar dashboard
exports.mostrarDashboard = (req, res) => {
    res.render('dashboard', {     
        usuario: req.session.usuario
    });
};

// Mostrar formulario de registro (solo para admin)
exports.mostrarRegistro = async (req, res) => {
    try {
        res.render('auth/registro', {
            title: 'Registrar Nuevo Usuario',
            error: null,
            usuario: req.session.usuario
        });
    } catch (error) {
        console.error(error);     
        res.status(500).send('Error al cargar el formulario');      
    }
};

// Procesar registro de nuevo usuario
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, cedula, telefono, especialidad } = req.body;

        // Validar que el email no exista
        const usuarioExistente = await Usuario.findOne({ email });  
        if (usuarioExistente) {   
            return res.render('auth/registro', {
                title: 'Registrar Nuevo Usuario',
                error: 'El email ya está registrado',
                usuario: req.session.usuario
            });
        }

        // Crear el nuevo usuario 
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password, // Se hasheará automáticamente por el pre-save hook
            rol,
            cedula,
            telefono,
            especialidad: rol === 'medico' ? especialidad : undefined,
            activo: true
        });

        await nuevoUsuario.save();

        req.session.mensaje = {   
            tipo: 'success',      
            texto: `Usuario ${nombre} creado exitosamente`
        };

        res.redirect('/auth/usuarios/lista');
    } catch (error) {
        console.error(error);     
        res.render('auth/registro', {
            title: 'Registrar Nuevo Usuario',
            error: 'Error al registrar el usuario',
            usuario: req.session.usuario
        });
    }
};

// Listar todos los usuarios      
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ createdAt: -1 });

        const mensaje = req.session.mensaje;
        delete req.session.mensaje;

        res.render('usuarios/lista', {
            title: 'Gestión de Usuarios',
            usuarios,
            mensaje,
            usuario: req.session.usuario
        });
    } catch (error) {
        console.error(error);     
        res.status(500).send('Error al cargar usuarios');
    }
};

// Activar/Desactivar usuario     
exports.toggleEstadoUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);      
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        usuario.activo = !usuario.activo;
        await usuario.save();     

        res.json({
            success: true,        
            activo: usuario.activo,
            mensaje: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
        });
    } catch (error) {
        console.error(error);     
        res.status(500).json({ error: 'Error al cambiar estado' }); 
    }
};