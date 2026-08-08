const router = require('express').Router();
const { auth, checkPlan } = require('../middleware/auth');
const pushController = require('../controllers/pushController');

router.use(auth);

router.get('/public-key', pushController.publicKey);
router.post('/suscribir', checkPlan('pro', 'premium'), pushController.suscribir);
router.post('/desuscribir', pushController.desuscribir);

module.exports = router;
