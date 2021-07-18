"use strict";

const express = require("express");
const roomController = require("../controllers/room-controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.post(
    "/createRoom/:idH", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.createRoom
);
api.get("/getRooms", [mdAuth.ensureUser], roomController.getRooms);
api.get(
    "/getRoom/:idR", [mdAuth.ensureUser],
    roomController.getRoom
);
api.get(
    "/getRoomByAdminHotel/:idR", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.getRoomByAdminHotel
);
api.post(
    "/updateRoom/:idR", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.updateRoom
);
api.put(
    "/deleteRoom/:idR", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.deleteRoom
);
api.get(
    "/getRoomsByHotelAdmin", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.getRoomsByHotelAdmin
);
api.get(
    "/getRoomsEvent", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    roomController.getRoomsEvent
);

module.exports = api;