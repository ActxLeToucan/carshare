import express from 'express';

const router = express.Router();

const controller = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', auth, controller.getMe);
router.delete('/me', auth, controller.deleteMe);
router.patch('/me', auth, controller.updateMe);
router.get('/listroute', auth, controller.routeList);

module.exports = router;
