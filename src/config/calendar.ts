/**
 * CONFIGURATION: Google & Calendar Settings
 * 
 * ROLE: Centralized settings for both frontend and backend integrations.
 * SETTINGS: Includes OAuth Client IDs, business hours, and default calendar aliases.
 */

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
