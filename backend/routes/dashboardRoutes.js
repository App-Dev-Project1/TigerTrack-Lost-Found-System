const express = require('express');
const router = express.Router();
const { getSummaryStats } = require('../controllers/dashboardController');

router.get('/stats', getSummaryStats);

module.exports = router;