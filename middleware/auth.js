// Verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.usuario) {
        // Usuario autenticado, continuar
        return next();
    }
    // No autenticado, redirigir a login
    return res.redirect('/login');
};

// Verificar si el usuario es administrativo
const isAdmin = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'administrativo') {
        // Es admin, continuar
        return next();
    }
    // No es admin, mostrar error
    return res.status(403).send('Acceso denegado. Solo personal administrativo.');
};

module.exports = {
    isAuthenticated,
    isAdmin
};