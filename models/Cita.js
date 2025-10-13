const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: [true, 'El paciente es obligatorio']
    },
    medicoAsignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El médico asignado es obligatorio']
    },
    fecha: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        validate: {
            validator: function(fecha) {
                // La fecha no puede ser anterior a hoy
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                return fecha >= hoy;
            },
            message: 'La fecha no puede ser anterior a hoy'
        }
    },
    hora: {
        type: String,
        required: [true, 'La hora es obligatoria'],
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)']
    },
    motivoConsulta: {
        type: String,
        required: [true, 'El motivo de consulta es obligatorio'],
        trim: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'atendida', 'cancelada'],
        default: 'pendiente'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    usuarioCreador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

// Índice compuesto para evitar citas duplicadas
citaSchema.index({ medicoAsignado: 1, fecha: 1, hora: 1 }, { unique: true });

// Método para verificar disponibilidad
citaSchema.statics.verificarDisponibilidad = async function(medicoId, fecha, hora, citaId = null) {
    const query = {
        medicoAsignado: medicoId,
        fecha: fecha,
        hora: hora,
        estado: { $ne: 'cancelada' } // No contar las canceladas
    };
    
    // Si estamos editando, excluir la cita actual
    if (citaId) {
        query._id = { $ne: citaId };
    }
    
    const citaExistente = await this.findOne(query);
    return !citaExistente; // true si está disponible
};

const Cita = mongoose.model('Cita', citaSchema);

module.exports = Cita;