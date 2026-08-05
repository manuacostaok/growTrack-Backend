const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { uploadMemoria } = require('../config/gemini');
const iaController = require('../controllers/iaController');

router.use(auth);

router.post('/diagnostico', uploadMemoria.single('foto'), iaController.diagnosticar);

module.exports = router;
