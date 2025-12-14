// Google Calendar API Configuration
export const GOOGLE_CONFIG = {
  // TODO: Replace with your Google OAuth Client ID
  // Get this from: https://console.cloud.google.com/apis/credentials
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // API scopes - what permissions we're requesting
  scopes: 'https://www.googleapis.com/auth/calendar.events',

  // Discovery docs for Google Calendar API
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
};

// Calendar event settings
export const CALENDAR_SETTINGS = {
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
