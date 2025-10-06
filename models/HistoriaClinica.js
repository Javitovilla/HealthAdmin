const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true,
        unique: true
    },
    evoluciones: [{
        fecha: {
            type: Date,
            default: Date.now
        },
        motivo: {
            type: String,
            required: true
        },
        sintomas: {
            type: String,
            required: true
        },
        diagnostico: {
            type: String,
            required: true
        },
        tratamiento: {
            type: String,
            required: true
        },
        medico: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

const HistoriaClinica = mongoose.model('HistoriaClinica', historiaClinicaSchema);

module.exports = HistoriaClinica;