export interface MusicalEvent {
  id: string;
  name: string;
  venue: string;
  location: string;
  coordinates: { x: number; y: number }; // Percentage positions (0-100) for custom vector map
  date: string;
  timestamp: number; // For sorting and timeline mapping
  genre: string;
  lineup: string[];
  description: string;
  status: 'Tickets Available' | 'Selling Fast' | 'Sold Out' | 'Free Entry';
  priceRange: string;
  ticketLink?: string;
  vibe: string; // e.g. "Energetic Outdoor", "Intimate Clubbing", "Day & Night Festival"
  isFavorite?: boolean; // Starred by user
  isInternational?: boolean; // True if event is abroad (ESTERO)
  trackSample?: {
    title: string;
    artist: string;
    bpm: number;
    genre: string;
  };
}

export type SlideType = 'intro' | 'timeline' | 'map' | 'event' | 'duo-consigli' | 'partecipa';

export interface EventRegistration {
  id: string;
  firstName: string;
  lastName: string;
  instagram?: string; // Optional Instagram handle
  whatsapp: string; // WhatsApp number
  eventIds: string[]; // List of selected event IDs
  seeksAccommodation: boolean; // Flag to indicate if they need lodging with us
  accommodationNote?: string; // Optional accommodation preference note (max 300 chars)
  createdAt: number;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle: string;
  eventId?: string; // If this slide represents a specific event
  customHeader?: string;
}

export interface DeckConfig {
  backgroundOpacity: number; // 0 to 100
  isAutoPlay: boolean;
  autoPlayDuration: number; // seconds
  backgroundBlur: number; // 0 to 20 px
  theme: 'dark' | 'light' | 'neon-dance';
}
