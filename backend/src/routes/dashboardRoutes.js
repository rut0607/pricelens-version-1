const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard overview
router.get('/overview', DashboardController.getDashboardStats);

// Get trends
router.get('/trends', DashboardController.getTrends);

module.exports = router;