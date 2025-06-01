// Supporting DTOs
interface LocationDTO {
  address: string;
  country: string;
  link?: string; // URL to the location or venue
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

interface TicketSellerDTO {
  id: number;
  name: string;
  url: string;
}

enum EventStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED",
  ENDED = "ENDED",
}

// Main Event DTO
interface EventDTO {
  eventId: number;
  eventTitle: string;
  eventDescription?: string;
  hostName?: string;
  location: LocationDTO;
  startTime: string; // ISO 8601 string format
  endTime?: string; // ISO 8601 string format
  status: EventStatus;
  isRecurring?: boolean;
  maxAttendees?: number;
  isPaid?: boolean;
  price?: number;
  ticketSellers?: TicketSellerDTO[];
}

export { EventDTO, LocationDTO, TicketSellerDTO, EventStatus };
