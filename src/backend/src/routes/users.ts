import express from 'express';

const router = express.Router();

const controller = require('../controllers/users');

router.post('/signup', controller.signup);
router.post('/login', controller.login);

module.exports = router;
