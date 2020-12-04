const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth');

// controller
const Controller = require("../controllers/user/index");


// ******** CRUD ROUTES ******** //
// get all users
router.get('/', Auth, Controller.get_users)

// user requests for verification code 
router.post('/:id/verify/request', Controller.request_verification_code)
router.post('/:id/verify/check', Controller.check_verification_code)

// search  user
router.post('/search', Auth, Controller.search_single_user)

// get single user
router.get('/:id', Auth, Controller.get_single_user)


// update user
router.patch('/:id', Auth, Controller.update_single_user)

// delete user
router.delete('/:id', Auth, Controller.delete_single_user)


module.exports = router;