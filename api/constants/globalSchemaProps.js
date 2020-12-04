const mongoose = require("mongoose");

module.exports = {
    _id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId() },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
}