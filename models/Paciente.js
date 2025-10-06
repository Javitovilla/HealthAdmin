const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
        trim: true
    },
    tipoDocumento: {
        type: String,
        enum: ['CC', 'TI', 'CE', 'PA'],
        required: [true, 'El tipo de documento es obligatorio']
    },
    numeroDocumento: {
        type: String,
        required: [true, 'El número de documento es obligatorio'],
        unique: true,
        trim: true
    },
    fechaNacimiento: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria'],
        validate: {
            validator: function(fecha) {
                return fecha <= new Date() && fecha >= new Date('1900-01-01');
            },
            message: 'Fecha de nacimiento inválida'
        }
    },
    genero: {
        type: String,
        enum: ['M', 'F', 'Otro'],
        required: [true, 'El género es obligatorio']
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    usuarioRegistro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

// Método para calcular la edad
pacienteSchema.virtual('edad').get(function() {
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
});

// Método para obtener nombre completo
pacienteSchema.virtual('nombreCompleto').get(function() {
    return `${this.nombre} ${this.apellidos}`;
});

// Asegurar que los virtuals se incluyan en JSON
pacienteSchema.set('toJSON', { virtuals: true });
pacienteSchema.set('toObject', { virtuals: true });

// Índices para búsquedas rápidas
pacienteSchema.index({ numeroDocumento: 1 });
pacienteSchema.index({ nombre: 1, apellidos: 1 });

const Paciente = mongoose.model('Paciente', pacienteSchema);

module.exports = Paciente;