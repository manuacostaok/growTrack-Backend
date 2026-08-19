const mongoose = require('mongoose');

const consejoSchema = new mongoose.Schema(
  {
    cultivo: { type: mongoose.Schema.Types.ObjectId, ref: 'Cultivo', required: true, index: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mensaje: { type: String, required: true },
    fotoAnalizada: { type: String, default: '' }, // url de Cloudinary usada para generarlo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consejo', consejoSchema);
