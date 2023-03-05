import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notifications');

router.get('/my', auth.access, controller.myNotifications);
router.delete('/all', auth.access, controller.deleteAllNotification);

module.exports = router;
