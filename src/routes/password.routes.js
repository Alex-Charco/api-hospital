const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');

router.post('/request-password-reset', passwordController.requestPasswordReset);
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;
