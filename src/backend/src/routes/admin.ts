import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/admin');
const admin = require('../middlewares/admin');
const emailVerified = require('../middlewares/emailVerified');

router.use(auth.access, emailVerified, admin);
router.get('/users', controller.getAllUsers);
router.delete('/user/:id', controller.deleteUser);
router.patch('/user/:id', controller.updateUser);

module.exports = router;
