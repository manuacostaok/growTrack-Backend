const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const { enviarMailFeedback } = require('../config/mailer');

const crear = asyncHandler(async (req, res) => {
  const { mensaje, pagina } = req.body;
  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Escribí tu comentario antes de enviarlo.' });
  }

  const feedback = await Feedback.create({ usuario: req.user._id, mensaje: mensaje.trim(), pagina });

  // No esperamos a que termine de mandar el mail para responder — mejor UX, y si falla el mail
  // el feedback ya está guardado igual.
  enviarMailFeedback({
    nombreUsuario: req.user.nombre,
    emailUsuario: req.user.email,
    mensaje: feedback.mensaje,
    pagina,
  }).catch(() => {});

  res.status(201).json({ data: { ok: true } });
});

// Solo admin: ver todo el feedback recibido.
const listar = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('usuario', 'nombre email');
  res.json({ data: { feedback } });
});

module.exports = { crear, listar };
