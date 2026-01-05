/**
 * API SERVICE: Backend Bridge
 * 
 * ROLE: Connects the React frontend to the Netlify backend functions.
 * ACTIONS: Sends booking data from the form to the 'create-booking' server-side function.
 */
import { BookingData } from '../config/booking-types';

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
