"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var invoiceSchema = Schema({
    start_date: Date,
    end_date: Date,
    total_price: Number,
    user: {type: Schema.ObjectId, ref:"user"},
    hotel: {type: Schema.ObjectId, ref:"hotel"},
    room: {type: Schema.ObjectId, ref:"room"},
    services: [{type: Schema.ObjectId, ref:"service"}],
    events: {type: Schema.ObjectId, ref:"event"}
});

module.exports = mongoose.model("invoice",invoiceSchema);