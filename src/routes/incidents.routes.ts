import { Router } from 'express';
import { IncidentsController } from '../controllers/incidents.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const incidentsRouter = Router();

incidentsRouter.post('/', authenticate, IncidentsController.createIncident);
incidentsRouter.get('/', IncidentsController.getIncidents);