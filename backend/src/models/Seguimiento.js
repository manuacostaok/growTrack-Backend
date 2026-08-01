const mongoose = require('mongoose');

const seguimientoSchema = new mongoose.Schema(
  {
    cultivo: { type: mongoose.Schema.Types.ObjectId, ref: 'Cultivo', required: true, index: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fecha: { type: Date, default: Date.now },
    altura: Number,
    nudos: Number,
    estado: String,
    color: String,
    problemas: [String],
    metrics: {
      temp: Number,
      humedad: Number,
      ppfd: Number,
      dli: Number,
      lux: Number,
      ec: Number,
      ph: Number,
      tempAgua: Number,
      litrosAgua: Number,
    },
    fertilizantes: [
      {
        nombre: String,
        dosis: String,
      },
    ],
    notas: { type: String, default: '' },
    fotos: [
      {
        url: String,
        cloudinaryId: String,
      },
    ],
  },
  { timestamps: true }
);

seguimientoSchema.index({ cultivo: 1, fecha: -1 });

module.exports = mongoose.model('Seguimiento', seguimientoSchema);
