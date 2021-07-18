"use strict";

const Hotel = require("../models/hotel-model");
const User = require("../models/user-model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

function createHotel(req, res) {
    let hotel = new Hotel();
    let params = req.body;

    if ((params.user_admin_hotel, params.name, params.address, params.country)) {
        Hotel.findOne({ user_admin_hotel: params.user_admin_hotel },
            (err, hotelFound) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Erro general" });
                } else if (hotelFound) {
                    return res.json({
                        ok: false,
                        message: "Elija otro usuario administrador",
                    });
                } else {
                    User.findOne({ _id: params.user_admin_hotel, role: "ROLE_HOTEL" },
                        (err, userExists) => {
                            if (err) {
                                return res.status(500).send({
                                    ok: false,
                                    message: "Error general buscando al usuario",
                                });
                            } else if (userExists) {
                                hotel.user_admin_hotel = params.user_admin_hotel;
                                hotel.name = params.name;
                                hotel.address = params.address;
                                hotel.country = params.country;

                                hotel.save((err, hotelSaved) => {
                                    if (err) {
                                        return res.status(500).send({
                                            ok: false,
                                            message: "Error general al guardar el hotel",
                                        });
                                    } else if (hotelSaved) {
                                        Hotel.find({})
                                            .populate()
                                            .exec((errl, hotels) => {
                                                if (err) {
                                                    return res
                                                        .status(500)
                                                        .send({ ok: false, message: "Error general" });
                                                } else if (hotels) {
                                                    return res.send({
                                                        ok: false,
                                                        message: "Hotel guardado correctamente",
                                                        hotels,
                                                        hotelSaved,
                                                    });
                                                } else {
                                                    return res.json({
                                                        ok: false,
                                                        message: "Error al retornar hoteles",
                                                    });
                                                }
                                            });
                                    } else {
                                        return res.status(400).send({
                                            ok: false,
                                            message: "No se pudo guardar el hotel",
                                        });
                                    }
                                });
                            } else {
                                return res
                                    .status(404)
                                    .send({ ok: false, message: "No existe el usuario admin" });
                            }
                        }
                    );
                }
            }
        );
    } else {
        return res
            .status(400)
            .send({ ok: false, message: "Ingrese los datos necesarios" });
    }
}

function getHotels(req, res) {
    Hotel.find({})
        .populate("user_admin_hotel")
        .populate("rooms")
        .populate("services")
        .populate("events")
        .exec((err, users) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (users) {
                return res.send({ ok: true, users });
            } else {
                return res
                    .status(404)
                    .send({ ok: false, message: "No se encontraron hoteles" });
            }
        });
}

function getHotel(req, res) {
    let hotelId = req.params.idH;

    Hotel.findById(hotelId)
        .populate("user_admin_hotel")
        .exec((err, users) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (users) {
                return res.send({ ok: true, users });
            } else {
                return res
                    .status(404)
                    .send({ ok: false, message: "No se encontraron hoteles" });
            }
        });
}

function updateHotel(req, res) {
    let hotelId = req.params.idH;
    let update = req.body;

    if (!hotelId) {
        return res
            .status(400)
            .send({ ok: false, message: "Ingrese el id del hotel" });
    } else {
        Hotel.findByIdAndUpdate(
            hotelId,
            update, { new: true },
            (err, hotelUpdated) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Error general" });
                } else if (hotelUpdated) {
                    return res.send({
                        ok: true,
                        message: "Hotel actualizado",
                        hotelUpdated,
                    });
                } else {
                    return res
                        .status(404)
                        .send({ ok: false, message: "No se lotro actualizar" });
                }
            }
        );
    }
}

function deleteHotel(req, res) {
    let hotelId = req.params.idH;
    let userId = req.params.idU;
    let passwordConfirm = req.body.password;

    if (!hotelId && !userId == req.user.sub && !passwordConfirm) {
        return res.status(400).send({ ok: false, message: "Ingrese los datos" });
    } else {
        User.findOne({ _id: userId, role: "ROLE_ADMIN" }, (err, userFound) => {
            if (err) {
                return res.status(505).send({ ok: false, message: "Error general" });
            } else if (userFound) {
                bcrypt.compare(
                    passwordConfirm,
                    userFound.password,
                    (err, passwordMatch) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (passwordMatch) {
                            Hotel.findByIdAndDelete(hotelId, (err, hotelDeleted) => {
                                if (err) {
                                    return res
                                        .status(500)
                                        .send({ ok: false, message: "Error general" });
                                } else if (hotelDeleted) {
                                    return res.send({
                                        ok: true,
                                        message: "Hotel eliminado correctamente",
                                        hotelDeleted,
                                    });
                                } else {
                                    return res.status(400).send({
                                        ok: false,
                                        message: "No se pudo elimina el hotel",
                                    });
                                }
                            });
                        } else {
                            return res
                                .status(400)
                                .send({ ok: false, message: "La password no coincide" });
                        }
                    }
                );
            } else {
                return res
                    .status(404)
                    .send({ ok: false, message: "Error, usuario no encontrado" });
            }
        });
    }
}

function getHotelsnames(req, res) {
    Hotel.find()
        .sort({ count_reservations: -1 })
        .exec((err, hotels) => {
            if (err) {
                return res.json({ ok: false, message: "Error general" });
            } else if (hotels) {
                var hotelsGraphic = [];

                hotels.forEach((hotelItem) => {
                    hotelsGraphic.push({
                        hotelName: hotelItem.name,
                        count_reservations: hotelItem.count_reservations,
                    });
                });

                return res.json({ ok: true, message: "Datos hotel", hotelsGraphic });
            } else {
                return res.json({ ok: false, message: "No existen hoteles" });
            }
        });
}

function getHotelBydAdminHotelID(req, res) {
    let userAdminH = req.user.sub;

    if (userAdminH) {
        Hotel.aggregate([{ $match: { user_admin_hotel: userAdminH } }]).exec(
            (err, hotel) => {
                if (err) {
                    return res.json({ ok: false, message: "Error general" });
                } else if (hotel) {
                    return res.send({
                        ok: true,
                        message: "Hotel del usuario admin",
                        hotel,
                    });
                } else {
                    console.log(hotel);
                    return res.json({ ok: false, message: "No existen hoteles" });
                }
            }
        );
    } else {
        return res.json({ ok: false, message: "Ingrese los datos" });
    }
}

function getHotelsVisited(req,res){
    var userId = req.user.sub;

    User.findById(userId).populate("history_hotels").exec((err,userFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar usuario"});
        }else if(userFinded){
            return res.send({message: "Hoteles",userFinded});
        }else{
            return res.send({message: "Usuario inexistente"});
        }
    })
}

function getHotelsRecomendations(req, res) {
    Hotel.find({})
        .populate()
        .exec((err, hotels) => {
            if (err) {
                return res.status(5000).send({ ok: false, message: "Error general" });
            } else if (hotels) {
                return res.json({ ok: true, message: "Hoteles encontrados", hotels });
            } else {
                return res.json({ ok: false, message: "No existen hoteles" });
            }
        });
}

function getRoomsByHotel(req, res) {
    let idH = req.params.idH;
    Hotel.findOne({ _id: idH }, (err, hotelFound) => {
        if (err) {
            res.status(500).send({ message: "Error al buscar hotel" });
            console.log(err);
        } else if (hotelFound) {
            return res.json(hotelFound.rooms);
        } else {
            return res.json({
                ok: false,
                message: "El Hotel no tiene habitaciones",
            });
        }
    }).populate("rooms");
}

module.exports = {
    createHotel,
    getHotels,
    getHotel,
    updateHotel,
    deleteHotel,
    getHotelsnames,
    getHotelBydAdminHotelID,
    getHotelsVisited,
    getHotelsRecomendations,
    getRoomsByHotel
}