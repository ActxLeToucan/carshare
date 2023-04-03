import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/users');
const admin = require('../middlewares/admin');
const emailVerified = require('../middlewares/emailVerified');

router.use('/me', auth.access, require('./users/me'));
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/password-reset', controller.askForPasswordReset);
router.patch('/password-reset', auth.resetPassword, controller.resetPassword);
router.post('/email-verification', auth.access, controller.askForEmailVerification);
router.patch('/email-verification', auth.verify, controller.emailVerification);
router.get('/search', auth.access, controller.searchUsersPublic);

// admin routes
router.get('/', auth.access, emailVerified, admin, controller.searchUsers);
router.delete('/:id', auth.access, emailVerified, admin, controller.deleteUser);
router.patch('/:id', auth.access, emailVerified, admin, controller.updateUser);

module.exports = router;
