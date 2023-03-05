import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/users');

router.use('/me', auth.access, require('./users/me'));
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/password-reset', controller.passwordResetSendEmail);
router.patch('/password-reset', auth.resetPassword, controller.updatePassword);
router.post('/email-verification', auth.access, controller.emailVerificationSendEmail);
router.patch('/email-verification', auth.verify, controller.emailVerification);

module.exports = router;
