const Seguimiento = require('../models/Seguimiento');
const Cultivo = require('../models/Cultivo');
const asyncHandler = require('../utils/asyncHandler');
const { subirBufferACloudinary } = require('../config/cloudinary');

async function verificarPropiedadCultivo(cultivoId, usuarioId) {
  const cultivo = await Cultivo.findOne({ _id: cultivoId, usuario: usuarioId });
  if (!cultivo) {
    const err = new Error('Cultivo no encontrado.');
    err.status = 404;
    throw err;
  }
  return cultivo;
}

const listarPorCultivo = asyncHandler(async (req, res) => {
  await verificarPropiedadCultivo(req.params.cultivoId, req.user._id);
  const { page = 1, limit = 30 } = req.query;

  const seguimientos = await Seguimiento.find({ cultivo: req.params.cultivoId })
    .sort({ fecha: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ data: { seguimientos } });
});

const galeriaPorCultivo = asyncHandler(async (req, res) => {
  await verificarPropiedadCultivo(req.params.cultivoId, req.user._id);

  const seguimientos = await Seguimiento.find({
    cultivo: req.params.cultivoId,
    'fotos.0': { $exists: true },
  })
    .sort({ fecha: -1 })
    .select('fotos fecha');

  const fotos = seguimientos.flatMap((s) =>
    s.fotos.map((f) => ({ ...f.toObject(), fecha: s.fecha, seguimientoId: s._id }))
  );

  res.json({ data: { fotos } });
});

// Todas las fotos del usuario (en cualquiera de sus cultivos) dentro de un rango de fechas — para el calendario.
const fotosPorRango = asyncHandler(async (req, res) => {
  const { desde, hasta } = req.query;
  const cultivos = await Cultivo.find({ usuario: req.user._id }).select('_id nombre');
  const cultivoIds = cultivos.map((c) => c._id);
  const nombrePorCultivo = Object.fromEntries(cultivos.map((c) => [c._id.toString(), c.nombre]));

  const filtro = { cultivo: { $in: cultivoIds }, 'fotos.0': { $exists: true } };
  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde);
    if (hasta) filtro.fecha.$lte = new Date(hasta);
  }

  const seguimientos = await Seguimiento.find(filtro).select('fotos fecha cultivo');

  const fotos = seguimientos.flatMap((s) =>
    s.fotos.map((f) => ({
      url: f.url,
      cloudinaryId: f.cloudinaryId,
      fecha: s.fecha,
      cultivoId: s.cultivo,
      cultivoNombre: nombrePorCultivo[s.cultivo.toString()],
    }))
  );

  res.json({ data: { fotos } });
});

const crear = asyncHandler(async (req, res) => {
  await verificarPropiedadCultivo(req.params.cultivoId, req.user._id);

  const seguimiento = await Seguimiento.create({
    ...req.body,
    cultivo: req.params.cultivoId,
    usuario: req.user._id,
    fecha: req.body.fecha || new Date(),
  });

  res.status(201).json({ data: { seguimiento } });
});

const actualizar = asyncHandler(async (req, res) => {
  const seguimiento = await Seguimiento.findOne({ _id: req.params.id, usuario: req.user._id });
  if (!seguimiento) return res.status(404).json({ error: 'Registro no encontrado.' });

  const camposPermitidos = ['altura', 'nudos', 'estado', 'color', 'problemas', 'metrics', 'fertilizantes', 'notas'];
  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) seguimiento[campo] = req.body[campo];
  });
  await seguimiento.save();
  res.json({ data: { seguimiento } });
});

const eliminar = asyncHandler(async (req, res) => {
  const seguimiento = await Seguimiento.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
  if (!seguimiento) return res.status(404).json({ error: 'Registro no encontrado.' });
  res.json({ data: { ok: true } });
});

const subirFotos = asyncHandler(async (req, res) => {
  const seguimiento = await Seguimiento.findOne({ _id: req.params.id, usuario: req.user._id });
  if (!seguimiento) return res.status(404).json({ error: 'Registro no encontrado.' });

  const archivos = req.files || [];
  if (archivos.length === 0) {
    return res.status(400).json({ error: 'No se recibió ninguna foto.' });
  }

  const nuevasFotos = await Promise.all(
    archivos.map((f) => subirBufferACloudinary(f.buffer, f.mimetype))
  );
  seguimiento.fotos.push(...nuevasFotos);
  await seguimiento.save();

  res.status(201).json({ data: { seguimiento } });
});

module.exports = { listarPorCultivo, crear, actualizar, eliminar, subirFotos, galeriaPorCultivo, fotosPorRango };
