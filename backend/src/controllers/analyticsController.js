const AnalyticsEvento = require('../models/AnalyticsEvento');
const asyncHandler = require('../utils/asyncHandler');

const TIPOS_VALIDOS = ['pageview', 'cta_click', 'signup', 'pricing_view', 'checkout_start'];

const registrar = asyncHandler(async (req, res) => {
  const { tipo, pagina, meta } = req.body;
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de evento inválido.' });
  }
  await AnalyticsEvento.create({ tipo, pagina, meta });
  res.status(201).json({ data: { ok: true } });
});

// Solo para admins: conteos agregados, nunca eventos individuales con detalle de usuario.
const resumen = asyncHandler(async (req, res) => {
  const desde = req.query.desde ? new Date(req.query.desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const agregados = await AnalyticsEvento.aggregate([
    { $match: { fecha: { $gte: desde } } },
    { $group: { _id: '$tipo', total: { $sum: 1 } } },
  ]);
  res.json({ data: { desde, agregados } });
});

module.exports = { registrar, resumen };
