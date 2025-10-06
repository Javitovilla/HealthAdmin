const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
require('dotenv').config();

const crearUsuariosPrueba = async () => {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Eliminar usuarios existentes (solo para pruebas)
        await Usuario.deleteMany({});
        console.log('Usuarios anteriores eliminados');

        // Crear usuario administrativo
        const admin = await Usuario.create({
            nombre: 'Admin Usuario',
            email: 'admin@healthadmin.com',
            password: 'admin123',
            rol: 'administrativo'
        });
        console.log('Usuario administrativo creado:', admin.email);

        // Crear usuario asistencial
        const asistencial = await Usuario.create({
            nombre: 'Dr. Juan Pérez',
            email: 'asistencial@healthadmin.com',
            password: 'asistencial123',
            rol: 'asistencial'
        });
        console.log('Usuario asistencial creado:', asistencial.email);

        console.log('\nUsuarios de prueba creados exitosamente');
        console.log('-------------------------------------------');
        console.log('Admin: admin@healthadmin.com / admin123');
        console.log('Asistencial: asistencial@healthadmin.com / asistencial123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

crearUsuariosPrueba();