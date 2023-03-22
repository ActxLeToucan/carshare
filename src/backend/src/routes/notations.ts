import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notations');

router.get('/travels', auth.access, controller.getAverageTravel);
router.get('/average/:id', auth.access, controller.getUserEvaluation);
router.delete('/:id', auth.access, controller.deleteEvaluation);

module.exports = router;
