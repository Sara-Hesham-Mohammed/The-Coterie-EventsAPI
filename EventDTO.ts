// Supporting DTOs
interface LocationDto {
  country: string;
  city: string;
  address: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

interface TicketSellerDto {
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
interface EventDto {
  eventId: number;
  eventTitle: string;
  eventDescription: string;
  hostName?: string;
  location: LocationDto;
  startTime: string; // ISO 8601 string format
  endTime: string; // ISO 8601 string format
  status: EventStatus;
  isRecurring?: boolean;
  maxAttendees?: number;
  isPaid?: boolean;
  price?: number;
  ticketSellers?: TicketSellerDto[];
}

export { EventDto, LocationDto, TicketSellerDto, EventStatus };
