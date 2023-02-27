import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/admin');
const admin = require('../middlewares/admin');
const emailVerified = require('../middlewares/emailVerified');

router.get('/users', auth.access, emailVerified, admin, controller.users);
router.delete('/user/:id', auth.access, emailVerified, admin, controller.deleteUser);
router.patch('/user/:id', auth.access, emailVerified, admin, controller.updateUser);

module.exports = router;
