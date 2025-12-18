// Google Calendar API Configuration
export interface GoogleConfig {
  clientId: string;
  scopes: string;
  discoveryDocs: string[];
}

export const GOOGLE_CONFIG: GoogleConfig = {
  // TODO: Replace with your Google OAuth Client ID
  // Get this from: https://console.cloud.google.com/apis/credentials
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // API scopes - what permissions we're requesting
  scopes: 'https://www.googleapis.com/auth/calendar.events',

  // Discovery docs for Google Calendar API
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
};

// Calendar event settings
export interface CalendarSettings {
  calendarId: string;
  eventDuration: number;
  businessHours: {
    start: number;
    end: number;
  };
  timeZone: string;
}

export const CALENDAR_SETTINGS: CalendarSettings = {
  // Calendar to add events to - 'primary' means the user's main calendar
  calendarId: 'primary',

  // Event duration in hours
  eventDuration: 1,

  // Business hours
  businessHours: {
    start: 9, // 9 AM
    end: 18,  // 6 PM
  },

  // Time zone
  timeZone: 'Europe/London', // UK timezone
};
