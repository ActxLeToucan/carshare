import express from 'express';
import auth from '../../middlewares/auth';

const router = express.Router();
const controller = require('../../controllers/travels/my');
const emailVerified = require('../../middlewares/emailVerified');

router.get('/', auth.access, controller.getMyTravels);
router.delete('/:id', auth.access, emailVerified, controller.cancelMyTravel);
router.patch('/:id/end', auth.access, emailVerified, controller.endMyTravel); // TODO: add doc (+ email verified)
router.patch('/:id', auth.access, emailVerified, controller.updateMyTravel);

module.exports = router;
