"use strict";

const Event = require("./../models/event-model");
const Hotel = require("./../models/hotel-model");
const User = require("./../models/user-model");
const bcrypt = require("bcrypt-nodejs");

function createEvent(req, res) {
    var event = new Event();
    var params = req.body;
    var userId = req.user.sub;

    if (!params.name || !params.price_event) {
        return res
            .status(400)
            .send({ ok: false, message: "Ingrese los datos necesarios" });
    } else {
        Hotel.findOne({user_admin_hotel: userId}).populate("events").exec((err,hotelFinded)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar hotel"});
            }else if(hotelFinded){
                var hotelId = hotelFinded._id;
                var validateEvent = false;
                hotelFinded.events.forEach(element => {
                    if(element.name.toLowerCase() == params.name.toLowerCase()){
                        console.log(element.name,params.name);
                        validateEvent = true;
                    }
                });
                if(validateEvent == false){
                    event.name = params.name;
                    event.type_of_event = params.type_of_event;
                    event.price_event = params.price_event;
    
                    event.save((err, eventSaved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (eventSaved) { 
                            Hotel.findByIdAndUpdate(hotelId,{$push:{events: eventSaved}},{new: true},(err,hotelUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: "Error al intentar agregar evento"});
                                }else if(hotelUpdated){
                                    return res.send({
                                        ok: true,
                                        message: "Evento creado y agregado con éxito",
                                        hotelUpdated,
                                        eventSaved
                                    });
                                }else{
                                    return res.status(500).send({message: "No se agregó el evento al hotel"});
                                }
                            })  
                        } else {
                            return res.status(404).send({
                                ok: false,
                                message: "No se guardo correctamente el evento",
                            });
                        }
                    })
                }else{
                    return res.send({ok: false, message: "El evento ya existe en el hotel"});
                }
            }else{
                return res.status(404).send({message: "Hotel inexistente"});
            }
        })
    }
}

function getEvents(req, res) {
    var userId = req.user.sub;

    Hotel.findOne({user_admin_hotel: userId}).populate("events").exec((err,hotelFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar hotel"});
        }else if(hotelFinded){
            var events = [];
            hotelFinded.events.forEach(element =>{
                events.push(element);
            })
            return res.send({message: "Eventos: ",events});
        }else{
            return res.status(404).send({message: "No es administrador de ningún hotel"});
        }
    })
}

function getEvent(req, res) {
    let eventId = req.params.id;

    if (!eventId) {
        return res.status(400).send({ ok: false, message: "Error, no EventID" });
    } else {
        Event.findById(eventId).exec((err, event) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (event) {
                return res.send({ ok: true, message: "Evento encontrado", event });
            } else {
                return res.status(404).send({ ok: false, message: "no evento" });
            }
        });
    }
}

function updateEvent(req, res) {
    let eventId = req.params.id;
    let update = req.body;

    if (!eventId) {
        return res
            .status(403)
            .send({ ok: false, message: "Ingrese los parametros" });
    } else {
        Event.findByIdAndUpdate(
            eventId,
            update, { new: true },
            (err, eventUpdated) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Error General" });
                } else if (eventUpdated) {
                    return res.send({
                        ok: false,
                        message: "Evento actualizado",
                        eventUpdated,
                    });
                } else {
                    return res.status(404).send({
                        ok: false,
                        message: "Error, no se logro actualizar el evento",
                    });
                }
            }
        );
    }
}

function deleteEvent(req, res) {
    let eventId = req.params.id;
    let userId = req.user.sub;
    var params = req.body;

    if (!eventId || !params.password) {
        return res
            .status(403)
            .send({ ok: false, message: "Ingrese los datos necesarios" });
    } else {
        User.findById(userId,(err,userFinded)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar usuario"});
            }else if(userFinded){
                var password = userFinded.password;
                bcrypt.compare(params.password, password,(err,checkPassword)=>{
                    if(err){
                        console.log(err);
                        return res.status(500).send({message: "Error al comparar contraseñas"});
                    }else if(checkPassword){
                        Event.findById(eventId, (err, eventFound) => {
                            if (err) {
                                return res.status(500).send({ ok: false, message: "Error General" });
                            } else if (eventFound) {
                                Hotel.findOne({user_admin_hotel: userId}).populate("events").exec((err,hotelFinded)=>{
                                    if(err){
                                        return res.status(500).send({message: "Error al buscar hotel"});
                                    }else if(hotelFinded){
                                        var hotelId = hotelFinded._id;
                                        var checkEvent = false;
                                        hotelFinded.events.forEach(element =>{
                                            if(element.name.toLowerCase() == eventFound.name.toLowerCase()){
                                                checkEvent = true;
                                            }
                                        })
                                        if(checkEvent == true){
                                            Hotel.findByIdAndUpdate(hotelId,{$pull:{events: eventId}},{new:true},(err,hotelUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message: "Error al intentar eliminar evento del hotel"});
                                                }else if(hotelUpdated){
                                                    Event.findByIdAndDelete(eventId, (err, eventRemoved) => {
                                                        if (err) {
                                                            return res
                                                                .status(500)
                                                                .send({ ok: false, message: "Error General" });
                                                        } else if (eventRemoved) {
                                                            return res.send({
                                                                ok: true,
                                                                message: "Evento eliminado correctamente",
                                                            });
                                                        } else {
                                                            return res
                                                                .status(400)
                                                                .send({ ok: false, message: "No se logro eliminar el evento" });
                                                        }
                                                    });
                                                }else{
                                                    return res.status(500).send({message: "Error al eliminar evento del hotel"});
                                                }
                                            })
                                        }else{
                                            return res.send({message: "El evento no pertenece al hotel"});
                                        }
                                    }else{
                                        return res.status(404).send({message: "No es administrador de ningún hotel"});
                                    }
                                })
                            } else {
                                return res
                                    .status(404)
                                    .send({ ok: false, message: "No existe el evento" });
                            }
                        });
                    }else{
                        return res.send({message: "Contraseña incorrecta"});
                    }
                })
            }else{
                return res.status(404).send({message: "Usuario inexistente"});
            }
        })
    }
}

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent,
};