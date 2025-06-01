import LocationDTO from "./LocationDTO.js";

class EventDTO {
  static _initId = 1;

  constructor({
    name = "",
    description = "",
    location = LocationDTO,
    startDate = null,
    endDate = null,
  } = {}) {
    this.id = EventDTO._initId++; // Always auto-generated
    this.name = name;
    this.description = description;
    this.location = LocationDTO instanceof LocationDTO ? location : new LocationDTO(location);
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

export default EventDTO;
