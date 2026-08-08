const mongoose = require('mongoose');

const TIPOS = ['riego', 'fertilizacion', 'poda', 'lst', 'hst', 'defoliacion', 'cambio_etapa', 'lavado_raices', 'cosecha', 'custom'];

const eventoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cultivo: { type: mongoose.Schema.Types.ObjectId, ref: 'Cultivo', required: true, index: true },
    tipo: { type: String, enum: TIPOS, default: 'custom' },
    titulo: { type: String, required: true },
    fecha: { type: Date, required: true },
    completado: { type: Boolean, default: false },
    recordatorio: { type: Boolean, default: false },
    recordatorioEnviado: { type: Boolean, default: false },
    notas: { type: String, default: '' },
  },
  { timestamps: true }
);

eventoSchema.index({ usuario: 1, fecha: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
module.exports.TIPOS = TIPOS;
