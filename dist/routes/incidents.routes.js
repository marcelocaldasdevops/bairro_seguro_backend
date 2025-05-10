"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentsRouter = void 0;
const express_1 = require("express");
const incidents_controller_1 = require("../controllers/incidents.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.incidentsRouter = (0, express_1.Router)();
exports.incidentsRouter.post('/', auth_middleware_1.authenticate, incidents_controller_1.IncidentsController.createIncident);
exports.incidentsRouter.get('/', incidents_controller_1.IncidentsController.getIncidents);
