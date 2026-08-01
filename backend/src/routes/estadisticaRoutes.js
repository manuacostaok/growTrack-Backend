const router = require('express').Router();
const { auth } = require('../middleware/auth');
const estadisticaController = require('../controllers/estadisticaController');

router.use(auth);

router.get('/comparar', estadisticaController.comparar);
router.get('/:id', estadisticaController.estadisticasDeCultivo);

module.exports = router;
