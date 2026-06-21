const router = require('express').Router();
const ctrl = require('../controllers/buildingController');
const auth = require('../middleware/auth');

router.get('/', auth(), ctrl.getAll);
router.post('/', auth(['admin']), ctrl.create);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;