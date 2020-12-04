const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../../models/user');
const mongoose = require("mongoose");
const { ROLES } = require("../../constants/enums");

exports.user_sign_up = (req, res, next) => {
    try {
        const { role, country, state } = req.userData.meta;
        // validation
        if (!req.body.role) throw new Error("A Role must be specified");
        if (role.short_name !== ROLES.ROOT) {
            if (!req.body.country) throw new Error("The user must belong to a country");
            if (!req.body.state) throw new Error("Please select a state for the selected country");
        }
        // check if user exists
        User.find({ email: req.body.email, phone: req.body.phone })
            .exec()
            .then(user => {
                if (_.size(user) >= 1) {
                    return res.status(409).json({
                        message: "A user already exists with the same email or phone number"
                    })
                } else {
                    // create user account
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        } else {
                            const body = req.body;
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                ...body,
                                email: req.body.email,
                                password: hash,

                            });
                            user.save()
                                .then(result => {
                                    console.log(result);
                                    // create user's meta data
                                    const payload = {
                                        role: role.short_name == ROLES.ROOT ? req.body.role : req.body.role.short_name !== ROLES.ROOT ? req.body.role : role,
                                        country: role.short_name == ROLES.ROOT ?
                                            req.body.country : country,
                                        state: role.short_name == ROLES.ROOT ?
                                            req.body.state : state,
                                    }
                                        return res.status(200).json({
                                            message: "User created successfully"
                                    })
                                })
                                .catch(error => {
                                    console.error(error);
                                    return res.status(500).json({ message: error });
                                })
                        }
                    })
                }
            })
    } catch (_error) {
        console.error(_error);
        return res.status(500).json({ message: _error.message });
    }
}

exports.user_login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .populate('meta')
        .exec()
        .then(user => {
            if (!user) return res.status(401).json({ message: "Auth failed" })
            // validate password
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err || !result) {
                    return res.status(401).json({
                        message: "Auth failed"
                    })
                }
                if (result) {
                    token = jwt.sign({
                        email: user.email,
                        id: user._id,
                        meta: user.meta
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "5h"
                        }
                    );
                    // remove password field from user
                    user = { ...user._doc, password: null };
                    // check user account verification
                    if (!user.accountVerified && user.meta.role.short_name !== ROLES.ROOT) return res.status(401).json({
                        status: 401,
                        message: `Your account has not been verified. Kindly verify your account using the OTP sent to ${user.meta.role == ROLES.US ? user.phone : user.email}`
                    })
                    return res.status(200).json({
                        status: 200,
                        message: "Auth Successful",
                        token,
                        user: user
                    })
                }
            })
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: error || error.message });
        })
}

exports.user_mobile_sign_up = (req, res, next) => {
    try {
        // validation
        if (!req.body.name) throw new Error("Please provide your full name")
        if (!req.body.phone) throw new Error("Kindly provide your phone number")
        if (!req.body.gender) throw new Error("Kindly provide your gender")
        if (!req.body.dob) throw new Error("Kindly provide a valid date of birth")
        if (!req.body.country) throw new Error("Kindly select a country");
        if (!req.body.state) throw new Error("Please select a state for the selected country");
        // check if user exists
        User.find({ email: req.body.email, phone: req.body.phone })
            .exec()
            .then(user => {
                if (_.size(user) >= 1) {
                    return res.status(409).json({
                        message: "A user already exists with the same email or phone number"
                    })
                } else {
                    // create user account
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        } else {
                            const body = req.body;
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                ...body,
                                email: req.body.email,
                                password: hash,
                            });
                            user.save()
                                .then(result => {
                                    console.log(result);
                                    // create user's meta data
                                    const payload = {
                                        role: ROLES.US,
                                        country: req.body.country,
                                        state: req.body.state,
                                    }
                                        return res.status(200).json({
                                            message: "User created successfully"
                                        })
                                })
                                .catch(error => {
                                    console.error(error);
                                    return res.status(500).json({ message: error });
                                })
                        }
                    })
                }
            })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error || error.message });
    }
}