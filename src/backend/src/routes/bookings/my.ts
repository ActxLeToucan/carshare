import express from 'express';

const router = express.Router();
const controller = require('../../controllers/bookings/my');
const emailVerified = require('../../middlewares/emailVerified');

router.get('/', controller.getMyBookings);
router.post('/', emailVerified, controller.createBooking);
router.delete('/:id', controller.cancelMyBooking);

module.exports = router;
