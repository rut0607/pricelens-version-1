const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');
const { validateAnalysis } = require('../middleware/validation');

// All analysis routes require authentication
router.use(authenticate);

// Create new analysis
router.post('/create', validateAnalysis, AnalysisController.createAnalysis);

// Preview analysis (without saving)
router.post('/preview', validateAnalysis, AnalysisController.previewAnalysis);

// Get all analyses
router.get('/all', AnalysisController.getUserAnalyses);

// Get single analysis
router.get('/:id', AnalysisController.getAnalysisById);

// Delete analysis
router.delete('/:id', AnalysisController.deleteAnalysis);

// Compare analyses
router.post('/compare', AnalysisController.compareAnalyses);

module.exports = router;