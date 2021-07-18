"use strict";

const express = require("express");
const serviceController = require("../controllers/service-controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.post(
    "/createService/:idH", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.createServices
);

api.get("/getServices", [mdAuth.ensureUser], serviceController.getServices);

api.get(
    "/getService/:id", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.getService
);

api.put(
    "/updateService/:id", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.updateService
);

api.delete(
    "/deleteService/:id", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.deleteService
);
api.put(
    "/:idR/setServiceReservation/:idS", [mdAuth.ensureUser],
    serviceController.setServiceReservation
);
api.put(
    "/createServiceByHotelAdmin", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.createServiceByHotelAdmin
);
api.get(
    "/getServicesHotel", [mdAuth.ensureUser, mdAuth.ensureAdminHotel],
    serviceController.getServicesHotel
);

module.exports = api;