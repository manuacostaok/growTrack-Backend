const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.post('/event', analyticsController.registrar); // pública, la llama la landing

router.get('/resumen', auth, checkRole('admin'), analyticsController.resumen);

module.exports = router;
