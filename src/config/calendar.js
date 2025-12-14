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
  // Default calendar to add events to ('primary' = user's primary calendar)
  calendarId: 'primary',
  
  // Event duration in hours
  eventDuration: 1,
  
  // Business hours
  businessHours: {
    start: 9, // 9 AM
    end: 18,  // 6 PM
  },
  
  // Time zone
  timeZone: 'America/New_York', // Update this to your barber shop's timezone
};
