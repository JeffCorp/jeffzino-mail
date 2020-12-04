const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const globalSchemaProps = require("../constants/globalSchemaProps")

const notifSchema = mongoose.Schema({
    ...globalSchemaProps,
    messageId: { type: mongoose.Schema.Types.ObjectId },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messageBody: { type: String, required: true },
    externalLink: { type: String },
    attachment: { type: Object },
    seen: { type: Boolean, default: false },
    demography: {
        country: [{ type: mongoose.Schema.Types.ObjectId, ref: "Country" }] || { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
        state: [{ type: mongoose.Schema.Types.ObjectId, ref: "State" }] || { type: mongoose.Schema.Types.ObjectId, ref: "State" }
    }
});

notifSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Notification', notifSchema);