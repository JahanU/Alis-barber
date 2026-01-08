/**
 * BACKEND FUNCTION: Verify Stripe Payment
 * 
 * ROLE: Verifies that a Stripe Checkout Session was successfully paid.
 * SECURITY: Prevents booking creation without confirmed payment.
 */
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { BookingData } from '../../src/config/booking-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handler: Handler = async (event) => {
    const sessionId = event.queryStringParameters?.session_id;

    if (!sessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                verified: false,
                error: 'Missing session_id parameter'
            }),
        };
    }

    try {
        // Retrieve session from Stripe to verify payment
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verified: false,
                    error: 'Payment not completed',
                    paymentStatus: session.payment_status
                }),
            };
        }

        const durationMinutes = session.metadata?.serviceDuration
            ? Number(session.metadata.serviceDuration)
            : 0;

        const price = session.metadata?.servicePrice
            ? Number(session.metadata.servicePrice)
            : 0;

        // Extract booking data from session metadata
        const bookingData: BookingData = {
            customer: {
                name: session.metadata?.customerName || '',
                email: session.metadata?.customerEmail || session.customer_email || '',
                phone: session.metadata?.customerPhone || '',
            },
            service: {
                id: session.metadata?.serviceId || '',
                name: session.metadata?.serviceName || '',
                duration: durationMinutes,
                price: price,
                category: session.metadata?.serviceCategory as 'inShop' | 'home',
            },
            bookingDetails: {
                date: session.metadata?.date || '',
                timeSlot: session.metadata?.timeSlot || '',
                payInStore: session.metadata?.payInStore === 'true',
                stripePaymentPaid: session.payment_status === 'paid',
            }
        };

        console.log('Verified Booking Data:', bookingData);

        // Validate booking data
        if (!bookingData.bookingDetails.date || !bookingData.bookingDetails.timeSlot) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    verified: false,
                    error: 'Invalid booking data in session'
                }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                verified: true,
                bookingData,
                sessionId: session.id,
            }),
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Payment Verification Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                verified: false,
                error: 'Payment verification failed',
                message
            }),
        };
    }
};
