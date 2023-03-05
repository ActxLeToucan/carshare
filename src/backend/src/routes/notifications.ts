import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notifications');

router.get('/my', auth.access, controller.myNotifications);

module.exports = router;
