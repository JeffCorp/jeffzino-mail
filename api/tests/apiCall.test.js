const Axios = require("axios");
const latitude = "6.6019006";
const longitude = "3.4162416";
const OPEN_CAGE_API_KEY = "e761e672a3144cd8a6d7aa9198f720fb";
const mongoose = require("mongoose");
const Country = require("../models/country")
const State = require("../models/state")

Axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${OPEN_CAGE_API_KEY}`)
    .then(async res => {
        const response = res.data;
        const geoData = response.results[0];
        return geoData;
    }).then(geoData => {
        if (geoData.components) {
            const { country, state } = geoData.components;
            let __COUNTRY = null, __STATE = null;
            // get country and state
            console.log(country.toLocaleUpperCase())
            Country.findOne({ name: country.toLocaleUpperCase() })
                .exec()
                .then(_country => {
                    console.log("CNT", _country)
                    if (_country) __COUNTRY = _country._id
                }).catch(error => {
                    console.error(error)
                })
            console.log("GEO DATA", __COUNTRY + " " + state)
        }
    })
    .catch(error => {
        console.error(error)
        res.status(500).json({
            error: error
        })
    })