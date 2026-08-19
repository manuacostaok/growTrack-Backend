const Cultivo = require('../models/Cultivo');
const Seguimiento = require('../models/Seguimiento');
const Consejo = require('../models/Consejo');
const asyncHandler = require('../utils/asyncHandler');

const PLAN_LIMITES = { free: 2, pro: Infinity, premium: Infinity };

const listar = asyncHandler(async (req, res) => {
  const { etapa, page = 1, limit = 20 } = req.query;
  const filtro = { usuario: req.user._id, activo: true };
  if (etapa) filtro.etapa = etapa;

  const cultivos = await Cultivo.find(filtro)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Los seguimientos viven en otra colección — traemos el conteo real por cultivo de una sola vez.
  const conteos = await Seguimiento.aggregate([
    { $match: { cultivo: { $in: cultivos.map((c) => c._id) } } },
    { $group: { _id: '$cultivo', total: { $sum: 1 } } },
  ]);
  const conteoPorCultivo = Object.fromEntries(conteos.map((c) => [c._id.toString(), c.total]));
  const cultivosConConteo = cultivos.map((c) => ({
    ...c.toObject(),
    cantidadSeguimientos: conteoPorCultivo[c._id.toString()] || 0,
  }));

  const total = await Cultivo.countDocuments(filtro);
  res.json({ data: { cultivos: cultivosConConteo, total, page: Number(page), limit: Number(limit) } });
});

const crear = asyncHandler(async (req, res) => {
  const limite = PLAN_LIMITES[req.user.plan] ?? 2;
  const actuales = await Cultivo.countDocuments({ usuario: req.user._id, activo: true });
  if (actuales >= limite) {
    return res.status(402).json({
      error: `Tu plan ${req.user.plan} permite hasta ${limite} cultivos activos. Mejorá tu plan para crear más.`,
    });
  }

  const cultivo = await Cultivo.create({
    ...req.body,
    usuario: req.user._id,
    historialEtapas: [{ etapa: 'germinacion', fecha: new Date() }],
  });
  res.status(201).json({ data: { cultivo } });
});

const obtenerUnoOFallar = async (id, usuarioId) => {
  const cultivo = await Cultivo.findOne({ _id: id, usuario: usuarioId });
  if (!cultivo) {
    const err = new Error('Cultivo no encontrado.');
    err.status = 404;
    throw err;
  }
  return cultivo;
};

const obtener = asyncHandler(async (req, res) => {
  const cultivo = await obtenerUnoOFallar(req.params.id, req.user._id);
  res.json({ data: { cultivo } });
});

const actualizar = asyncHandler(async (req, res) => {
  const cultivo = await obtenerUnoOFallar(req.params.id, req.user._id);
  const camposPermitidos = ['nombre', 'tipoCultivo', 'cantidadPlantas', 'variedad', 'banco', 'fotoperiodo', 'fechaGerminacion', 'maceta', 'ubicacion', 'notas', 'pesoFinalGramos'];
  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) cultivo[campo] = req.body[campo];
  });
  await cultivo.save();
  res.json({ data: { cultivo } });
});

const cambiarEtapa = asyncHandler(async (req, res) => {
  const { etapa } = req.body;
  const cultivo = await obtenerUnoOFallar(req.params.id, req.user._id);
  cultivo.etapa = etapa;
  cultivo.historialEtapas.push({ etapa, fecha: new Date() });
  await cultivo.save();
  res.json({ data: { cultivo } });
});

const eliminar = asyncHandler(async (req, res) => {
  const cultivo = await obtenerUnoOFallar(req.params.id, req.user._id);
  cultivo.activo = false;
  await cultivo.save();
  res.json({ data: { ok: true } });
});

const resumenDashboard = asyncHandler(async (req, res) => {
  const usuarioId = req.user._id;
  const cultivos = await Cultivo.find({ usuario: usuarioId, activo: true });

  const conteos = {
    total: cultivos.length,
    vegetativo: cultivos.filter((c) => c.etapa === 'vegetativo').length,
    floracion: cultivos.filter((c) => c.etapa === 'floracion').length,
    listosParaCosecha: cultivos.filter((c) => ['secado', 'curado'].includes(c.etapa)).length,
  };

  const cultivoIds = cultivos.map((c) => c._id);
  const actividadReciente = await Seguimiento.find({ cultivo: { $in: cultivoIds } })
    .sort({ fecha: -1 })
    .limit(8)
    .populate('cultivo', 'nombre');

  res.json({ data: { conteos, actividadReciente } });
});

const listarConsejos = asyncHandler(async (req, res) => {
  const cultivo = await obtenerUnoOFallar(req.params.id, req.user._id);
  const esPlanPago = req.user.plan === 'pro' || req.user.plan === 'premium';
  if (!esPlanPago) {
    return res.json({ data: { consejos: [], bloqueado: true } });
  }
  const consejos = await Consejo.find({ cultivo: cultivo._id }).sort({ createdAt: -1 });
  res.json({ data: { consejos, bloqueado: false } });
});

module.exports = { listar, crear, obtener, actualizar, cambiarEtapa, eliminar, resumenDashboard, listarConsejos };
