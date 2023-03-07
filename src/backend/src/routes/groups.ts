import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/groups');
const emailVerified = require('../middlewares/emailVerified');

router.use(auth.access, emailVerified);
router.post('/my', controller.createGroup);
router.get('/my', controller.getMyGroups);

module.exports = router;
