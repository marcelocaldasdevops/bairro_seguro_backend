"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationModel = void 0;
class LocationModel {
    constructor(data) {
        this.data = data;
    }
    toJSON() {
        return this.data;
    }
}
exports.LocationModel = LocationModel;
