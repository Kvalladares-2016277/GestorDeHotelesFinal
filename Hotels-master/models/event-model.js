"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventSchema = Schema({
    name: String,
    // start_date: Date,
    // end_date: Date,
    type_of_event: {type: String, default: "Private"},
    price_event: Number,
});

module.exports = mongoose.model("event", eventSchema);