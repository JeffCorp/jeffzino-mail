const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth');

// controller
const GuardController = require("../controllers/user/guard");

// ******* AUTH ROUTES ******** //
// admin registers new admin user
router.post('/register', Auth, GuardController.user_sign_up);

// login
router.post('/login', GuardController.user_login);

// user sign up from mobile app
router.post('/signup', GuardController.user_mobile_sign_up)

module.exports = router;