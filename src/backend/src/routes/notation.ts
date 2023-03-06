import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();
const controller = require('../controllers/notation');

router.get('/:id', auth.access, controller.getUserEvaluation);



module.exports = router;
