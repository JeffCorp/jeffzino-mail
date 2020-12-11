const express = require('express');
const router = express.Router();

// controller
const Controller = require("../controllers/mail/sendMail");

router.post("/send", Controller.send_mail);

module.exports = router;