import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import BookingForm from '../../components/BookingForm/BookingForm';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { BookingData } from '../../services/googleCalendar';
import { parseTimeSlot } from '../../utils/timeUtils';

function BookingPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isProcessingPayment = useRef(false);

    // TODO review later on order of operations and async etc
    const handleBookingSubmit = useCallback(async (formData: BookingData) => {
        try {
            setIsSubmitting(true);
            setError(null);
            // 1. Create Google Calendar booking + Email
            const response = await fetch('/.netlify/functions/create-booking', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const { eventId } = await response.json();
            console.log(`[Booking] Calendar Event Created: ${eventId}`);

            // 2. Save appointment to Database (Supabase)
            try {
                const dbResponse = await fetch('/.netlify/functions/save-appointment', {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingData: formData,
                        googleEventId: eventId
                    }),
                });

                if (dbResponse.ok) {
                    const { appointmentId } = await dbResponse.json();
                    console.log(`[Booking] Database Record Created: ${appointmentId}`);
                } else {
                    const dbError = await dbResponse.json();
                    console.error('[Booking] Database record failed (non-critical):', dbError.message);
                }
            } catch (dbErr) {
                console.error('[Booking] Sequential DB call failed (non-critical):', dbErr);
                // We keep moving because the calendar event IS created
            }
            setBookingData(formData);
        } catch (err: any) {
            console.error('Booking error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    // Handle return from Stripe payment
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId && !isProcessingPayment.current) {
            isProcessingPayment.current = true; // Lock the door

            fetch(`/.netlify/functions/verify-payment?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.verified && data.bookingData) {
                        window.history.replaceState({}, '', '/book');
                        handleBookingSubmit(data.bookingData);
                    } else {
                        throw new Error(data.error || 'Payment verification failed.');
                    }
                })
                .catch(err => {
                    console.error('Payment error:', err);
                    setError(err.message);
                    isProcessingPayment.current = false; // Unlock on failure
                })
        }
    }, [handleBookingSubmit]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsAddingToCalendar(true);

                const startTime = new Date(bookingData!.bookingDetails.date);
                const { hours, minutes } = parseTimeSlot(bookingData!.bookingDetails.timeSlot);
                startTime.setHours(hours, minutes, 0, 0);


                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 1);

                const event = {
                    summary: `Barber Appointment - ${bookingData!.service}`,
                    description: `Classic haircut appointment at Ali Barbers`,
                    start: { dateTime: startTime.toISOString() },
                    end: { dateTime: endTime.toISOString() },
                };

                const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event),
                });

                if (response.ok) {
                    alert('Successfully added to your Google Calendar!');
                } else {
                    throw new Error('Failed to add to calendar');
                }
            } catch (err) {
                console.error('Calendar error:', err);
                alert('Heads up: Booking was successful, but we couldn\'t add it to your calendar.');
            } finally {
                setIsAddingToCalendar(false);
                setBookingData(null);
                navigate('/');
            }
        },
        scope: 'https://www.googleapis.com/auth/calendar.events',
    });

    return (
        <div className="booking-page-wrapper">
            {error && (
                <div className="error-banner">
                    <div className="container">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>&times;</button>
                    </div>
                </div>
            )}

            <div className="booking-view">
                <div className="container">
                    <BookingForm
                        onSubmit={handleBookingSubmit}
                        onCancel={() => navigate('/')}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>

            {bookingData && (
                <ConfirmationModal
                    bookingDetails={bookingData}
                    onClose={() => {
                        setBookingData(null);
                        navigate('/');
                    }}
                    onAddToCalendar={() => googleLogin()}
                    isAddingToCalendar={isAddingToCalendar}
                />
            )}
        </div>
    );
};

export default BookingPage;
