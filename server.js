// Importar dependencias
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
connectDB();

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('<h1>¡Hola Mundo! HealthAdmin funcionando 🏥</h1>');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});