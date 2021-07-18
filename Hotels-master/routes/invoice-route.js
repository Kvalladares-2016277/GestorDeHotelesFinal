"use strict"

const express = require("express");
const invoiceController = require("../controllers/invoice-controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.get("/pruebaInvoice", invoiceController.prueba);
api.post("/createInvoice/:idR",[mdAuth.ensureUser, mdAuth.ensureAdminHotel], invoiceController.createInvoice);
api.get("/getInvoicesByHotelAdmin",[mdAuth.ensureUser,mdAuth.ensureAdminHotel],invoiceController.getInvoicesByHotelAdmin);
api.get("/getInvoice/:id",[mdAuth.ensureUser,mdAuth.ensureAdminHotel],invoiceController.getInvoice);
api.get("/getInvoicesByUser",[mdAuth.ensureUser],invoiceController.getInvoicesByUser);
api.get("/getInvoiceByUser/:id",[mdAuth.ensureUser],invoiceController.getInvoiceByUser);

module.exports = api;