/**
 * ENTRY POINT: Ali's Barbers React App
 * 
 * ROLE: Initializes the React application, sets up global providers, 
 * and renders the app into the 'root' DOM element.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Global styles
import App from './App' // Root component

// Google OAuth Wrapper - Required for "Add to Calendar" functionality
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { GOOGLE_CONFIG } from './config/calendar';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provides the Google Client ID to the entire app for user authentication */}
    {/* <GoogleOAuthProvider clientId={GOOGLE_CONFIG.clientId}> */}
    <App />
    {/* </GoogleOAuthProvider> */}
  </StrictMode>,
)
