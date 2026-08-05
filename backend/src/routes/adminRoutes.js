const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(auth, checkRole('admin'));

router.get('/usuarios', adminController.listarUsuarios);
router.patch('/usuarios/:id/plan', adminController.cambiarPlanUsuario);
router.get('/metricas', adminController.metricas);
router.get('/feedback', adminController.listarFeedback);

module.exports = router;
