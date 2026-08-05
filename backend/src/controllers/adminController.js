const User = require('../models/User');
const Cultivo = require('../models/Cultivo');
const Subscription = require('../models/Subscription');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');

const listarUsuarios = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, plan } = req.query;
  const filtro = {};
  if (plan) filtro.plan = plan;

  const usuarios = await User.find(filtro)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(filtro);

  res.json({ data: { usuarios, total, page: Number(page), limit: Number(limit) } });
});

const cambiarPlanUsuario = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'pro', 'premium'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido.' });
  }
  const usuario = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true });
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ data: { usuario } });
});

const metricas = asyncHandler(async (req, res) => {
  const [totalUsuarios, usuariosPorPlan, totalCultivos, suscripcionesActivas] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$plan', total: { $sum: 1 } } }]),
    Cultivo.countDocuments({ activo: true }),
    Subscription.find({ estado: 'activa' }),
  ]);

  const mrrEstimado = suscripcionesActivas.reduce((sum, s) => sum + (s.monto || 0), 0);

  res.json({
    data: {
      totalUsuarios,
      usuariosPorPlan,
      totalCultivos,
      suscripcionesActivas: suscripcionesActivas.length,
      mrrEstimadoArs: mrrEstimado,
    },
  });
});

const listarFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(100).populate('usuario', 'nombre email');
  res.json({ data: { feedback } });
});

module.exports = { listarUsuarios, cambiarPlanUsuario, metricas, listarFeedback };
