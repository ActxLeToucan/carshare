import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/groups');
const emailVerified = require('../middlewares/emailVerified');
const admin = require('../middlewares/admin');

router.post('/my', auth.access, emailVerified, controller.createGroup);
router.get('/my', auth.access, controller.getMyGroups);
router.delete('/my/:id', auth.access, emailVerified, controller.deleteMyGroup);
router.patch('/my/:id', auth.access, emailVerified, controller.updateMyGroup);
router.post('/:id/member', auth.access, emailVerified, controller.addUserGroup);
router.delete('/:id/member', auth.access, emailVerified, controller.removeUserGroup);

// admin routes
router.get('/', auth.access, emailVerified, admin, controller.searchGroups);
router.patch('/:id', auth.access, emailVerified, admin, controller.updateGroup);
router.delete('/:id', auth.access, emailVerified, admin, controller.deleteGroup);
module.exports = router;
