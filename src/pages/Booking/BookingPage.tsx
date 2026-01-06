import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../../components/BookingForm/BookingForm';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { BookingData } from '../../config/booking-types';
import { buildCalendarInvite } from '../../utils/calendarInvite';

function BookingPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isProcessingPayment = useRef(false);

    const handleBookingSubmit = useCallback(async (formData: BookingData) => {
        try {
            setIsSubmitting(true);
            setError(null);
            let appointmentId: string | null = null;

            // 1) Save appointment first (critical) with no Google event yet
            const saveResponse = await fetch('/.netlify/functions/save-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingData: formData,
                    googleEventId: null
                }),
            });

            if (!saveResponse.ok) {
                let message = 'Failed to save booking';
                try {
                    const errorData = await saveResponse.json();
                    message = errorData.message || message;
                } catch (parseErr) {
                    console.warn('Failed to parse save-appointment error response:', parseErr);
                }
                throw new Error(message);
            }

            const saveData = await saveResponse.json();
            appointmentId = saveData?.appointmentId || null;

            setBookingData(formData); // confirmation shown after successful save

            // 2) In background, create Google Calendar event & send email
            void fetch('/.netlify/functions/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }).then(async response => {
                if (!response.ok) {
                    let message = 'Booking saved, but calendar/email failed.';
                    try {
                        const errorData = await response.json();
                        message = errorData.message || message;
                    } catch (parseErr) {
                        console.warn('Failed to parse create-booking error response:', parseErr);
                    }
                    setError(message);
                    return;
                }

                const { eventId } = await response.json();

                // 3) Update appointment with Google Event ID
                if (appointmentId && eventId) {
                    void fetch('/.netlify/functions/update-appointment-google-id', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            appointmentId,
                            googleEventId: eventId,
                        }),
                    }).catch(updateErr => {
                        console.warn('Failed to update appointment with Google event ID:', updateErr);
                    });
                }
            }).catch(calendarErr => {
                console.error('Background calendar creation failed:', calendarErr);
                setError('Booking saved, but we could not add it to the calendar.');
            });
        } catch (err: any) {
            console.error('Booking error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setBookingData(null);
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
