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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
