
import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import Gallery from './Gallery';
import BookingForm from './BookingForm';
import ConfirmationModal from './ConfirmationModal';
import { useGoogleLogin } from '@react-oauth/google';
import { initGoogleClient, createCalendarEvent, setAccessToken, BookingData } from '../services/googleCalendar';
import { createBooking } from '../services/bookingApi';
import '../App.css';

const Home: React.FC = () => {
    const [currentView, setCurrentView] = useState<'hero' | 'booking' | 'confirmation'>('hero');
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isGoogleInitialized, setIsGoogleInitialized] = useState<boolean>(false);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Google API client on mount
    useEffect(() => {
        const initializeGoogle = async () => {
            try {
                await initGoogleClient();
                setIsGoogleInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Google Calendar:', error);
                setError('Failed to connect to Google Calendar services');
            }
        };

        initializeGoogle();
    }, []);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsAddingToCalendar(true);
                // Set the access token for gapi client
                setAccessToken(tokenResponse.access_token);

                if (bookingData) {
                    await createCalendarEvent(bookingData);
                    alert('Booking added to your Google Calendar!');
                    handleCloseConfirmation();
                }
            } catch (error) {
                console.error('Error adding to calendar:', error);
                setError('Failed to add event to calendar. Please try again.');
            } finally {
                setIsAddingToCalendar(false);
            }
        },
        onError: (error) => {
            console.error('Login Failed:', error);
            setError('Google Sign-In failed. Please try again.');
        },
        scope: 'https://www.googleapis.com/auth/calendar.events',
    });

    const handleBookNowClick = () => {
        setCurrentView('booking');
        setError(null);
    };

    const handleBookingSubmit = async (formData: BookingData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Create booking via Netlify Function (Server-side)
            await createBooking(formData);

            setBookingData(formData);
            setCurrentView('confirmation');
            window.scrollTo(0, 0);
        } catch (error: any) {
            console.error('Booking failed:', error);
            setError(error.message || 'Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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

    const handleAddToCalendar = () => {
        if (!isGoogleInitialized) {
            setError('Google Calendar is not initialized. Please refresh the page and try again.');
            return;
        }
        login();
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
                            isSubmitting={isSubmitting}
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
