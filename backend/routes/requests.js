const router = require('express').Router();
const ctrl = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.post('/', auth(), ctrl.create);
router.get('/', auth(), ctrl.getAll);
router.patch('/:id/status', auth(['employee', 'admin']), ctrl.updateStatus);

router.get('/by-vk/:vkId', ctrl.getByVk);

module.exports = router;