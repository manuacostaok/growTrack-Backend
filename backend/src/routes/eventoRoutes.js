const router = require('express').Router();
const { auth } = require('../middleware/auth');
const eventoController = require('../controllers/eventoController');

router.use(auth);

router.get('/', eventoController.listar);
router.post('/', eventoController.crear);
router.patch('/:id', eventoController.actualizar);
router.delete('/:id', eventoController.eliminar);

module.exports = router;
