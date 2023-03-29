import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/travels');
const emailVerified = require('../middlewares/emailVerified');

router.get('/my', auth.access, controller.getMyTravels);
router.get('/search', auth.access, controller.searchTravels);
router.get('/:id', auth.access, emailVerified, controller.getTravel);
router.post('/create', auth.access, emailVerified, controller.createTravel);

router.delete('/my/:id', auth.access, emailVerified, controller.cancelMyTravel); // TODO: à déplacer dans my.ts quand on aura aussi la route de suppression par l'admin

// admin routes
router.get('/', auth.access, controller.getTravels);

module.exports = router;
