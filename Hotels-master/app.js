"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/user-route");
const eventRoutes = require("./routes/event-route");
const hotelRoutes = require("./routes/hotel-route");
const invoiceRoutes = require("./routes/invoice-route");
const reservationRoutes = require("./routes/reservation-route");
const roomRoutes = require("./routes/room-route");
const serviceRoutes = require("./routes/service-route");

let app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", hotelRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", reservationRoutes);
app.use("/api", roomRoutes);
app.use("/api", serviceRoutes);

module.exports = app;