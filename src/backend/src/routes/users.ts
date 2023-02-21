import express from 'express';

import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/users');
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', auth.access, controller.getMe);
router.delete('/me', auth.access, controller.deleteMe);
router.patch('/me', auth.access, controller.updateMe);
router.post('/password-reset', controller.passwordResetSendEmail);
router.patch('/password-reset', auth.resetPassword, controller.passwordReset);

module.exports = router;
