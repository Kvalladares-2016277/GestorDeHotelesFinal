"use strict";

const express = require("express");
const hotelController = require("../controllers/hotel-controller");
const mdAuth = require("../middlewares/authenticated");

let api = express.Router();

api.post(
    "/createHotel", [mdAuth.ensureUser, mdAuth.ensureAdmin],
    hotelController.createHotel
);
api.get("/getHotels", hotelController.getHotels);
api.get(
    "/getHotel/:idH", [mdAuth.ensureUser],
    hotelController.getHotel
);
api.post(
    "/updateHotel/:idH", [mdAuth.ensureUser, mdAuth.ensureAdmin],
    hotelController.updateHotel
);
api.delete(
    "/:idU/deleteHotel/:idH", [mdAuth.ensureUser, mdAuth.ensureAdmin],
    hotelController.deleteHotel
);
api.get(
    "/getHotelsnames", [mdAuth.ensureUser, mdAuth.ensureAdminOrAdminHotel],
    hotelController.getHotelsnames
);
api.get(
    "/getHotelBydAdminHotelID", [mdAuth.ensureUser, mdAuth.ensureAdminOrAdminHotel],
    hotelController.getHotelBydAdminHotelID
);
api.get(
    "/getHotelsVisited", [mdAuth.ensureUser],
    hotelController.getHotelsVisited
);

api.get("/getHotelsRecomendations", hotelController.getHotelsRecomendations);

api.get(
    "/getRoomsByHotel/:idH", [mdAuth.ensureUser],
    hotelController.getRoomsByHotel
);

module.exports = api;