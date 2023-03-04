import express from 'express';

const router = express.Router();

const controller = require('../../controllers/users/me');
const usersController = require('../../controllers/users');
router.get('/', controller.getMe);
router.delete('/', controller.deleteMe);
router.patch('/', controller.updateMe);
router.patch('/password', usersController.updatePassword);

module.exports = router;
