const Usuario = require('../models/Usuario');

// Mostrar formulario de login
const mostrarLogin = (req, res) => {
    res.render('login', { error: null });
};

// Procesar login
const procesarLogin = async (req, res) => {
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
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/login');
    });
};

// Mostrar dashboard
const mostrarDashboard = (req, res) => {
    res.render('dashboard', { 
        usuario: req.session.usuario 
    });
};

module.exports = {
    mostrarLogin,
    procesarLogin,
    logout,
    mostrarDashboard
};