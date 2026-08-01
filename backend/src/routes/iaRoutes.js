const router = require('express').Router();
const { auth, checkPlan } = require('../middleware/auth');
const { uploadMemoria } = require('../config/anthropic');
const iaController = require('../controllers/iaController');

router.use(auth, checkPlan('pro', 'premium'));

router.post('/diagnostico', uploadMemoria.single('foto'), iaController.diagnosticar);

module.exports = router;
