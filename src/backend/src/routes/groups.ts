import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/groups');
const emailVerified = require('../middlewares/emailVerified');

router.use(auth.access, emailVerified);
router.post('/', controller.createGroup);
router.get('/', controller.getMyGroups);

module.exports = router;
