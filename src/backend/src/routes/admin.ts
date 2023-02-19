import express from 'express';
const router = express.Router();

const controller = require('../controllers/admin');

router.get('/users', controller.users);

module.exports = router;
