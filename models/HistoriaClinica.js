const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true,
        unique: true
    },
    
    // Información básica médica
    tipoSangre: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'],
        default: 'Desconocido'
    },
    
    alergias: [{
        tipo: String, // medicamento, alimento, otro
        descripcion: String
    }],
    
    enfermedadesPreexistentes: [String],
    
    medicamentosActuales: [{
        nombre: String,
        dosis: String,
        frecuencia: String
    }],
    
    // Historial de consultas
    consultas: [{
        fecha: {
            type: Date,
            default: Date.now
        },
        cita: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cita'
        },
        medico: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        motivo: String,
        diagnostico: String,
        tratamiento: String,
        observaciones: String,
        signosVitales: {
            presionArterial: String,
            frecuenciaCardiaca: Number,
            temperatura: Number,
            peso: Number,
            altura: Number
        }
    }],
    
    // Última actualización
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Actualizar fecha de última actualización
historiaClinicaSchema.pre('save', function(next) {
    this.ultimaActualizacion = new Date();
    next();
});

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);