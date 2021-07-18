"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var hotelSchema = Schema({
    user_admin_hotel: { type: Schema.ObjectId, ref: "user" },
    name: String,
    address: String,
    count_reservations: {type: Number, default: 0},
    country: String,
    image: String,
    rooms: [{ type: Schema.ObjectId, ref: "room" }],
    events: [{ type: Schema.ObjectId, ref: "event" }],
    services: [{type: Schema.ObjectId, ref: "service"}]
});

module.exports = mongoose.model("hotel", hotelSchema);