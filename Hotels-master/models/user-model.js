"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    lastname: String,
    image: String,
    role: {type: String, default: "ROLE_CLIENT"},
    reservations: [{type: Schema.ObjectId, ref: "reservation"}],
    history_hotels: [{type: Schema.ObjectId, ref: "hotel"}]
});

module.exports = mongoose.model("user",userSchema);