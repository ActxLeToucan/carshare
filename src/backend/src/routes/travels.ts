import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');
const emailVerified = require('../middlewares/emailVerified');

router.use('/my', auth.access, require('./travels/my'));
router.get('/search', auth.access, controller.searchTravels);
router.get('/:id', auth.access, emailVerified, controller.getTravel);
router.post('/create', auth.access, emailVerified, controller.createTravel);

// admin routes
router.get('/', auth.access, controller.getTravels);

module.exports = router;
