const User = require('../../models/user');
const _ = require("lodash");
const { ROLES } = require("../../constants/enums");
const { genQueryParams } = require('../factory/operations');
const { email_regex, phone_regex } = require('../../constants/expressions');
const smpp = require('smpp');

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY || "8b18523e",
    apiSecret: process.env.NEXMO_API_SECRET || "j3p6D3ahfYiwLSiI"
});

// exports.get_all_users = (req, callback) => {
//     const { id, meta } = req.userData;
//     const { role, country, state } = meta;
//     let path, searchBy;
//     switch (role.short_name) {
//         case ROLES.ROOT:
//             const { filterBy, roleName, shortName } = req.query;
//             path = (filterBy && filterBy == 'role') ? {
//                 $or: [{ role: { name: roleName, short_name: shortName } }]
//             } : null;
//             searchBy = "Global"
//             break;
//         case ROLES.CA: // country admin
//             searchBy = "Country";
//             path = {
//                 $or: [{ country: country }]
//             }
//             break;
//         default: // other admin users
//             searchBy = "State";
//             path = {
//                 $or: [{ state: state }]
//             }
//             break;
//     }
//     genQueryParams(
//         'users',
//         path,
//         req,
//         (results) => {
//             let { query, options } = results;
//             options = {
//                 ...options,
//                 populate: ['country', 'state', 'user'],
//                 select: [role.short_name == ROLES.US ? '-permissions' : '']
//             }
//             Meta.paginate(query, options).then(response => {
//                 // create user array from response
//                 const users = response.users.map(entry => {
//                     return {
//                         ...entry.user,
//                         id: entry.user._id,
//                         password: null,
//                         meta: {
//                             ...entry,
//                             user: entry.user._id
//                         },
//                     }
//                 })
//                 response = { ...response, users };
//                 if (callback) return callback({ ...response, message: `Fetched users based on ${searchBy} search` }, null);
//             }).catch(error => {
//                 console.error(error);
//                 if (callback) return callback({ error: error }, null);
//             })
//         })
// }

exports.get_users = (req, res, next) => { // get all users base on admin level
    this.get_all_users(req, (response, error) => {
        if (error == null) {
            return res.status(200).json(response);
        } else {
            return res.status(500).json(error)
        }
    })
};

exports.get_single_user = (req, res, next) => { // get single user
    const id = req.params.id;
    User.findById(id)
        .select("-password")
        .populate(_.find(req.query, function (query, index) { return (index == '$include') }))
        .exec().then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: "User not found"
                })
            }
        }).catch(error => {
            console.error(error);
            res.status(500).json({ message: error })
        })
};


exports.search_single_user = (req, res, next) => { // search single user
    const { email, phone } = req.body;
    try {
        let query = [];
        if (email && !email_regex.test(email)) throw new Error("Invalid email address format");
        if (phone && !phone_regex.test(phone)) throw new Error("Invalid phone number format");
        if (email) query.push({ ...query, email })
        if (phone) query.push({ ...query, phone })
        User.find({ $or: query })
            .select("-password")
            .populate(_.find(req.query, function (query, index) { return (index == '$include') }))
            .exec().then(doc => {
                if (doc) {
                    res.status(200).json(doc);
                } else {
                    res.status(404).json({
                        message: "User not found"
                    })
                }
            }).catch(error => {
                console.error(error);
                res.status(500).json({ message: error })
            })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};


exports.update_single_user = (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    // dynamically generate an object with only the properties that
    // were passed for updating the user
    _.forEach(req.body, function (val, index) {
        updateOps[index] = val
    })
    User.update({ _id: id }, { $set: updateOps }).exec()
        .then(() => {
            res.status(200).json({ message: "User updated successfully" })
        }).catch(error => {
            console.error(error);
            res.status(500).json({ message: error })
        })
};

exports.delete_single_user = (req, res, next) => {
    const id = req.params.id;
    User.remove({ _id: id }).exec().then(result => {
        res.status(200).json({ message: "User deleted successfully" })
    }).catch(error => {
        console.error(error);
        res.status(500).json({ message: error })
    })
};



// *********** USER VERIFICATION **************
exports.request_verification_code = (req, res, next) => {
    const { id } = req.params;
    try {
        const session = smpp.connect('smpp://164.177.157.232:9022');
        if (!req.body.phone) throw new Error("Please provide a phone number")
        User.findById(id)
            .populate(_.find(req.query, function (query, index) { return (index == '$include') }))
            .exec().then(doc => {
                if (doc) {
                    return doc;
                } else {
                    res.status(404).json({
                        message: "User profile not found"
                    })
                }
            }).then(response => {
                const user = response._doc;
                const phone = req.body.phone;
                // ensure that phone number sent matches user's phone no. in record
                if (user.phone !== phone) return res.status(500).json({ message: "Phone number mismatch" });

                var isConnected = false
                session.on('connect', () => {
                    console.log("SMPP CONNECTED")
                    this.isConnected = true;
                    // bind transciever
                    session.bind_transceiver({
                        system_id: 'EFULTRX',
                        password: 'VsZ501w8',
                        interface_version: '3.4',
                        system_type: 'EFULTRX',//'380666000600',
                        address_range: '+380666000600',
                        addr_ton: 1,
                        addr_npi: 1,
                    }, (pdu) => {
                        if (pdu.command_status == 0) {
                            console.log('Successfully bound')
                        }

                    })
                });

                session.on('close', () => {
                    console.log('smpp is now disconnected')

                    if (isConnected) {
                        session.connect();    //reconnect again
                    }
                })

                session.on('error', error => {
                    console.log('smpp error', error)
                    isConnected = false;
                });

                session.submit_sm({
                    source_addr: 'IAM',
                    destination_addr: '2348147757475',
                    short_message: 'text to go'
                }, function (pdu) {
                    if (pdu.command_status == 0) {
                        // Message successfully sent
                        console.log(pdu.message_id);
                        res.status(200).json({ message: "Message sent", pdu })
                    } else {
                        console.log(pdu);
                        res.status(500).json({ message: "Error sending message", pdu })
                    }
                });
                // create OTP request
                // const sender = new SMPP();
                // sender.sendSMS('23480001234', '2348147757475', 'Hello Lagos!!!', (result, err) => {
                //     if (err) {
                //         console.error(err);
                //         res.status(500).json({ message: err })
                //     } else {
                //         return res.status(200).json({
                //             result,
                //             phone: phone
                //         })
                //     }
                // })
                // nexmo.verify.request({
                //     number: "2348147757475",
                //     brand: process.env.APP_NAME || "Contact tracing"
                // }, (err, result) => {
                //     if (err) {
                //         console.error(err);
                //         res.status(500).json({ message: err })
                //     } else {
                //         return res.status(200).json({
                //             result,
                //             phone: phone
                //         })
                //     }
                // });
            }).catch(error => {
                console.error(error);
                res.status(500).json({ message: error })
            })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
}


exports.check_verification_code = (req, res, next) => {
    try {
        if (!req.body.requestId) throw new Error("Please provide a request id")
        if (!req.body.code) throw new Error("Please provide a valid OTP")
        const { id } = req.params;
        User.findById(id)
            .populate(_.find(req.query, function (query, index) { return (index == '$include') }))
            .exec().then(doc => {
                if (doc) {
                    return doc;
                } else {
                    res.status(404).json({
                        message: "User profile not found"
                    })
                }
            }).then(response => {
                // verify OTP
                nexmo.verify.check({
                    request_id: req.body.requestId,
                    code: req.body.code
                }, (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: err })
                    } else {
                        User.update({ _id: id }, { $set: { accountVerified: true } }).exec()
                            .then(() => {
                                console.log(result);
                                res.status(200).json({ message: "Account verified successfully", result })
                            }).catch(error => {
                                console.error(error);
                                res.status(500).json({ message: error })
                            })
                    }
                });
            }).catch(error => {
                console.error(error);
                res.status(500).json({ message: error })
            })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
}