/**
 * BACKEND FUNCTION: Create Stripe Checkout Session
 * 
 * ROLE: Creates a secure Stripe Checkout Session for payment processing.
 * SECURITY: Payment verification happens server-side via session ID.
 */
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { BookingData } from '../../src/services/googleCalendar';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const bookingData: BookingData = JSON.parse(event.body || '{}'); // Parse booking data from request body
        // Validate required fields
        if (Object.keys(bookingData).length === 0 || Object.keys(bookingData.customer).length === 0 || Object.keys(bookingData.service).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required booking data' }),
            };
        }
        const { service, date, timeSlot, customer } = bookingData;
        // Determine base URL (works in both local and production)
        const baseUrl = process.env.URL || 'http://localhost:8888';
        const price = Number(service.price.replace(/[^\d.]/g, ''));

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Ali Barbers',
                        description: `${service.name} - ${date} at ${timeSlot}`,
                    },
                    unit_amount: price * 100, // Stripe takes cents, so multiply by 100
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${baseUrl}/book?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/book`,
            customer_email: customer.email,
            metadata: {
                // Store booking data in session metadata for later retrieval
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                serviceId: service.id,
                serviceName: service.name,
                servicePrice: service.price,
                serviceCategory: service.category,
                date,
                timeSlot,
            },
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: session.id,
                url: session.url
            }),
        };
    } catch (error: any) {
        console.error('Stripe Checkout Session Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create checkout session',
                message: error.message
            }),
        };
    }
};
