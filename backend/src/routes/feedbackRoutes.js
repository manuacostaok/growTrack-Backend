const router = require('express').Router();
const { auth } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

router.use(auth);

router.post('/', feedbackController.crear);

module.exports = router;
