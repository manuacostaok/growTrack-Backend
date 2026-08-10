const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');

let _ai = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('El diagnóstico por IA no está configurado todavía (falta GEMINI_API_KEY en el .env).');
    err.status = 503;
    throw err;
  }
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
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

module.exports = { getGeminiClient, uploadMemoria };
