const Evento = require('../models/Evento');
const Cultivo = require('../models/Cultivo');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const { desde, hasta } = req.query;
  const filtro = { usuario: req.user._id };
  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde);
    if (hasta) filtro.fecha.$lte = new Date(hasta);
  }
  const eventos = await Evento.find(filtro).sort({ fecha: 1 }).populate('cultivo', 'nombre');
  res.json({ data: { eventos } });
});

const crear = asyncHandler(async (req, res) => {
  const cultivo = await Cultivo.findOne({ _id: req.body.cultivo, usuario: req.user._id });
  if (!cultivo) return res.status(404).json({ error: 'Cultivo no encontrado.' });

  const evento = await Evento.create({ ...req.body, usuario: req.user._id });
  res.status(201).json({ data: { evento } });
});

const actualizar = asyncHandler(async (req, res) => {
  const evento = await Evento.findOne({ _id: req.params.id, usuario: req.user._id });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado.' });

  ['titulo', 'tipo', 'fecha', 'completado', 'notas'].forEach((campo) => {
    if (req.body[campo] !== undefined) evento[campo] = req.body[campo];
  });
  await evento.save();
  res.json({ data: { evento } });
});

const eliminar = asyncHandler(async (req, res) => {
  const evento = await Evento.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado.' });
  res.json({ data: { ok: true } });
});

module.exports = { listar, crear, actualizar, eliminar };
