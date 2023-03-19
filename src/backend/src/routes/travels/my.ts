import express from 'express';

const router = express.Router();
const controller = require('../../controllers/travels/my');

router.get('/driver', controller.getMyTravelsAsDriver);
router.get('/passenger', controller.getMyTravelsAsPassenger);

module.exports = router;
