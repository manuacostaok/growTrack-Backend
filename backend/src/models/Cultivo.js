const mongoose = require('mongoose');

const ETAPAS = ['germinacion', 'vegetativo', 'floracion', 'secado', 'curado'];

const cultivoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    nombre: { type: String, required: true, trim: true },
    tipoCultivo: { type: String, enum: ['planta', 'sala'], default: 'planta' },
    cantidadPlantas: { type: Number, default: 1, min: 1 },
    variedad: { type: String, trim: true },
    banco: { type: String, trim: true },
    fotoperiodo: { type: String, enum: ['fotoperiodo', 'autofloreciente'], default: 'fotoperiodo' },
    fechaGerminacion: { type: Date },
    maceta: {
      litros: Number,
      sustrato: String,
    },
    ubicacion: { type: String, enum: ['indoor', 'outdoor', 'carpa'], default: 'indoor' },
    notas: { type: String, default: '' },
    etapa: { type: String, enum: ETAPAS, default: 'germinacion' },
    pesoFinalGramos: { type: Number },
    historialEtapas: [
      {
        etapa: { type: String, enum: ETAPAS },
        fecha: { type: Date, default: Date.now },
      },
    ],
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

cultivoSchema.index({ usuario: 1, activo: 1 });

module.exports = mongoose.model('Cultivo', cultivoSchema);
module.exports.ETAPAS = ETAPAS;
