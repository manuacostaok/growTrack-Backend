const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const configuracionController = require('../controllers/configuracionController');

router.use(auth);

router.get('/', configuracionController.obtener);
router.post('/doctor-click', configuracionController.registrarClickDoctor);
router.patch('/', checkRole('admin'), configuracionController.actualizar);

module.exports = router;
