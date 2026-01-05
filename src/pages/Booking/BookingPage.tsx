import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../../components/BookingForm/BookingForm';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { BookingData } from '../../services/googleCalendar';
import { buildCalendarInvite } from '../../utils/calendarInvite';

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
            // TODO: We need the Google event ID so cancellations can reflect on the customer's calendar
            const response = await fetch('/.netlify/functions/create-booking', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const { eventId } = await response.json();

            // 2. Save appointment to Database (Supabase)
            try {
                await fetch('/.netlify/functions/save-appointment', {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingData: formData,
                        googleEventId: eventId
                    }),
                });
            } catch (dbErr) {
                console.error('[Booking] Sequential DB call failed (non-critical):', dbErr);
                // Sequential DB call failed (non-critical)
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

    const handleAddToCalendar = useCallback(() => {
        if (!bookingData) return;

        setIsAddingToCalendar(true);

        let downloadUrl: string | null = null;
        try {
            const { filename, content } = buildCalendarInvite(bookingData);
            const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
            downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert('Calendar file downloaded. Import it into your calendar app to save the appointment.');
            setBookingData(null);
            navigate('/');
        } catch (err) {
            console.error('Calendar file error:', err);
            setError('Booking completed, but we could not generate the calendar file. Please try again.');
        } finally {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
            setIsAddingToCalendar(false);
        }
    }, [bookingData, navigate]);

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
                    onAddToCalendar={handleAddToCalendar}
                    isAddingToCalendar={isAddingToCalendar}
                />
            )}
        </div>
    );
};

export default BookingPage;
