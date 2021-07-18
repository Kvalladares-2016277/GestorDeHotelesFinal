"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var serviceSchema = Schema({
    name: String,
    price_service: Number
});

module.exports = mongoose.model("service",serviceSchema);