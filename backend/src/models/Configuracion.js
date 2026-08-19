const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema(
  {
    // Documento único: siempre usamos el mismo _id fijo para no crear duplicados.
    clave: { type: String, default: 'global', unique: true },
    doctorNombre: { type: String, default: '' },
    doctorWhatsapp: { type: String, default: '' }, // con código de país, ej: 5491122334455
    doctorEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Configuracion', configuracionSchema);
