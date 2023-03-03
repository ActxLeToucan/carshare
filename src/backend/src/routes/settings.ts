import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/settings');
router.get('/notifications', auth.access, controller.getSettingsNotifications);
router.patch('/notifications', auth.access, controller.updateSettingsNotifications);

module.exports = router;
