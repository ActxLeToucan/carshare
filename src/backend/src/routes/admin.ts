import express from 'express';
const router = express.Router();

const controller = require('../controllers/admin');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/users', auth, admin, controller.users);

module.exports = router;
