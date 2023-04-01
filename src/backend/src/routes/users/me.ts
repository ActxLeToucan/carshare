import express from 'express';

const router = express.Router();
const controller = require('../../controllers/users/me');

router.get('/', controller.getMe);
router.delete('/', controller.deleteMe);
router.patch('/', controller.updateMe);
router.patch('/password', controller.updateMyPassword);

module.exports = router;
