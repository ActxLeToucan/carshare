import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');

router.get('/my', auth.access, controller.getMyTravels);
router.post('/create', auth.access, controller.createTravel);
router.get('/search', auth.access, controller.searchTravels);
router.patch('/cancel', auth.access, controller.cancelTravel);

module.exports = router;
