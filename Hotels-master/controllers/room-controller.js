"use strict";

const Room = require("./../models/room-model");
const Hotel = require("./../models/hotel-model");
const User = require("./../models/user-model");
const bcrypt = require("bcrypt-nodejs");

function createRoom(req, res) {
    let room = new Room();
    let hotelId = req.params.idH;
    let params = req.body;

    if (!params.name && !params.price_for_day && !params.typeRoom) {
        return res
            .status(400)
            .send({ ok: false, message: "Ingrese los datos necesarios" });
    } else {
        Hotel.findById(hotelId, (err, hotelFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (hotelFound) {
                let roomExists = false;
                hotelFound.rooms.forEach((room) => {
                    if (room.name.toLowerCase() == params.name.toLowerCase()) {
                        roomExists = true;
                    }
                });

                if (!roomExists) {
                    room.name = params.name;
                    room.price_for_day = params.price_for_day;
                    room.typeRoom = params.typeRoom;
                    room.save((err, roomSaved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (roomSaved) {
                            Hotel.findByIdAndUpdate(
                                hotelId, { $push: { rooms: roomSaved._id } }, { new: true },
                                (err, hotelUpdate) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .send({ ok: false, message: "Error general" });
                                    } else if (hotelUpdate) {
                                        return res.send({
                                            ok: true,
                                            message: "Habitacion creada correctamente",
                                            roomSaved,
                                        });
                                    } else {
                                        return res.status(404).send({
                                            ok: false,
                                            message: "No se guardo correctamente la habitacion del hotel",
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(403).send({
                                ok: false,
                                message: "No se logro crear la habitacion",
                            });
                        }
                    });
                } else {
                    return res.json({ ok: false, message: "La habitacion ya existe" });
                }
            } else {
                return res.json({ ok: false, message: "no existe ese hotel" });
            }
        }).populate("rooms");
    }
}

function getRooms(req, res) {
    Room.find({}).exec((err, rooms) => {
        if (err) {
            return res.status(500).send({ ok: false, message: "Error general" });
        } else if (rooms) {
            return res.send({ ok: true, message: "Habitaciones encontadas", rooms });
        } else {
            return res.status(404).send({ ok: false, message: "No habitaciones" });
        }
    });
}

function getRoom(req, res) {
    let roomId = req.params.idR;

    if (!roomId) {
        return res.status(400).send({ ok: false, message: "Error, no RoomID" });
    } else {
        Room.findById(roomId).exec((err, rooms) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (rooms) {
                return res.send({
                    ok: true,
                    message: "Habitaciones encontadas",
                    rooms,
                });
            } else {
                return res.status(404).send({ ok: false, message: "No habitaciones" });
            }
        });
    }
}

function getRoomByAdminHotel(req, res) {
    let roomId = req.params.idR;

    if (!roomId) {
        return res.status(400).send({ ok: false, message: "Error, no RoomID" });
    } else {
        Room.findById(roomId).exec((err, rooms) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (rooms) {
                return res.send({
                    ok: true,
                    message: "Habitaciones encontadas",
                    rooms,
                });
            } else {
                return res.status(404).send({ ok: false, message: "No habitaciones" });
            }
        });
    }
}

function updateRoom(req, res) {
    let roomId = req.params.idR;
    let update = req.body;

    if (!roomId) {
        return res
            .status(403)
            .send({ ok: false, message: "Ingrese los parametros" });
    } else {
        Room.findByIdAndUpdate(
            roomId,
            update, { new: true },
            (err, roomUpdated) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Error general" });
                } else if (roomUpdated) {
                    return res.send({
                        ok: false,
                        message: "Habitacion actualizada",
                        roomUpdated,
                    });
                } else {
                    return res.status(404).send({
                        ok: false,
                        message: "Eror, no se logro actualizar la habitacion",
                    });
                }
            }
        );
    }
}

function deleteRoom(req, res) {
    var roomId = req.params.idR;
    var params = req.body;
    var userId = req.user.sub;

    if (!roomId || !params.password) {
        return res.status(403).send({
            ok: false,
            message: "Ingresa los datos necesarios (contraseña)",
        });
    } else {
        Room.findById(roomId, (err, roomFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (roomFound) {
                if (!roomFound.available) {
                    return res.send({
                        ok: false,
                        message: "No puede eliminar esta habitacion, esta ocupada",
                    });
                } else {
                    Hotel.findOne({ user_admin_hotel: userId }).exec(
                        (err, hotelFinded) => {
                            if (err) {
                                return res
                                    .status(500)
                                    .send({ message: "Error al buscar hotel" });
                            } else if (hotelFinded) {
                                var hotelId = hotelFinded._id;
                                console.log(hotelId);
                                User.findById(userId, (err, userFinded) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .send({ message: "Error al buscar usuario" });
                                    } else if (userFinded) {
                                        var password = userFinded.password;
                                        bcrypt.compare(
                                            params.password,
                                            password,
                                            (err, checkPassword) => {
                                                if (err) {
                                                    return res
                                                        .status(500)
                                                        .send({ message: "Error al comparar contraseñas" });
                                                } else if (checkPassword) {
                                                    var confirmationRoom = false;
                                                    hotelFinded.rooms.forEach((element) => {
                                                        if (element == roomId) {
                                                            confirmationRoom = true;
                                                        }
                                                    });
                                                    if (confirmationRoom == true) {
                                                        Hotel.findByIdAndUpdate(
                                                            hotelId, { $pull: { rooms: roomId } },
                                                            (err, hotelUpdated) => {
                                                                if (err) {
                                                                    return res.status(500).send({
                                                                        message: "Error al eliminar de hotel",
                                                                    });
                                                                } else if (hotelUpdated) {
                                                                    console.log(hotelUpdated.rooms);
                                                                    Room.findByIdAndRemove(
                                                                        roomId,
                                                                        (err, roomRemoved) => {
                                                                            if (err) {
                                                                                return res.status(500).send({
                                                                                    ok: false,
                                                                                    message: "Error general",
                                                                                });
                                                                            } else if (roomRemoved) {
                                                                                return res.send({
                                                                                    ok: true,
                                                                                    message: "Habitacion eliminada correctamente",
                                                                                });
                                                                            } else {
                                                                                return res.status(400).send({
                                                                                    ok: false,
                                                                                    message: "No se logro eliminar la habitacion o ya fue eliminada",
                                                                                });
                                                                            }
                                                                        }
                                                                    );
                                                                } else {
                                                                    return res.status(404).send({
                                                                        message: "No se eliminó del hotel",
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        return res.status(401).send({
                                                            message: "Esta habitación no pertenece a tu hotel",
                                                        });
                                                    }
                                                } else {
                                                    return res.send({ message: "Contraseña incorrecta" });
                                                }
                                            }
                                        );
                                    } else {
                                        return res
                                            .status(404)
                                            .send({ message: "El usuario no existe" });
                                    }
                                });
                            } else {
                                return res
                                    .status(404)
                                    .send({ message: "No es administrador de este hotel" });
                            }
                        }
                    );
                }
            } else {
                return res.status(404).send({
                    ok: false,
                    message: "No existe la habitacion o ya fue eliminada",
                });
            }
        });
    }
}

function getRoomsByHotelAdmin(req, res) {
    let hotelAdmiId = req.user.sub;
    Hotel.findOne({ user_admin_hotel: hotelAdmiId }, (err, hotelFound) => {
        if (err) {
            return res.status(500).send({ message: "Error al buscar hotel" });
        } else if (hotelFound) {
            return res.json(hotelFound.rooms);
        } else {
            return res.json({
                ok: false,
                message: "El usuario hotel no tiene hotel",
            });
        }
    }).populate("rooms");
}

function getRoomsEvent(req, res) {
    var userId = req.user.sub;
    Hotel.findOne({ user_admin_hotel: userId })
        .populate("rooms")
        .exec((err, hotelFinded) => {
            if (err) {
                return res.status(500).send({ message: "Error al buscar hotel" });
            } else if (hotelFinded) {
                var rooms = [];
                hotelFinded.rooms.forEach((element) => {
                    if (element.typeRoom != "Habitación Dormitorio") {
                        rooms.push(element);
                    }
                });
                return res.send({ ok: true, message: "Salones de eventos: ", rooms });
            } else {
                return res
                    .status(404)
                    .send({ message: "No es administrador de ningún hotel" });
            }
        });
}

module.exports = {
    createRoom,
    getRooms,
    getRoom,
    updateRoom,
    deleteRoom,
    getRoomByAdminHotel,
    getRoomsByHotelAdmin,
    getRoomsEvent,
};