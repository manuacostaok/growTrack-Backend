const Configuracion = require('../models/Configuracion');
const DoctorClick = require('../models/DoctorClick');
const asyncHandler = require('../utils/asyncHandler');

async function obtenerODefault() {
  let config = await Configuracion.findOne({ clave: 'global' });
  if (!config) {
    config = await Configuracion.create({ clave: 'global' });
  }
  return config;
}

// Cualquier usuario logueado puede leerla (la necesita el botón de la sidebar).
const obtener = asyncHandler(async (req, res) => {
  const config = await obtenerODefault();
  res.json({ data: { configuracion: config } });
});

// Solo admin puede editarla.
const actualizar = asyncHandler(async (req, res) => {
  const { doctorNombre, doctorWhatsapp, doctorEmail } = req.body;
  const config = await obtenerODefault();

  if (doctorNombre !== undefined) config.doctorNombre = doctorNombre;
  if (doctorWhatsapp !== undefined) config.doctorWhatsapp = doctorWhatsapp;
  if (doctorEmail !== undefined) config.doctorEmail = doctorEmail;

  await config.save();
  res.json({ data: { configuracion: config } });
});

// Cualquier usuario logueado que toca el botón — no se expone a otros usuarios, solo cuenta para el admin.
const registrarClickDoctor = asyncHandler(async (req, res) => {
  await DoctorClick.create({ usuario: req.user._id });
  res.status(201).json({ data: { ok: true } });
});

module.exports = { obtener, actualizar, registrarClickDoctor };
