const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const globalSchemaProps = require("../constants/globalSchemaProps")

const userSchema = mongoose.Schema({
    ...globalSchemaProps,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    },
    username: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[\+]?[(]?[0-9]{9,13}[)]?$/
    },
    meta: { type: mongoose.Schema.Types.ObjectId, ref: 'UserMetaData' },
    profilePhotoUrl: String,
    accountVerified: { type: Boolean, default: false },
});

userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', userSchema);