// Google Calendar API Configuration
export interface GoogleConfig {
  clientId: string;
  scopes: string;
  discoveryDocs: string[];
}

export const GOOGLE_CONFIG: GoogleConfig = {
  // TODO: Replace with your Google OAuth Client ID
  // Get this from: https://console.cloud.google.com/apis/credentials
  clientId: '938898755882-87j0aied3gf991t1f0n6eh1meo8rgvb9.apps.googleusercontent.com',

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
  // Calendar to add events to - All bookings will go to this calendar
  calendarId: 'JahannU12@gmail.com',

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
