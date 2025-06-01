class LocationDTO {
    /**
     * 
     * @param {string} [params.address] - Optional address string
     * @param {{ lat: number, lng: number }} [params.coords] - Optional coordinates object
     * @param {string} [params.link] - Optional link (e.g., Google Maps URL)
     */
    constructor(address = {line: " ", city: "", country: ""}, coords = { long: 0 , lat: 0}, link) {
        this.address = address || undefined;
        this.coords = coords || undefined;
        this.link = link || undefined;
    }
}

export default LocationDTO;