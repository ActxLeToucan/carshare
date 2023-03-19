import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');
const emailVerified = require('../middlewares/emailVerified');

router.get('/my', auth.access, controller.getMyTravels);
router.get('/search', auth.access, controller.searchTravels);
router.post('/create', auth.access, emailVerified, controller.createTravel);
router.delete('/:id', auth.access, emailVerified, controller.cancelTravel);

module.exports = router;
