"use strict";

const express = require("express");
const reservationController = require("../controllers/reservation-controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.get("/pruebaReservation", reservationController.prueba);
api.post(
    "/:idH/setReservation/:idU/:idR", [mdAuth.ensureUser],
    reservationController.setReservation
);
api.put(
    "/cancelReservation/:idRes", [mdAuth.ensureUser],
    reservationController.cancelReservation
);
api.get(
    "/getReservationsByHotelAdmin", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    reservationController.getReservationsByHotelAdmin
);
api.get(
    "/getReservationsByUser", [mdAuth.ensureUser],
    reservationController.getReservationsByUser
);

module.exports = api;