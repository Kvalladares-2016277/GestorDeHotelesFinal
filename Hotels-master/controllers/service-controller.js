"use strict";

const Services = require("./../models/service-model");
const Reservation = require("./../models/reservation-model");
const Hotel = require("./../models/hotel-model");
const User = require("./../models/user-model");

function createServices(req, res) {
    let services = new Services();
    let params = req.body;
    let hotelId = req.params.idH;
    console.log(params);
    if (!params.name && !params.price_service && !hotelId) {
        return res.send({ ok: false, message: "Ingrese sus datos obligatorios" });
    } else {
        Hotel.findById(hotelId, (err, hotelFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (hotelFound) {
                let serviceExists = false;
                hotelFound.services.forEach((service) => {
                    if (service.name.toLowerCase() == params.name.toLowerCase()) {
                        serviceExists = true;
                    }
                });
                if (!serviceExists) {
                    services.name = params.name;
                    services.price_service = params.price_service;
                    services.save((err, serviceSaved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (serviceSaved) {
                            Hotel.findByIdAndUpdate(
                                hotelId, { $push: { services: serviceSaved._id } }, { new: true },
                                (err, hotelUpdated) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .send({ ok: false, message: "Error general" });
                                    } else if (hotelUpdated) {
                                        return res.send({
                                            ok: true,
                                            message: "Servicio creado correctamente",
                                            serviceSaved,
                                            hotelUpdated,
                                        });
                                    } else {
                                        return res
                                            .status(404)
                                            .send({ ok: false, message: "No existe el hotel" });
                                    }
                                }
                            );
                        } else {
                            return res.status(404).send({
                                ok: false,
                                message: "No se guardo correctamente el servicio",
                            });
                        }
                    });
                } else {
                    return res.json({ ok: false, message: "El servicio ya existe" });
                }
            } else {
                return res.json({ ok: false, message: "no existe ese hotel" });
            }
        }).populate("services");
    }
}

function getServices(req, res) {
    Services.find({}).exec((err, services) => {
        if (err) {
            return res.status(500).send({ ok: false, message: "Error general" });
        } else if (services) {
            return res.send({ ok: true, message: "Servicios encontrados", services });
        } else {
            return res.status(404).send({ ok: false, message: "Sin servicios" });
        }
    });
}

function getService(req, res) {
    let servicesId = req.params.id;

    if (!servicesid) {
        return res.status(400).send({ ok: false, message: "Error, ServicesID" });
    } else {
        Services.findById(servicesId).exec((err, service) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (service) {
                return res.send({ ok: true, message: "Servicio encontrado", service });
            } else {
                return res.status(404).send({ ok: false, message: "No servicio" });
            }
        });
    }
}

function updateService(req, res) {
    let servicesId = req.params.id;
    let update = req.body;

    if (!servicesId) {
        return res
            .status(403)
            .send({ ok: false, message: "Ingrese los parametros" });
    } else {
        Services.findByIdAndUpdate(
            servicesId,
            update, { new: true },
            (err, serviceUpdated) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Error general" });
                } else if (serviceUpdated) {
                    return res.send({
                        ok: false,
                        message: "Servicio actualizado",
                        serviceUpdated,
                    });
                } else {
                    return res.status(404).send({
                        ok: false,
                        message: "Error, no se logro actualizar la habitacion",
                    });
                }
            }
        );
    }
}

function deleteService(req, res) {
    let serviceId = req.params.id;

    if (!serviceId) {
        return res
            .status(403)
            .send({ ok: false, message: "Ingrese los datos necesarios" });
    } else {
        Services.findById(serviceId, (err, serviceFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error General" });
            } else if (serviceFound) {
                Services.findByIdAndDelete(serviceId, (err, serviceRemoved) => {
                    if (err) {
                        return res
                            .status(500)
                            .send({ ok: false, message: "Error general" });
                    } else if (serviceRemoved) {
                        return res.send({ ok: true, message: "Servicio eliminado" });
                    } else {
                        return res.status(400).send({
                            ok: false,
                            message: "No se logro eliminar la habitacion",
                        });
                    }
                });
            } else {
                return res
                    .status(404)
                    .send({ ok: false, message: "No existe el servicio" });
            }
        });
    }
}

function setServiceReservation(req, res) {
    var reservationId = req.params.idR;
    var serviceId = req.params.idS;
    var userId = req.user.sub;

    Services.findById(serviceId, (err, serviceFinded) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar servicio" });
        } else if (serviceFinded) {
            var total = serviceFinded.price_service;
            Reservation.findById(reservationId, (err, reservationFinded) => {
                if (err) {
                    return res
                        .status(500)
                        .send({ message: "Error al buscar reservación" });
                } else if (reservationFinded) {
                    var confirmServiceRes = false;
                    reservationFinded.services.forEach((element) => {
                        if (element == serviceId) {
                            confirmServiceRes = true;
                        }
                    });
                    var hotelId = reservationFinded.hotel;
                    Hotel.findById(hotelId, (err, hotelFinded) => {
                        if (err) {
                            return res.status(500).send({ message: "Error al buscar hotel" });
                        } else if (hotelFinded) {
                            var confirmService = false;
                            hotelFinded.services.forEach((element) => {
                                if (element == serviceId) {
                                    confirmService = true;
                                }
                            });
                            if (confirmService == false || confirmServiceRes == true) {
                                return res.send({
                                    message: "El servicio no existe en el hotel o ya fue añadido",
                                });
                            } else {
                                if (reservationFinded.user == userId) {
                                    total = total + reservationFinded.total_price;
                                    console.log(total);
                                    Reservation.findByIdAndUpdate(
                                        reservationId, {
                                            total_price: total,
                                            $push: { services: serviceFinded._id },
                                        }, { new: true },
                                        (err, reservationUpdated) => {
                                            if (err) {
                                                console.log(err);
                                                return res
                                                    .status(500)
                                                    .send({ message: "Error al agregar servicio" });
                                            } else if (reservationUpdated) {
                                                return res.send({
                                                    message: "Se agregó el servicio exitosamente",
                                                    reservationUpdated,
                                                });
                                            } else {
                                                return res
                                                    .status(500)
                                                    .send({ message: "No se agregó el servicio" });
                                            }
                                        }
                                    );
                                } else {
                                    return res.status(401).send({
                                        message: "No tienes permisos para agregar servicios a esta reservación",
                                    });
                                }
                            }
                        } else {
                            return res.status(404).send({ message: "Hotel inexistente" });
                        }
                    });
                } else {
                    return res.status(404).send({ message: "No existe la reservación" });
                }
            });
        } else {
            return res.status(404).send({ message: "Servicio no existente" });
        }
    });
}

function createServiceByHotelAdmin(req, res) {
    var service = new Services();
    var params = req.body;
    var userId = req.user.sub;
    var hotelId;
    var services = [];

    if (params.name && params.price_service) {
        Hotel.aggregate([{
            $match: { user_admin_hotel: String(userId) },
        }, ]).exec((err, hotelFinded) => {
            if (err) {
                return res.status(500).send({ message: "Error al buscar hotel" });
            } else if (hotelFinded) {
                console.log(hotelFinded);
                hotelId = hotelFinded[0]._id;
                var confirmation = false;
                Hotel.findById(hotelId)
                    .populate("services")
                    .exec((err, servicesFinded) => {
                        console.log(servicesFinded.services[0]);
                        if (servicesFinded.services.length >= 1) {
                            let i = 0;
                            var name = params.name;
                            while (i < servicesFinded.services.length) {
                                if (servicesFinded.services[i].name == name.toLowerCase()) {
                                    confirmation = true;
                                }
                                i++;
                            }
                            if (confirmation == true) {
                                console.log(hotelFinded[0].services);
                                return res.send({
                                    message: "Este servicio ya existe en el hotel",
                                });
                            } else {
                                service.name = params.name.toLowerCase();
                                service.price_service = params.price_service;
                                service.save((err, serviceSaved) => {
                                    if (err) {
                                        console.log(err);
                                        return res
                                            .status(500)
                                            .send({ ok: false, message: "Error general" });
                                    } else if (serviceSaved) {
                                        var serviceId = serviceSaved._id;
                                        Hotel.findByIdAndUpdate(
                                            hotelId, { $push: { services: serviceId } }, { new: true },
                                            (err, hotelUpdated) => {
                                                if (err) {
                                                    return res
                                                        .status(500)
                                                        .send({ message: "Error al agregar servicio" });
                                                } else if (hotelUpdated) {
                                                    return res.send({
                                                        message: "Servicio agregado exitosamente",
                                                        hotelUpdated,
                                                    });
                                                } else {
                                                    return res.status(500).send({
                                                        message: "No se agregó el servicio al hotel",
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        return res.status(404).send({
                                            ok: false,
                                            message: "No se guardo correctamente el servicio",
                                        });
                                    }
                                });
                            }
                        } else {
                            service.name = params.name.toLowerCase();
                            service.price_service = params.price_service;
                            service.save((err, serviceSaved) => {
                                if (err) {
                                    return res
                                        .status(500)
                                        .send({ ok: false, message: "Error general" });
                                } else if (serviceSaved) {
                                    Hotel.findByIdAndUpdate(
                                        hotelId, { $push: { services: serviceSaved._id } }, { new: true },
                                        (err, hotelUpdated) => {
                                            if (err) {
                                                return res
                                                    .status(500)
                                                    .send({ message: "Error al agregar servicio" });
                                            } else if (hotelUpdated) {
                                                return res.send({
                                                    message: "Servicio agregado exitosamente",
                                                    hotelUpdated,
                                                });
                                            } else {
                                                return res.status(500).send({
                                                    message: "No se agregó el servicio al hotel",
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    return res.status(404).send({
                                        ok: false,
                                        message: "No se guardo correctamente el servicio",
                                    });
                                }
                            });
                        }
                    });
            } else {
                return res
                    .status(404)
                    .send({ message: "Su usuario no es administrador de ningún hotel" });
            }
        });
    } else {
        return res
            .status(400)
            .send({ ok: false, message: "Ingrese sus datos obligatorios" });
    }
}

function getServicesHotel(req, res) {
    let userId = req.user.sub;
    if (!userId) {
        return res.json({ ok: false, message: "Ingrese el id del usuario" });
    } else {
        Hotel.findOne({ user_admin_hotel: userId }, (err, hotelFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (hotelFound) {
                return res.json({
                    ok: true,
                    message: "Servicios por hotel",
                    services: hotelFound.services,
                });
            } else {
                return res.json({ ok: false, message: "No existe el hotel" });
            }
        }).populate("services");
    }
}

module.exports = {
    createServices,
    deleteService,
    getService,
    getServices,
    updateService,
    setServiceReservation,
    createServiceByHotelAdmin,
    getServicesHotel,
};