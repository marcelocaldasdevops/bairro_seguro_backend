"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentModel = exports.SeverityLevel = void 0;
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "low";
    SeverityLevel["MEDIUM"] = "medium";
    SeverityLevel["HIGH"] = "high";
})(SeverityLevel || (exports.SeverityLevel = SeverityLevel = {}));
class IncidentModel {
    constructor(data) {
        this.data = data;
        if (!data.userID)
            throw new Error('UserID é obrigatório');
        if (!data.locationID)
            throw new Error('LocationID é obrigatório');
    }
    toJSON() {
        return Object.assign(Object.assign({}, this.data), { timestamp: this.data.timestamp.toISOString() });
    }
}
exports.IncidentModel = IncidentModel;
