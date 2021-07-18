"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var reservationSchema = Schema({
    user: { type: Schema.ObjectId, ref: "user" },
    hotel: { type: Schema.ObjectId, ref: "hotel" },
    room: { type: Schema.ObjectId, ref: "room" },
    start_date: Date,
    end_date: Date,
    services: [{ type: Schema.ObjectId, ref: "service" }],
    events: { type: Schema.ObjectId, ref: "event" },
    total_price: Number,
    status: { type: Boolean, default: true },
});

module.exports = mongoose.model("reservation", reservationSchema);