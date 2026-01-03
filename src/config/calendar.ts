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
