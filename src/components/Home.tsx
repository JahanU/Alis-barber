import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import Gallery from './Gallery';
import BookingForm from './BookingForm';
import ConfirmationModal from './ConfirmationModal';
import { initGoogleClient, signIn, createCalendarEvent, isSignedIn, BookingData } from '../services/googleCalendar';
import '../App.css';

const Home: React.FC = () => {
    const [currentView, setCurrentView] = useState<'hero' | 'booking' | 'confirmation'>('hero');
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isGoogleInitialized, setIsGoogleInitialized] = useState<boolean>(false);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleBookingSubmit = (formData: BookingData) => {
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

            if (!bookingData) {
                throw new Error('No booking data available');
            }

            // Create the calendar event
            await createCalendarEvent(bookingData);

            alert('Successfully added to Google Calendar! Check your calendar for the appointment.');
        } catch (error: any) {
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
                <>
                    <Hero onBookNow={handleBookNowClick} />
                    <Gallery />
                </>
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
};

export default Home;
