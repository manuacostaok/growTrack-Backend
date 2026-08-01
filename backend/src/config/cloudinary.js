const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Guardamos el archivo en memoria (no en disco) y lo subimos nosotros mismos a Cloudinary.
// Evita depender de "multer-storage-cloudinary", que todavía pide Cloudinary v1 como peer
// dependency y choca con la v2 que usamos acá.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB por foto
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen.'));
    }
    cb(null, true);
  },
});

async function subirBufferACloudinary(buffer, mimetype) {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const resultado = await cloudinary.uploader.upload(dataUri, {
    folder: 'growtrack-pro/seguimientos',
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
  });
  return { url: resultado.secure_url, cloudinaryId: resultado.public_id };
}

module.exports = { cloudinary, upload, subirBufferACloudinary };
