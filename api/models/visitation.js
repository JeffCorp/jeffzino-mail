const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const globalSchemaProps = require("../constants/globalSchemaProps")

const visitationSchema = mongoose.Schema({
    ...globalSchemaProps,
    altitude: String,
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    dateTime: { type: Date, default: Date.now() },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
    geoData: Object,
});
visitationSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Visitation', visitationSchema);
