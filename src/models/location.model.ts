export interface Location {
    locationID: number;
    latitude: number;
    longitude: number;
}

export class LocationModel {
    constructor(public data: Location) {}

    public toJSON() {
        return this.data;
    }
}