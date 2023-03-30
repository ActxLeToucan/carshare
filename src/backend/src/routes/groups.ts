import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/groups');
const emailVerified = require('../middlewares/emailVerified');
const admin = require('../middlewares/admin');

router.post('/my', auth.access, emailVerified, controller.createGroup);
router.get('/my', auth.access, emailVerified, controller.getMyGroups);
router.patch('/:id/name', auth.access, emailVerified, controller.modifyNameGroup);

// admin routes
router.get('/', auth.access, emailVerified, admin, controller.searchGroups);
router.delete('/:id', auth.access, emailVerified, admin, controller.deleteGroup);
module.exports = router;
