/**
 * CONFIGURATION: Booking Types & Services
 * 
 * ROLE: Centralized definitions for services, customer data, and booking details.
 */

export interface Service {
    id: string;
    name: string;
    duration: string;
    price: string;
    description: string;
    category: 'inShop' | 'home';
}

export interface Customer {
    name: string;
    email: string;
    phone: string;
}

export interface BookingDetails {
    date: string;
    timeSlot: string;
    payInStore: boolean;
}
