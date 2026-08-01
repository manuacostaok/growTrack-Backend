const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');

let _anthropic = null;

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error('El diagnóstico por IA no está configurado todavía (falta ANTHROPIC_API_KEY en el .env).');
    err.status = 503;
    throw err;
  }
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

// Para diagnóstico no necesitamos guardar la foto en Cloudinary, solo mandarla a la IA.
const uploadMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imágenes.'));
    cb(null, true);
  },
});

module.exports = { getAnthropicClient, uploadMemoria };
