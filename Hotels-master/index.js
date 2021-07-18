"use strict";

var mongoose = require("mongoose");
var app = require("./app");
var port = process.env.PORT || 3200;
var admin = require("./controllers/user-controller");

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
mongoose
    .connect("mongodb://localhost:27017/dbhotelmanagement2021", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        admin.userAdmin();
        console.log("Conectado a la BD");
        app.listen(port, () => {
            console.log("Servidor de express corriendo");
        });
    })
    .catch((err) => {
        console.log("Error al conectar a la BD", err);
    });