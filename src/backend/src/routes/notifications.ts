import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notifications');

router.get('/my', auth.access, controller.getMyNotifications);
router.delete('/all', auth.access, controller.deleteAllNotifications);
router.delete('/:id', auth.access, controller.deleteOneNotification);

module.exports = router;
