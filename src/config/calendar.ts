/**
 * CONFIGURATION: Google & Calendar Settings
 * 
 * ROLE: Centralized settings for both frontend and backend integrations.
 * SETTINGS: Includes OAuth Client IDs, business hours, and default calendar aliases.
 */

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  category: 'inShop' | 'home';
}

export const SERVICES: Service[] = [
  // In-Shop Services
  {
    id: 'haircut',
    name: 'Haircut',
    duration: '45 mins',
    price: '£25',
    category: 'inShop',
    description: 'Any style haircut with cut-throat razor hairline shape-up. Includes skin fade with foil shaver.'
  },
  {
    id: 'haircut_beard',
    name: 'Haircut & Beard',
    duration: '1 hour',
    price: '£30',
    category: 'inShop',
    description: 'Any style haircut and beard. Includes skin fade haircut with foil shaver and shape-up. Cut-throat razor used for beard shape-up and hairline shape-up.'
  },
  {
    id: 'beard',
    name: 'Beard',
    duration: '30 mins',
    price: '£15',
    category: 'inShop',
    description: 'Any beard style with beard shape-up and beard line-up. Includes foil shaver and cut-throat razor.'
  },
  // Home Services
  {
    id: 'home_haircut',
    name: 'Home Haircut',
    duration: '1 hour',
    price: '£60',
    category: 'home',
    description: 'Any style haircut with cut-throat razor hairline shape-up. Includes skin fade with foil shaver.'
  },
  {
    id: 'home_haircut_beard',
    name: 'Home Haircut & Beard',
    duration: '1 hour 15 mins',
    price: '£70',
    category: 'home',
    description: 'Any style haircut and beard. Includes skin fade haircut with foil shaver and shape-up. Cut-throat razor used for beard shape-up and hairline shape-up.'
  }
];

// Google OAuth Configuration - Used for "Add to Calendar" button on the frontend
export interface GoogleConfig {
  clientId: string; // Your unique Google Client ID (from .env)
  scopes: string;   // The specific permission level we are requesting (Calendar only)
}

export const GOOGLE_CONFIG: GoogleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scopes: 'https://www.googleapis.com/auth/calendar.events',
};

// Calendar Event & Scheduling Settings
export interface CalendarSettings {
  calendarId: string;    // The Barber's email or 'primary' for the user's main calendar
  eventDuration: number; // Length of a standard haircut (in hours)
  businessHours: {
    start: number;
    end: number;
  };
  timeZone: string; // The local timezone for the shop
}

export const CALENDAR_SETTINGS: CalendarSettings = {
  calendarId: 'primary',

  eventDuration: 1,
  businessHours: {
    start: 9,  // 9 AM
    end: 22,   // 10 PM
  },

  timeZone: 'Europe/London',
};
