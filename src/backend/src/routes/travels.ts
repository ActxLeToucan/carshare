import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');
const emailVerified = require('../middlewares/emailVerified');
const admin = require('../middlewares/admin');

router.use('/my', auth.access, require('./travels/my'));
router.get('/search', auth.access, controller.searchTravels);
router.get('/:id', auth.access, controller.getTravel);
router.post('/create', auth.access, emailVerified, controller.createTravel);

// admin routes
router.get('/', auth.access, emailVerified, admin, controller.getTravels);
router.delete('/:id', auth.access, emailVerified, admin, controller.cancelTravel);
router.patch('/:id/end', auth.access, emailVerified, admin, controller.endTravel);
router.patch('/:id', auth.access, emailVerified, admin, controller.updateTravel);

module.exports = router;
