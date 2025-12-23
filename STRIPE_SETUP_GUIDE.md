# Stripe Payment Link Configuration Guide

This guide explains how to configure your Stripe payment link to redirect back to your application after payment completion or cancellation.

## Problem

After a successful payment on Stripe, users stay on the Stripe "Payment Complete" screen instead of being redirected back to your application to complete the booking.

## Solution

Configure the **Success URL** and **Cancel URL** in your Stripe Dashboard for the payment link.

---

## Step-by-Step Instructions

### 1. Access Stripe Dashboard

1. Go to [https://dashboard.stripe.com/test/payment-links](https://dashboard.stripe.com/test/payment-links)
2. Log in to your Stripe account

### 2. Find Your Payment Link

1. Look for the payment link with URL: `https://book.stripe.com/test_5kQ4gz4URa9e1WZ9N81kA00`
2. Click on it to view details

### 3. Edit Payment Link Settings

1. Click the **"Edit"** or **"⋮" (three dots)** button
2. Select **"Edit payment link"**

### 4. Configure After Payment Settings

Scroll down to the **"After payment"** section and configure:

#### For Local Development (Netlify Dev):
- **Success URL**: `http://localhost:8888/book?payment=success`
- **Cancel URL**: `http://localhost:8888/book?payment=cancel`

#### For Production:
- **Success URL**: `https://yourdomain.com/book?payment=success`
- **Cancel URL**: `https://yourdomain.com/book?payment=cancel`

> **Note**: Replace `yourdomain.com` with your actual production domain.

### 5. Save Changes

Click **"Save"** or **"Update payment link"** to apply the changes.

---

## How It Works

Once configured, the payment flow will work as follows:

### Successful Payment Flow

1. User fills out booking form
2. User leaves "Pay in store" unchecked
3. User clicks "Confirm Booking"
4. User is redirected to Stripe checkout
5. User completes payment
6. **Stripe redirects to**: `http://localhost:8888/book?payment=success`
7. Your app detects the `?payment=success` parameter
8. Booking data is retrieved from sessionStorage
9. Booking is created in your system
10. Confirmation modal appears
11. User can add to Google Calendar

### Cancelled Payment Flow

1. User is on Stripe checkout page
2. User clicks "Back" or closes the page
3. **Stripe redirects to**: `http://localhost:8888/book?payment=cancel`
4. Your app detects the `?payment=cancel` parameter
5. Error message appears: "Payment was cancelled. Please try again."
6. User can retry the booking

---

## Testing the Configuration

### Test Successful Payment

1. Go to your booking page: `http://localhost:8888/book`
2. Fill out the form
3. **Uncheck** "Pay in store"
4. Click "Confirm Booking"
5. On Stripe checkout, use test card: `4242 4242 4242 4242`
6. Enter any future expiry date and any 3-digit CVC
7. Complete payment
8. **Expected**: You should be redirected back to `/book` and see the confirmation modal

### Test Cancelled Payment

1. Go to your booking page: `http://localhost:8888/book`
2. Fill out the form
3. **Uncheck** "Pay in store"
4. Click "Confirm Booking"
5. On Stripe checkout, click the **back arrow** or **close the page**
6. **Expected**: You should be redirected back to `/book` and see an error message

---

## Troubleshooting

### Issue: Still staying on Stripe page after payment

**Possible causes**:
1. URLs not saved in Stripe Dashboard
2. Using wrong payment link
3. Browser cache (try incognito mode)

**Solution**: 
- Double-check the URLs are saved in Stripe Dashboard
- Clear browser cache or use incognito mode
- Verify you're using the correct payment link

### Issue: Redirects but booking not created

**Possible causes**:
1. sessionStorage data was cleared
2. Browser blocked sessionStorage
3. Network error during booking creation

**Solution**:
- Check browser console for errors
- Verify sessionStorage is enabled in browser
- Check network tab for failed API calls

### Issue: Error "Payment was cancelled" appears immediately

**Possible causes**:
1. URL has `?payment=cancel` parameter from previous test
2. Browser back button was used

**Solution**:
- Manually navigate to `/book` (without parameters)
- Clear the URL parameters

---

## Production Deployment Checklist

Before going live, update the following:

### 1. Update Stripe Configuration

In `src/config/stripe.ts`:
```typescript
export const STRIPE_CONFIG: StripeConfig = {
    publishableKey: 'pk_live_...', // Replace with live key
    buyButtonId: 'buy_btn_...', // Replace with live button ID
    checkoutUrl: 'https://book.stripe.com/...', // Replace with live URL
    successUrl: `https://yourdomain.com/book?payment=success`,
    cancelUrl: `https://yourdomain.com/book?payment=cancel`,
    mode: 'live', // Change from 'test' to 'live'
};
```

### 2. Update Stripe Dashboard

1. Create a **live mode** payment link
2. Configure success/cancel URLs with your production domain
3. Test with live Stripe account (small amount)

### 3. Test Production Flow

1. Make a real test payment (you can refund it later)
2. Verify redirect works correctly
3. Verify booking is created
4. Verify confirmation modal appears

---

## Additional Resources

- [Stripe Payment Links Documentation](https://stripe.com/docs/payment-links)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the Network tab for failed API calls
3. Verify sessionStorage contains `pendingBooking` data before redirect
4. Ensure Stripe Dashboard URLs match exactly (including protocol `http://` or `https://`)
