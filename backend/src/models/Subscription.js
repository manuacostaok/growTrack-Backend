const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['pro', 'premium'], required: true },
    estado: { type: String, enum: ['pendiente', 'activa', 'pausada', 'cancelada'], default: 'pendiente' },
    preapprovalId: String, // id de la suscripción (preapproval) en Mercado Pago
    monto: Number,
    renovacion: Date, // próxima fecha de cobro estimada, informativa
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
