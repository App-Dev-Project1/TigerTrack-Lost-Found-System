const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin } = require('../controllers/authController');

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

module.exports = router;