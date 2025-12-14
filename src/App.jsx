import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import ConfirmationModal from './components/ConfirmationModal';
import { initGoogleClient, signIn, createCalendarEvent, isSignedIn } from './services/googleCalendar';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('hero'); // 'hero', 'booking', 'confirmation'
  const [bookingData, setBookingData] = useState(null);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Google API client on mount
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await initGoogleClient();
        setIsGoogleInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        // App will still work, but calendar integration won't be available
      }
    };

    initGoogle();
  }, []);

  const handleBookNowClick = () => {
    setCurrentView('booking');
    setError(null);
  };

  const handleBookingSubmit = (formData) => {
    setBookingData(formData);
    setCurrentView('confirmation');
  };

  const handleCancelBooking = () => {
    setCurrentView('hero');
    setError(null);
  };

  const handleCloseConfirmation = () => {
    setCurrentView('hero');
    setBookingData(null);
    setError(null);
  };

  const handleAddToCalendar = async () => {
    if (!isGoogleInitialized) {
      setError('Google Calendar is not initialized. Please refresh the page and try again.');
      return;
    }

    setIsAddingToCalendar(true);
    setError(null);

    try {
      // Check if user is signed in, if not, sign them in
      if (!isSignedIn()) {
        await signIn();
      }

      // Create the calendar event
      await createCalendarEvent(bookingData);

      alert('Successfully added to Google Calendar! Check your calendar for the appointment.');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      setError(error.message || 'Failed to add to Google Calendar. Please try again.');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          <div className="container">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Close error">×</button>
          </div>
        </div>
      )}

      {currentView === 'hero' && (
        <Hero onBookNow={handleBookNowClick} />
      )}

      {currentView === 'booking' && (
        <div className="booking-view">
          <div className="container">
            <BookingForm
              onSubmit={handleBookingSubmit}
              onCancel={handleCancelBooking}
            />
          </div>
        </div>
      )}

      {currentView === 'confirmation' && bookingData && (
        <ConfirmationModal
          bookingDetails={bookingData}
          onClose={handleCloseConfirmation}
          onAddToCalendar={handleAddToCalendar}
          isAddingToCalendar={isAddingToCalendar}
        />
      )}

      <footer className="app-footer">
        <div className="container">
          <p>© 2024 Ali's Barbers. Premium barbering services.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
