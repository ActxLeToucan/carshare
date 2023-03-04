import express from 'express';

const router = express.Router();

const controller = require('../controllers/admin');
router.get('/users', controller.getAllUsers);
router.delete('/user/:id', controller.deleteUser);
router.patch('/user/:id', controller.updateUser);

module.exports = router;
