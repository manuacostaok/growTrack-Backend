const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mensaje: { type: String, required: true, trim: true },
    pagina: { type: String, default: '' }, // desde qué pantalla lo mandó, informativo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
