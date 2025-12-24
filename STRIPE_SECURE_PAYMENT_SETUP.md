# Secure Stripe Payment Setup Guide

## Environment Variables Required

You need to add your Stripe secret key to Netlify environment variables.

### Local Development

Create a `.env` file in the root of your project (if it doesn't exist):

```env
STRIPE_SECRET_KEY=sk_test_51ShCQ
```

### Production (Netlify)

1. Go to your Netlify Dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add a new variable:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_YOUR_LIVE_SECRET_KEY_HERE` (replace with your actual live secret key)

> **⚠️ CRITICAL**: Never commit your `.env` file to Git. It should be in `.gitignore`.

---

## How the Secure Payment Flow Works

### 1. User Initiates Payment

- User fills out booking form
- Unchecks "Pay in store"
- Clicks "Confirm Booking"

### 2. Create Checkout Session (Backend)

- Frontend calls `/.netlify/functions/create-checkout-session`
- Backend creates Stripe Checkout Session with booking data in metadata
- Returns session URL to frontend

### 3. Redirect to Stripe

- User is redirected to Stripe's hosted checkout page
- User enters payment details securely on Stripe's servers

### 4. Payment Completion

- User completes payment
- Stripe redirects to: `/book?session_id=cs_test_...`

### 5. Payment Verification (Backend)

- Frontend detects `session_id` parameter
- Calls `/.netlify/functions/verify-payment?session_id=...`
- Backend retrieves session from Stripe API
- Verifies `payment_status === 'paid'`
- Returns booking data if verified

### 6. Create Booking

- If payment verified, booking is created
- Confirmation modal appears
- User can add to Google Calendar

---

## Security Features

✅ **Server-side verification**: Payment status checked on backend, not frontend  
✅ **Cryptographic session IDs**: Cannot be faked or guessed  
✅ **No URL manipulation**: Manual URL entry won't work without valid paid session  
✅ **Booking data integrity**: Data stored in Stripe session metadata  
✅ **Secret key protection**: Never exposed to frontend  

---

## Testing the Secure Flow

### Test Successful Payment

1. Start dev server: `npx netlify dev`
2. Go to `/book`
3. Fill out form
4. **Uncheck** "Pay in store"
5. Click "Confirm Booking"
6. You'll be redirected to Stripe Checkout
7. Use test card: `4242 4242 4242 4242`
8. Enter any future expiry date and CVC
9. Complete payment
10. **Expected**: Redirected back, "Verifying payment..." banner appears, then confirmation modal

### Test Security (Manual URL Entry)

1. Manually navigate to: `http://localhost:8888/book?session_id=fake_session_id`
2. **Expected**: Error message appears: "Payment verification failed"
3. No booking is created

### Test Pay in Store (Still Works)

1. Fill out form
2. **Check** "Pay in store"
3. Click "Confirm Booking"
4. **Expected**: Booking created immediately, confirmation modal appears

---

## Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

---

## Production Checklist

- [ ] Add `STRIPE_SECRET_KEY` to Netlify environment variables (live key)
- [ ] Update `stripe.ts` with live publishable key
- [ ] Test with real card (small amount, can refund)
- [ ] Verify payment verification works
- [ ] Verify booking creation works
- [ ] Monitor Stripe Dashboard for payments

---

## Troubleshooting

### "Failed to create checkout session"

- Check that `STRIPE_SECRET_KEY` is set in environment variables
- Verify the secret key is valid (starts with `sk_test_` or `sk_live_`)
- Check Netlify function logs for errors

### "Payment verification failed"

- Session ID might be invalid or expired
- Payment might not have been completed
- Check Stripe Dashboard to see payment status

### Booking created without payment

- This should NOT happen with the new secure flow
- If it does, there's a bug - contact support

---

## Files Modified

- `netlify/functions/create-checkout-session.ts` - Creates Stripe Checkout Session
- `netlify/functions/verify-payment.ts` - Verifies payment completion
- `src/components/BookingForm/BookingForm.tsx` - Creates checkout session instead of direct redirect
- `src/pages/Booking/BookingPage.tsx` - Verifies payment before creating booking
