const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/healthadmin')
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error de conexión:', err));

async function crearAdmin() {
    try {
        // Eliminar admin anterior si existe
        await Usuario.deleteOne({ email: 'admin@healthadmin.com' });
        console.log('🗑️  Usuario anterior eliminado');

        // Crear nuevo admin
        const admin = new Usuario({
            nombre: 'Administrador Principal',
            email: 'admin@healthadmin.com',
            password: 'admin123', // Se hasheará automáticamente
            rol: 'administrador',
            cedula: '1234567890',
            telefono: '3001234567',
            activo: true
        });

        await admin.save();
        console.log('✅ ¡Administrador creado exitosamente!');
        console.log('📧 Email: admin@healthadmin.com');
        console.log('🔑 Contraseña: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

crearAdmin();
