const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

let _genAI = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('El diagnóstico por IA no está configurado todavía (falta GEMINI_API_KEY en el .env).');
    err.status = 503;
    throw err;
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
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
