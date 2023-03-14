import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/settings');

router.use(auth.access);
router.get('/notifications', controller.getSettingsNotifications);
router.patch('/notifications', controller.updateSettingsNotifications);

module.exports = router;
