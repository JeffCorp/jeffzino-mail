const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth');

// controller
const NotifController = require("../controllers/notification");

// send a broadcast message
router.post('/broadcast', Auth, NotifController.broadcast);
// users fetch broadcast
router.get('/fetch', Auth, NotifController.fetch_messages);
// admin recall broadcast
router.post('/:message_id/recall', Auth, NotifController.recall_messages);

module.exports = router;