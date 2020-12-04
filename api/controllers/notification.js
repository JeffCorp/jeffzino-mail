const _ = require("lodash");
const mongoose = require("mongoose");
const { hasPermission, genQueryParams } = require("./factory/operations");
const Notif = require("../models/notification");
const { get_all_users } = require("./user");

exports.broadcast = async (req, res, next) => {
    try {
        const { id, meta } = req.userData;
        const { role } = meta;
        const messageId = new mongoose.Types.ObjectId();
        if (!hasPermission(req, "createBroadcast", "send-broadcast")) return res.status(401).json({ message: "You do not have permission to access this resource" })
        if (role.short_name == "ROOT" && (!req.body.demography || !_.isObject(req.body.demography))) throw new Error("A demography must be provided to generate the delivery list")
        if (!req.body.message || !_.isObject(req.body.message)) throw new Error("A message object is required")
        req.query = { ...req.query, $include: 'meta', $limit: Math.pow(10, 10) } // remember to increase limit
        get_all_users(req, (response, error) => {
            const { users } = response;
            if (error == null) {
                let deliveryList = [], messages = [];
                // if user is a root admin perform filter for demography
                if (role.short_name == "ROOT") {
                    // for each user, check if they meet any of the demography criteria
                    _.forEach(users, function (user) {
                        const userMeta = user.meta;
                        _.forEach(req.body.demography, function (value, key) {
                            if (_.isArray(value)) {
                                if (_.find(value, function (v) { return v == userMeta[key] })) deliveryList.push(user.id)
                            } else if (_.isString(value)) {
                                if (userMeta[key] == value) deliveryList.push(user.id)
                            }
                        })
                    })
                } else {
                    // populate delivery list with every user
                    deliveryList = _.map(users, function (user) { return user.id })
                }
                deliveryList = _.uniq(deliveryList); // remove duplicate entries
                // compile message for each user
                _.forEach(deliveryList, function (entry) {
                    messages.push(
                        new Notif({
                            _id: new mongoose.Types.ObjectId(),
                            messageId: messageId,
                            createdBy: id,
                            user: entry,
                            demography: req.body.demography,
                            ...req.body.message
                        })
                    )
                })
                // create entries
                Notif.insertMany(messages).then(response => {
                    return res.status(200).json({ message: `Broadcast message sent to ${_.size(deliveryList)} users` });
                }).catch(error => {
                    console.error(error);
                    return res.status(500).json({
                        error: error
                    })
                })
            } else {
                console.error(error);
                return res.status(500).json({
                    error: error
                })
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        })
    }
}

exports.fetch_messages = (req, res, next) => {
    try {
        const { id, meta } = req.userData;
        genQueryParams(
            'notifications',
            { user: id },
            req,
            (results) => {
                const { query, options } = results;
                Notif.paginate(query, options).then(notifications => {
                    return res.status(200).json({
                        ...notifications
                    })
                }).catch(error => {
                    console.error(error)
                    return res.status(500).json({
                        error: error
                    })
                })
            })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.recall_messages = (req, res, next) => {
    try {
        const { id, meta } = req.userData;
        if (!hasPermission(req, "recallBroadcast", "recall-broadcast")) return res.status(401).json({ message: "You do not have permission to access this resource" })
        Notif.deleteMany({ messageId: req.params.message_id })
            .exec().then(doc => {
                res.status(200).json({
                    message: `All broadcasts with message id ${req.params.message_id} have been recalled`
                });
            }).catch(error => {
                console.error(error);
                res.status(500).json({ message: error })
            })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        })
    }
}