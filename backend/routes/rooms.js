const router = require('express').Router();
const ctrl = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.get('/', auth(), ctrl.getAll);
router.get('/by-building/:buildingId', auth(), ctrl.getByBuilding);
router.post('/', auth(['admin']), ctrl.create);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;