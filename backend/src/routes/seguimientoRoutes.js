const router = require('express').Router();
const { auth } = require('../middleware/auth');
const seguimientoController = require('../controllers/seguimientoController');
const { upload } = require('../config/cloudinary');

router.use(auth);

router.patch('/:id', seguimientoController.actualizar);
router.delete('/:id', seguimientoController.eliminar);
router.post('/:id/fotos', upload.array('fotos', 6), seguimientoController.subirFotos);

module.exports = router;
