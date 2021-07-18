"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var roomSchema = Schema({
    name: String,
    available: { type: Boolean, default: true },
    price_for_day: Number,
    available_day: { type: Date, default: null},
    typeRoom: {type: String, default: "Habitación Dormitorio"}
});

module.exports = mongoose.model("room", roomSchema);