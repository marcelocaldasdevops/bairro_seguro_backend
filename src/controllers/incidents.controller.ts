import { RequestHandler } from 'express';
import { pool } from '../config/db';
import { Incident, IncidentModel, SeverityLevel } from '../models/incident.model';

interface LocationResult {
    location_id: number;
}

interface IncidentResult {
    incident_id: number;
}

export class IncidentsController {
    static createIncident: RequestHandler = async (req, res) => {
        const transactionClient = await pool.connect();
        const userId = (req as any).userId;
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

            if (!Object.values(SeverityLevel).includes(severityLevel)) {
                res.status(400).json({
                    message: 'Nível de severidade inválido',
                    validLevels: Object.values(SeverityLevel)
                });
                return;
            }

            await transactionClient.query('BEGIN');

            // 1. Inserir localização - usando o nome da coluna do banco
            const locationResult = await transactionClient.query<LocationResult>(
                `INSERT INTO locations (latitude, longitude)
                 VALUES ($1, $2)
                 RETURNING location_id`,
                [latitude, longitude]
            );

            if (!locationResult.rows[0]?.location_id) {
                throw new Error('Falha ao criar localização');
            }

            // 2. Inserir incidente - usando o nome da coluna do banco
            const incidentResult = await transactionClient.query<IncidentResult>(
                `INSERT INTO incidents
                     (user_id, description, severity_level, location_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING incident_id`,
                [userId, description, severityLevel, locationResult.rows[0].location_id]
            );

            await transactionClient.query('COMMIT');

            // 3. Buscar dados completos
            const fullIncident = await pool.query(
                `SELECT i.*, u.name as user_name, u.bairro as user_bairro,
                        l.latitude, l.longitude
                 FROM incidents i
                          JOIN users u ON i.user_id = u.user_id
                          JOIN locations l ON i.location_id = l.location_id
                 WHERE i.incident_id = $1`,
                [incidentResult.rows[0].incident_id]
            );

            if (fullIncident.rows.length === 0) {
                throw new Error('Incidente não encontrado após criação');
            }

            const incidentData = fullIncident.rows[0];
            const incident: Incident = {
                incidentID: incidentData.incident_id,
                userID: incidentData.user_id,
                description: incidentData.description,
                severityLevel: incidentData.severity_level,
                timestamp: incidentData.timestamp,
                locationID: incidentData.location_id,
                status: incidentData.status
            };

            res.status(201).json({
                ...new IncidentModel(incident).toJSON(),
                user: {
                    name: incidentData.user_name,
                    bairro: incidentData.user_bairro
                },
                location: {
                    latitude: incidentData.latitude,
                    longitude: incidentData.longitude
                }
            });

        } catch (error) {
            await transactionClient.query('ROLLBACK');
            console.error('Erro ao criar incidente:', error);
            res.status(500).json({
                message: 'Erro ao registrar ocorrência',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        } finally {
            transactionClient.release();
        }
    };

    static getIncidents: RequestHandler = async (req, res) => {
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

            const result = await pool.query(query, queryParams);

            const incidents = result.rows.map(row => ({
                ...new IncidentModel({
                    incidentID: row.incident_id,
                    userID: row.user_id,
                    description: row.description,
                    severityLevel: row.severity_level,
                    timestamp: row.timestamp,
                    locationID: row.location_id,
                    status: row.status
                }).toJSON(),
                user: {
                    name: row.user_name,
                    bairro: row.user_bairro
                },
                location: {
                    latitude: row.latitude,
                    longitude: row.longitude
                }
            }));

            res.json({
                count: incidents.length,
                incidents
            });

        } catch (error) {
            console.error('Erro ao buscar incidentes:', error);
            res.status(500).json({
                message: 'Erro ao buscar ocorrências',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    };
}