import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notations');

router.get('/travels', auth.access, controller.getAverageTravel);
router.get('/:id', auth.access, controller.getUserEvaluation);
router.post('/my', auth.access, controller.createEvaluation);


module.exports = router;
