"use strict";

const Hotel = require("./../models/hotel-model");
const Reservation = require("./../models/reservation-model");
const Room = require("./../models/room-model");
const Invoice = require("./../models/invoice-model");
const moment = require("moment");

function prueba(req, res) {
    res.status(200).send({ message: "Funcionando invoice" });
}

function createInvoice(req, res) {
    var reservationId = req.params.idR;
    var userAdminH = req.user.sub;

    Hotel.findOne({ user_admin_hotel: userAdminH }).exec((err, hotelFinded) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar hotel" });
        } else if (hotelFinded) {
            Reservation.findById(reservationId, (err, reservationFinded) => {
                if (err) {
                    return res
                        .status(500)
                        .send({ message: "Error al buscar reservación" });
                } else if (reservationFinded) {
                    var roomId = reservationFinded.room;
                    if (reservationFinded.status == true) {
                        var start = new Date(
                            moment(reservationFinded.start_date).format("YYYY-MM-DD")
                        );
                        var today = new Date(moment().format("YYYY-MM-DD"));
                        if (today <= start) {
                            return res.send({
                                message: "Aún no es día de retiro, no se puede pagar",
                            });
                        } else {
                            Room.findByIdAndUpdate(
                                roomId, { available: true, available_day: null }, { new: true },
                                (err, roomUpdated) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .send({ message: "Error al buscar habitación" });
                                    } else if (roomUpdated) {
                                        Reservation.findByIdAndUpdate(
                                            reservationId, { status: false }, { new: true },
                                            (err, reservationUpdated) => {
                                                if (err) {
                                                    return res.status(500).send({
                                                        message: "Error al intentar actualizar reservación",
                                                    });
                                                } else if (reservationUpdated) {
                                                    var invoice = new Invoice();

                                                    invoice.start_date = reservationUpdated.start_date;
                                                    invoice.end_date = reservationUpdated.end_date;
                                                    invoice.total_price = reservationUpdated.total_price;
                                                    invoice.user = reservationUpdated.user;
                                                    invoice.hotel = reservationUpdated.hotel;
                                                    invoice.room = reservationUpdated.room;
                                                    invoice.services = reservationUpdated.services;
                                                    if (reservationUpdated.events != undefined) {
                                                        invoice.events = reservationUpdated.events;
                                                    }
                                                    invoice.save((err, invoiceSaved) => {
                                                        if (err) {
                                                            console.log(err);
                                                            return res
                                                                .status(500)
                                                                .send({ message: "Error al facturar" });
                                                        } else if (invoiceSaved) {
                                                            return res.send({
                                                                message: "Facturado exitosamente",
                                                                invoiceSaved,
                                                            });
                                                        } else {
                                                            return res
                                                                .status(500)
                                                                .send({ message: "No se facturó" });
                                                        }
                                                    });
                                                } else {
                                                    return res
                                                        .status(404)
                                                        .send({ message: "Reservación inexistente" });
                                                }
                                            }
                                        );
                                    } else {
                                        return res
                                            .status(404)
                                            .send({ message: "Habitación inexistente" });
                                    }
                                }
                            );
                        }
                    } else {
                        return res.send({ message: "Esta reservación ya fue pagada" });
                    }
                } else {
                    return res.status(404).send({ message: "Reservación inexistente" });
                }
            });
        } else {
            return res
                .status(404)
                .send({ message: "No es administrador de ningún hotel" });
        }
    });
}

function getInvoicesByHotelAdmin(req, res) {
    var userId = req.user.sub;

    Hotel.findOne({ user_admin_hotel: userId }, (err, hotelFinded) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar hotel" });
        } else if (hotelFinded) {
            var hotelId = hotelFinded._id;
            console.log(hotelId);
            Invoice.find({ hotel: hotelId }).exec((err, invoices) => {
                if (err) {
                    return res.status(500).send({ message: "Error al obtener facturas" });
                } else if (invoices) {
                    return res.send({ message: "Facturas: ", invoices });
                } else {
                    return res.send({ message: "No hay facturas" });
                }
            });
        } else {
            return res
                .status(404)
                .send({ message: "No es administrador de ningún hotel" });
        }
    });
}

function getInvoice(req, res) {
    var userId = req.user.sub;
    var invoiceId = req.params.id;

    Hotel.findOne({ user_admin_hotel: userId }, (err, hotelFinded) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar hotel" });
        } else if (hotelFinded) {
            var hotelId = hotelFinded._id;
            console.log(hotelId);
            Invoice.findById(invoiceId)
                .populate("services")
                .exec((err, invoice) => {
                    if (err) {
                        return res.status(500).send({ message: "Error al buscar factura" });
                    } else if (invoice) {
                        return res.send({ message: "Factura: ", invoice });
                    } else {
                        return res.send({ message: "Factura inexistente" });
                    }
                });
        } else {
            return res
                .status(404)
                .send({ message: "No es administrador de ningún hotel" });
        }
    });
}

function getInvoicesByUser(req, res) {
    var userId = req.user.sub;

    Invoice.find({ user: userId })
        .populate("services")
        .populate("hotel")
        .populate("hotel.events")
        .populate("hotel.rooms")
        .populate("hotel.services")
        .populate("hotel.user_admin_hotel")
        .populate("room")
        .populate("user")
        .exec((err, invoices) => {
            if (err) {
                return res.status(500).send({ message: "Error al obtener facturas" });
            } else if (invoices) {
                return res.send({ message: "Facturas: ", invoices });
            } else {
                return res.send({ message: "No hay facturas" });
            }
        });
}

function getInvoiceByUser(req, res) {
    var invoiceId = req.params.id;
    Invoice.findById(invoiceId)
        .populate("services")
        .populate("hotel")
        .populate("room")
        .populate("user")
        .exec((err, invoice) => {
            if (err) {
                return res.status(500).send({ message: "Error al buscar factura" });
            } else if (invoice) {
                return res.send({ message: "Factura: ", invoice });
            } else {
                return res.send({ message: "Factura inexistente" });
            }
        });
}

module.exports = {
    prueba,
    createInvoice,
    getInvoicesByHotelAdmin,
    getInvoice,
    getInvoicesByUser,
    getInvoiceByUser,
};