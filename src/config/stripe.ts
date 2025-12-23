/**
 * CONFIGURATION: Stripe Payment Settings
 * 
 * ROLE: Centralized Stripe configuration for payment integration.
 * SETTINGS: Includes publishable key, buy button ID, and checkout URL.
 * 
 * SECURITY: The publishable key (pk_test_* or pk_live_*) is SAFE to expose in frontend code.
 * NEVER include the secret key (sk_test_* or sk_live_*) in frontend code.
 */

export interface StripeConfig {
    publishableKey: string;
    checkoutUrl: string;
    successUrl: string;
}

// Determine if we're in production based on hostname
const isProduction = window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('127.0.0.1');

export const STRIPE_CONFIG: StripeConfig = {
    // Publishable key - safe to expose in frontend code
    publishableKey: isProduction
        ? 'pk_live_51ShCQg2cVSzlDC9ITW7JsxdPC9mJZqt3hHSyljQ4zkdKQL7af6gI8wseKnJU8ZUuseOibzp3B1Z3Wu5BNpsrIM6e002U0DPDS1'
        : 'pk_test_51ShCQoGpjba4drjSVwKH2A65Q904TMxWSQr0LaFLwGoPZLAgS3dAvntfLxuwfQh7Bb28vCl1D7Vg1e7ft4uWu8UY00G6ZJvcQt',

    // Checkout URL - Payment Link from Stripe Dashboard
    checkoutUrl: isProduction
        ? 'https://book.stripe.com/test_5kQ4gz4URa9e1WZ9N81kA00'
        : 'https://buy.stripe.com/bJeaEQcQU2im8Iic34bjW01',

    // Success redirect URL - automatically uses correct domain
    successUrl: `${window.location.origin}/book?payment=success`,
};

// Note: Secret key should NEVER be stored here or used in frontend code
// Secret key is only for backend/serverless functions
