// server.js
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const citaRoutes = require('./routes/citaRoutes');
const historiaRoutes = require('./routes/historiaRoutes');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
connectDB();

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1800000 // 30 minutos
    }
}));

// Rutas

app.use('/auth', authRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/citas', citaRoutes);
app.use('/historia', historiaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/dashboard');
    }
    res.redirect('/auth/login');
});

// Ruta del dashboard (requiere autenticación)
app.get('/dashboard', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    res.render('dashboard', { usuario: req.session.usuario });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});