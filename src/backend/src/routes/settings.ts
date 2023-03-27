import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/settings');

router.get('/', auth.access, controller.getSettings);
router.patch('/', auth.access, controller.updateSettings);

module.exports = router;
