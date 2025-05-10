export enum SeverityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export interface Incident {
    incidentID: number;
    userID: number;
    description: string;
    severityLevel: SeverityLevel;
    timestamp: Date;
    locationID: number;
    status?: 'pending' | 'resolved' | 'in_progress';
}

export class IncidentModel {
    constructor(public data: Incident) {
        if (!data.userID) throw new Error('UserID é obrigatório');
        if (!data.locationID) throw new Error('LocationID é obrigatório');
    }

    public toJSON() {
        return {
            ...this.data,
            timestamp: this.data.timestamp.toISOString()
        };
    }
}