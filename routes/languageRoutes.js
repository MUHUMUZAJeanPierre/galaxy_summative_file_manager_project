// file: routes/languageRoutes.js
const express = require('express');
const { switchLanguage } = require('../controllers/languageController');

const router = express.Router();

// Endpoint to manually switch language
router.post('/switch', switchLanguage);

module.exports = router;