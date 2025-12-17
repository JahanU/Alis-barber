import { BookingData } from './googleCalendar';

export const createBooking = async (bookingData: BookingData) => {
    try {
        const response = await fetch('/.netlify/functions/create-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create booking');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};
