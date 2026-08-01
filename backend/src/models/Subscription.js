const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['pro', 'premium'], required: true },
    estado: { type: String, enum: ['pendiente', 'activa', 'cancelada', 'vencida'], default: 'pendiente' },
    preferenciaId: String, // id de la preferencia de Mercado Pago
    pagoId: String, // id del pago aprobado
    monto: Number,
    renovacion: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
