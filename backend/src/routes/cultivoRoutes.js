const router = require('express').Router();
const { auth } = require('../middleware/auth');
const cultivoController = require('../controllers/cultivoController');
const seguimientoController = require('../controllers/seguimientoController');

router.use(auth);

router.get('/', cultivoController.listar);
router.post('/', cultivoController.crear);
router.get('/dashboard/resumen', cultivoController.resumenDashboard);
router.get('/fotos', seguimientoController.fotosPorRango);
router.get('/:id', cultivoController.obtener);
router.patch('/:id', cultivoController.actualizar);
router.patch('/:id/etapa', cultivoController.cambiarEtapa);
router.delete('/:id', cultivoController.eliminar);

router.get('/:cultivoId/seguimientos', seguimientoController.listarPorCultivo);
router.post('/:cultivoId/seguimientos', seguimientoController.crear);
router.get('/:cultivoId/galeria', seguimientoController.galeriaPorCultivo);
router.get('/:id/consejos', cultivoController.listarConsejos);

module.exports = router;
