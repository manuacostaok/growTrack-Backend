const router = require('express').Router();
const { auth } = require('../middleware/auth');
const pagoController = require('../controllers/pagoController');

router.post('/webhook', pagoController.webhook); // pública, la llama Mercado Pago

router.use(auth);
router.post('/crear-preferencia', pagoController.crearPreferencia);
router.get('/mi-suscripcion', pagoController.miSuscripcion);

module.exports = router;
