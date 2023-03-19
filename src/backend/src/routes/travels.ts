import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');

router.use('/my', auth.access, require('./travels/my'));
router.post('/create', auth.access, controller.createTravel);
router.get('/search', auth.access, controller.searchTravels);

// admin routes
router.get('/', auth.access, controller.getTravels);

module.exports = router;
