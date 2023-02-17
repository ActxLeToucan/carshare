import express from 'express';
const router = express.Router();

const controller = require('../controllers/users');

router.post('/signup', controller.signup);

module.exports = router;