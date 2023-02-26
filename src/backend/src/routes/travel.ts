import express from 'express';

import auth from '../middlewares/auth';

const router = express.Router();

const controller = require('../controllers/travel');
router.get('/listroute', auth.access, controller.routeList);

module.exports = router;
