// Middleware para verificar si el usuario está logueado
exports.requireLogin = (req, res, next) => {
    if (req.session && req.session.usuario) {
        // Usuario autenticado, continuar
        return next();
    }
    // No autenticado, redirigir a login
    return res.redirect('/auth/login');
};

// Middleware para verificar si el usuario es administrador
exports.requireAdmin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }

    if (req.session.usuario.rol !== 'administrador') {
        return res.status(403).render('error', {
            title: 'Acceso Denegado',
            mensaje: 'No tienes permisos para acceder a esta sección',
            usuario: req.session.usuario
        });
    }

    next();
};

// Middleware para verificar roles específicos
exports.requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.session.usuario) {
            return res.redirect('/auth/login');
        }

        if (!roles.includes(req.session.usuario.rol)) {
            return res.status(403).render('error', {
                title: 'Acceso Denegado',
                mensaje: 'No tienes permisos para acceder a esta sección',
                usuario: req.session.usuario
            });
        }

        next();
    };
};

// Alias para compatibilidad con código antiguo (si lo necesitas)
exports.isAuthenticated = exports.requireLogin;
exports.isAdmin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }

    if (req.session.usuario.rol !== 'administrativo') {
        return res.status(403).send('Acceso denegado. Solo personal administrativo.');
    }

    next();
};