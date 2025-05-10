"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsController = void 0;
const db_1 = require("../config/db");
const incident_model_1 = require("../models/incident.model");
class IncidentsController {
}
exports.IncidentsController = IncidentsController;
_a = IncidentsController;
IncidentsController.createIncident = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const transactionClient = yield db_1.pool.connect();
    const userId = req.userId;
    try {
        // Agora req.userId está disponível e tipado corretamente
        if (!userId) {
            console.error('UserId não definido', req.headers);
            res.status(401).json({ message: 'Não autenticado' });
            return;
        }
        const { description, severityLevel, latitude, longitude } = req.body;
        // Validações dos campos
        if (!description || !severityLevel || latitude === undefined || longitude === undefined) {
            res.status(400).json({ message: 'Todos os campos são obrigatórios' });
            return;
        }
        if (!Object.values(incident_model_1.SeverityLevel).includes(severityLevel)) {
            res.status(400).json({
                message: 'Nível de severidade inválido',
                validLevels: Object.values(incident_model_1.SeverityLevel)
            });
            return;
        }
        yield transactionClient.query('BEGIN');
        // 1. Inserir localização - usando o nome da coluna do banco
        const locationResult = yield transactionClient.query(`INSERT INTO locations (latitude, longitude)
                 VALUES ($1, $2)
                 RETURNING location_id`, [latitude, longitude]);
        if (!((_b = locationResult.rows[0]) === null || _b === void 0 ? void 0 : _b.location_id)) {
            throw new Error('Falha ao criar localização');
        }
        // 2. Inserir incidente - usando o nome da coluna do banco
        const incidentResult = yield transactionClient.query(`INSERT INTO incidents
                     (user_id, description, severity_level, location_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING incident_id`, [userId, description, severityLevel, locationResult.rows[0].location_id]);
        yield transactionClient.query('COMMIT');
        // 3. Buscar dados completos
        const fullIncident = yield db_1.pool.query(`SELECT i.*, u.name as user_name, u.bairro as user_bairro,
                        l.latitude, l.longitude
                 FROM incidents i
                          JOIN users u ON i.user_id = u.user_id
                          JOIN locations l ON i.location_id = l.location_id
                 WHERE i.incident_id = $1`, [incidentResult.rows[0].incident_id]);
        if (fullIncident.rows.length === 0) {
            throw new Error('Incidente não encontrado após criação');
        }
        const incidentData = fullIncident.rows[0];
        const incident = {
            incidentID: incidentData.incident_id,
            userID: incidentData.user_id,
            description: incidentData.description,
            severityLevel: incidentData.severity_level,
            timestamp: incidentData.timestamp,
            locationID: incidentData.location_id,
            status: incidentData.status
        };
        res.status(201).json(Object.assign(Object.assign({}, new incident_model_1.IncidentModel(incident).toJSON()), { user: {
                name: incidentData.user_name,
                bairro: incidentData.user_bairro
            }, location: {
                latitude: incidentData.latitude,
                longitude: incidentData.longitude
            } }));
    }
    catch (error) {
        yield transactionClient.query('ROLLBACK');
        console.error('Erro ao criar incidente:', error);
        res.status(500).json({
            message: 'Erro ao registrar ocorrência',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
    finally {
        transactionClient.release();
    }
});
IncidentsController.getIncidents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { severity, status, bairro } = req.query;
        let query = `SELECT i.*, u.name as user_name, u.bairro as user_bairro,
                                l.latitude, l.longitude
                         FROM incidents i
                                  JOIN users u ON i.user_id = u.user_id
                                  JOIN locations l ON i.location_id = l.location_id`;
        const whereClauses = [];
        const queryParams = [];
        if (severity) {
            whereClauses.push(`i.severity_level = $${queryParams.length + 1}`);
            queryParams.push(severity);
        }
        if (status) {
            whereClauses.push(`i.status = $${queryParams.length + 1}`);
            queryParams.push(status);
        }
        if (bairro) {
            whereClauses.push(`u.bairro = $${queryParams.length + 1}`);
            queryParams.push(bairro);
        }
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        query += ` ORDER BY i.timestamp DESC`;
        const result = yield db_1.pool.query(query, queryParams);
        const incidents = result.rows.map(row => (Object.assign(Object.assign({}, new incident_model_1.IncidentModel({
            incidentID: row.incident_id,
            userID: row.user_id,
            description: row.description,
            severityLevel: row.severity_level,
            timestamp: row.timestamp,
            locationID: row.location_id,
            status: row.status
        }).toJSON()), { user: {
                name: row.user_name,
                bairro: row.user_bairro
            }, location: {
                latitude: row.latitude,
                longitude: row.longitude
            } })));
        res.json({
            count: incidents.length,
            incidents
        });
    }
    catch (error) {
        console.error('Erro ao buscar incidentes:', error);
        res.status(500).json({
            message: 'Erro ao buscar ocorrências',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
