import express from 'express';

const router = express.Router();

const controller = require('../controllers/docs');

router.get('/', controller.getDocs);
router.get('/yaml', controller.getDocsYaml);

module.exports = router;
