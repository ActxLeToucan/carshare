import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/admin');
const admin = require('../middlewares/admin');

router.get('/users', auth.access, admin, controller.users);

module.exports = router;
