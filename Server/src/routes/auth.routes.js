const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
