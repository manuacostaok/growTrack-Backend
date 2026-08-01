const mongoose = require('mongoose');

const analyticsEventoSchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true }, // 'pageview' | 'cta_click' | 'signup' | ...
    pagina: String, // ej: '/', '/precios'
    meta: { type: mongoose.Schema.Types.Mixed }, // datos extra no sensibles (ej: { plan: 'pro' })
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

analyticsEventoSchema.index({ tipo: 1, fecha: -1 });

module.exports = mongoose.model('AnalyticsEvento', analyticsEventoSchema);
