"use strict";

const Reservation = require("../models/reservation-model");
const Hotel = require("../models/hotel-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const moment = require("moment");

function prueba(req, res) {
    res.status(200).send({ message: "Funcionando reservation" });
}

function setReservation(req, res) {
    var hotelId = req.params.idH;
    var roomId = req.params.idR;
    var userId = req.params.idU;
    var params = req.body;

    console.log(params);

    if (params.start_date && params.end_date) {
        var start = moment(params.start_date, "YYYY-MM-DD");
        var end = moment(params.end_date, "YYYY-MM-DD");
        if (start > end) {
            return res.send({
                message: "La fecha de estadía sucede después que la fecha de retiro",
            });
        } else {
            var totalDays = end.diff(start, "days");
            User.findById(userId, (err, userFinded) => {
                if (err) {
                    return res.status(500).send({ message: "Error al buscar usuario" });
                } else if (userFinded) {
                    if (req.user.sub == userId) {
                        Hotel.findById(hotelId, (err, hotelFinded) => {
                            if (err) {
                                return res
                                    .status(500)
                                    .send({ message: "Error al buscar hotel" });
                            } else if (hotelFinded) {
                                var count = hotelFinded.count_reservations + 1;
                                var userHotel = hotelFinded._id;
                                Room.findById(roomId, (err, roomFinded) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .send({ message: "Error al buscar habitación" });
                                    } else if (roomFinded) {
                                        var availableDay = roomFinded.available_day;
                                        if (roomFinded.available_day == undefined) {
                                            var confirmedRoom = false;
                                            hotelFinded.rooms.forEach((element) => {
                                                if (String(element) == String(roomFinded._id)) {
                                                    confirmedRoom = true;
                                                }
                                            });
                                            if (confirmedRoom == true) {
                                                if (roomFinded.available == true) {
                                                    var price = totalDays * roomFinded.price_for_day;
                                                    var reservation = new Reservation();

                                                    reservation.start_date = params.start_date;
                                                    reservation.end_date = params.end_date;
                                                    reservation.total_price = price;
                                                    reservation.user = userId;
                                                    reservation.hotel = hotelId;
                                                    reservation.room = roomId;

                                                    params.services.forEach((service) => {
                                                        reservation.services.push(service);
                                                    });

                                                    reservation.save((err, reservationSaved) => {
                                                        if (err) {
                                                            return res.status(500).send({
                                                                message: "Error al guardar reservación",
                                                            });
                                                        } else if (reservationSaved) {
                                                            var userReserve = reservationSaved._id;
                                                            Hotel.findByIdAndUpdate(
                                                                hotelId, { count_reservations: count },
                                                                (err, hotelUpdated) => {
                                                                    if (err) {
                                                                        return res.status(500).send({
                                                                            message: "Error al actualizar conteo",
                                                                        });
                                                                    } else if (hotelUpdated) {
                                                                        Room.findByIdAndUpdate(
                                                                            roomId, { available: false, available_day: end },
                                                                            (err, roomUpdated) => {
                                                                                if (err) {
                                                                                    return res.status(500).send({
                                                                                        message: "Error al deshabilitar habitación",
                                                                                    });
                                                                                } else if (roomUpdated) {
                                                                                    User.findByIdAndUpdate(
                                                                                        userId, {
                                                                                            $push: {
                                                                                                reservations: userReserve,
                                                                                                history_hotels: userHotel,
                                                                                            },
                                                                                        },
                                                                                        (err, userUpdated) => {
                                                                                            if (err) {
                                                                                                return res.status(500).send({
                                                                                                    message: "Error al actualizar registro de usuario",
                                                                                                });
                                                                                            } else if (userUpdated) {
                                                                                                return res.send({
                                                                                                    message: "Ha reservado la habitación exitosamente",
                                                                                                    reservationSaved,
                                                                                                });
                                                                                            } else {
                                                                                                return res.status(500).send({
                                                                                                    message: "No se actualizó el registro de usuario",
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } else {
                                                                                    return res.status(500).send({
                                                                                        message: "No se deshabilitó",
                                                                                    });
                                                                                }
                                                                            }
                                                                        );
                                                                    } else {
                                                                        return res.status(500).send({
                                                                            message: "No se actualizó el conteo",
                                                                        });
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            return res
                                                                .status(500)
                                                                .send({ message: "No se guardó" });
                                                        }
                                                    });
                                                } else {
                                                    return res.send({
                                                        message: "Habitación no disponible",
                                                    });
                                                }
                                            } else {
                                                return res.send({
                                                    message: "La habitación no pertenece a este hotel",
                                                });
                                            }
                                        } else {
                                            return res.send({
                                                message: "La habitación estará disponible hasta el día",
                                                availableDay,
                                            });
                                        }
                                    } else {
                                        return res.send({ message: "Habitación inexistente" });
                                    }
                                });
                            } else {
                                return res.status(404).send({ message: "Hotel inexistente" });
                            }
                        });
                    } else {
                        return res.status(401).send({
                            message: "No tienes permiso de reservar con este usuario",
                        });
                    }
                } else {
                    return res.status(404).send({ message: "Usuario inexistente" });
                }
            });
        }
    } else {
        return res.send({ message: "Ingrese los datos mínimos" });
    }
}

function cancelReservation(req, res) {
    var reservationId = req.params.idRes;

    Reservation.findById(reservationId, (err, reservationFinded) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar reservación" });
        } else if (reservationFinded) {
            var userId = reservationFinded.user;
            var roomId = reservationFinded.room;
            var hotelId = reservationFinded.hotel;

            if (
                userId == req.user.sub ||
                req.user.role == "ROLE_ADMIN" ||
                req.user.role == "ROLE_HOTEL"
            ) {
                Reservation.findByIdAndRemove(
                    reservationId,
                    (err, reservationRemoved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error al cancelar la reservación" });
                        } else if (reservationRemoved) {
                            User.findByIdAndUpdate(
                                userId, {
                                    $pull: {
                                        reservations: reservationId,
                                        history_hotels: hotelId,
                                    },
                                },
                                (err, userUpdated) => {
                                    if (err) {
                                        return res.status(500).send({
                                            message: "Error al eliminar registros en usuario",
                                        });
                                    } else if (userUpdated) {
                                        Hotel.findById(hotelId, (err, hotelFinded) => {
                                            if (err) {
                                                return res
                                                    .status(500)
                                                    .send({ message: "Error al buscar hotel" });
                                            } else if (hotelFinded) {
                                                var count = hotelFinded.count_reservations - 1;
                                                Hotel.findByIdAndUpdate(
                                                    hotelId, { count_reservations: count },
                                                    (err, hotelUpdated) => {
                                                        if (err) {
                                                            return res.status(500).send({
                                                                message: "Error al actualizar conteo de hotel",
                                                            });
                                                        } else if (hotelUpdated) {
                                                            Room.findByIdAndUpdate(
                                                                roomId, { available: true, available_day: null },
                                                                (err, roomUpdated) => {
                                                                    if (err) {
                                                                        return res.status(500).send({
                                                                            message: "Error al actualizar disponibilidad de habitación",
                                                                        });
                                                                    } else if (roomUpdated) {
                                                                        return res.send({
                                                                            message: "Reservación cancelada/eliminada exitosamente",
                                                                        });
                                                                    } else {
                                                                        return res.status(500).send({
                                                                            message: "No se actualizó la disponibilidad de la habitación",
                                                                        });
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            return res
                                                                .status(500)
                                                                .send({ message: "No se actualizó en conteo" });
                                                        }
                                                    }
                                                );
                                            } else {
                                                return res
                                                    .status(404)
                                                    .send({ message: "No se encontró el hotel" });
                                            }
                                        });
                                    } else {
                                        return res.status(500).send({
                                            message: "No se eliminaron los registros en usuario",
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(500).send({ message: "No se canceló" });
                        }
                    }
                );
            } else {
                return res
                    .status(401)
                    .send({ messag: "No tienes permiso de cancelar esta reservación" });
            }
        } else {
            return res
                .status(404)
                .send({ message: "Reservación no existente o ya fue eliminada" });
        }
    });
}

function getReservationsByHotelAdmin(req, res) {
    let userId = req.user.sub;
    if (!userId) {
        return res.json({ ok: false, message: "Error, envie el id del usuario" });
    } else {
        Hotel.findOne({ user_admin_hotel: userId }, (err, hotelFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (hotelFound) {
                Reservation.find({ hotel: hotelFound._id },
                    (err, reservationsFound) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (reservationsFound) {
                            return res.json({
                                ok: true,
                                message: "Reservaciones encontradas",
                                reservationsFound,
                            });
                        } else {
                            return res.json({ ok: true, message: "No hay reservaciones" });
                        }
                    }
                );
            } else {
                return res.json({ ok: false, message: "No existe el hotel" });
            }
        });
    }
}

function getReservationsByUser(req,res){
    let userId = req.user.sub;
    User.findById(userId).populate("reservations").exec((err,userFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al obtener reservaciones"});
        }else if(userFinded){
            return res.send({message: "Reservaciones:", userFinded});
        }else{
            return res.send({message: "No hay reservaciones"});
        }
    })
}

module.exports = {
    prueba,
    setReservation,
    cancelReservation,
    getReservationsByHotelAdmin,
    getReservationsByUser
};