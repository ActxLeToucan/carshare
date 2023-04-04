import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notations');

router.get('/travels', auth.access, controller.getAverageTravel);
router.post('/my', auth.access, controller.createEvaluation);
router.get('/my', auth.access, controller.getEvaluation);
router.get('/average/:id', auth.access, controller.getUserEvaluation);
router.patch('/:id', auth.access, controller.editEvaluation)
router.delete('/:id', auth.access, controller.deleteEvaluation);

module.exports = router;
