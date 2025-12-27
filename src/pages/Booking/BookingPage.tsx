import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import BookingForm from '../../components/BookingForm/BookingForm';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { BookingData } from '../../services/googleCalendar';
import { createAppointment } from '../../services/appointmentService';

function BookingPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

    const handleBookingSubmit = useCallback(async (formData: BookingData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // 1. Create Google Calendar booking first to get the event ID
            const response = await fetch('/.netlify/functions/create-booking', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const { eventId } = await response.json();

            // 2. Create appointment in Supabase with the Google Event ID
            // Convert time slot to HH:MM format for database
            const timeSlotForDb = formData.bookingDetails.timeSlot; // e.g., "2:00 PM"
            const [time, period] = timeSlotForDb.split(' ');
            let [hour] = time.split(':').map(Number);
            if (period === 'PM' && hour !== 12) hour += 12;
            else if (period === 'AM' && hour === 12) hour = 0;
            const appointmentTime = `${hour.toString().padStart(2, '0')}:00`;

            const appointmentData = {
                customer_name: formData.customer.name,
                customer_email: formData.customer.email,
                customer_phone: formData.customer.phone,
                service_id: formData.service.id,
                service_name: formData.service.name,
                service_price: formData.service.price,
                appointment_date: formData.bookingDetails.date,
                appointment_time: appointmentTime,
                payment_status: (formData.bookingDetails.payInStore ? 'pay_in_store' : 'paid') as 'pay_in_store' | 'paid',
                google_event_id: eventId, // Save the ID in the initial insert!
            };

            const savedAppointment = await createAppointment(appointmentData);
            console.log('Appointment created in Supabase with Google ID:', savedAppointment.id);

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

        if (sessionId) {
            // Verify payment with backend
            setIsVerifyingPayment(true);

            fetch(`/.netlify/functions/verify-payment?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.verified && data.bookingData) {
                        // Clear URL params
                        window.history.replaceState({}, '', '/book');

                        // Payment confirmed - create booking
                        handleBookingSubmit(data.bookingData);
                    } else {
                        setError(data.error || 'Payment verification failed. Please contact support.');
                    }
                })
                .catch(err => {
                    console.error('Payment verification error:', err);
                    setError('Failed to verify payment. Please contact support.');
                })
                .finally(() => {
                    setIsVerifyingPayment(false);
                });
        }
    }, [handleBookingSubmit]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsAddingToCalendar(true);

                const startTime = new Date(bookingData!.bookingDetails.date);
                const [time, period] = bookingData!.bookingDetails.timeSlot.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                else if (period === 'AM' && hours === 12) hours = 0;
                startTime.setHours(hours, minutes || 0, 0, 0);

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

            {isVerifyingPayment && (
                <div className="error-banner" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="container">
                        <span>🔒 Verifying payment...</span>
                    </div>
                </div>
            )}

            <div className="booking-view">
                <div className="container">
                    <BookingForm
                        onSubmit={handleBookingSubmit}
                        onCancel={() => navigate('/')}
                        isSubmitting={isSubmitting || isVerifyingPayment}
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
