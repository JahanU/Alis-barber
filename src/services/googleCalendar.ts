/**
 * SHARED TYPES: Booking data shape reused across client and Netlify functions.
 */
import type { Service, Customer, BookingDetails } from '../config/booking-types';


export type BookingData = {
    customer: Customer;
    service: Service;
    bookingDetails: BookingDetails;
};
