const router = require('express').Router();
const dbController = require('../controllers/db.controller');

router.get('/', dbController.healthCheck);
router.get('/stats', dbController.getStats);

module.exports = router;
