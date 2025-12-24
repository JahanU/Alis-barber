/**
 * BACKEND FUNCTION: Verify Stripe Payment
 * 
 * ROLE: Verifies that a Stripe Checkout Session was successfully paid.
 * SECURITY: Prevents booking creation without confirmed payment.
 */
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

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

        // Extract booking data from session metadata
        const bookingData = {
            customer: {
                name: session.metadata?.customerName || '',
                email: session.metadata?.customerEmail || session.customer_email || '',
                phone: session.metadata?.customerPhone || '',
            },
            service: {
                id: session.metadata?.serviceId || '',
                name: session.metadata?.serviceName || '',
                duration: session.metadata?.serviceDuration || '',
                price: session.metadata?.servicePrice || '',
                category: session.metadata?.serviceCategory || '',
                description: session.metadata?.serviceDescription || '',
            },
            date: session.metadata?.date || '',
            timeSlot: session.metadata?.timeSlot || '',
            payInStore: false, // Payment was made via Stripe
        };

        // Validate booking data
        if (Object.keys(bookingData).length === 0 || Object.keys(bookingData.customer).length === 0 || Object.keys(bookingData.service).length === 0) {
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
    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                verified: false,
                error: 'Payment verification failed',
                message: error.message
            }),
        };
    }
};
