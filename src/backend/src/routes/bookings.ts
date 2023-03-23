import auth from '../middlewares/auth';
import express from 'express';

const router = express.Router();
const controller = require('../controllers/bookings');
const emailVerified = require('../middlewares/emailVerified');

router.post('/create', auth.access, emailVerified, controller.createBooking);
router.patch('/:id/accept', auth.access, emailVerified, controller.acceptBooking);
router.patch('/:id/reject', auth.access, emailVerified, controller.rejectBooking);

module.exports = router;
