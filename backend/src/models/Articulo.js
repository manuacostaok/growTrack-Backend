const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    categoria: {
      type: String,
      enum: ['deficiencias', 'plagas', 'hongos', 'nutrientes', 'ph_ec', 'iluminacion', 'secado_curado'],
      required: true,
    },
    resumen: { type: String, required: true },
    contenido: { type: String, required: true }, // markdown simple
    tags: [String],
  },
  { timestamps: true }
);

articuloSchema.index({ titulo: 'text', resumen: 'text', contenido: 'text', tags: 'text' });

module.exports = mongoose.model('Articulo', articuloSchema);
