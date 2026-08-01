const router = require('express').Router();
const { auth } = require('../middleware/auth');
const conocimientoController = require('../controllers/conocimientoController');

router.use(auth);

router.get('/', conocimientoController.listar);
router.get('/:id', conocimientoController.obtener);

module.exports = router;
