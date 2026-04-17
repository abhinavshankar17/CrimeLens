const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(authMiddleware);

router.post('/analyze', upload.single('image'), analysisController.analyze);
router.post('/monitor', upload.single('image'), analysisController.monitor);
router.get('/', analysisController.getAnalyses);

router.get('/stats', analysisController.getStats);
router.get('/patterns', analysisController.getPatterns);
router.get('/:id', analysisController.getAnalysisById);

module.exports = router;
