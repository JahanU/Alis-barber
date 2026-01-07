# Production Deployment Checklist for Stripe Integration

## Security Status: ✅ SECURE

Your current `stripe.ts` configuration is **SECURE** because:
- ✅ Only uses **publishable keys** (pk_test_* or pk_live_*) - safe for frontend
- ✅ Never exposes **secret keys** (sk_test_* or sk_live_*) - kept in backend only
- ✅ Publishable keys are designed to be public and client-side safe

---

## What You Need to Do for Production

### 1. Create Live Stripe Payment Link

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) (switch to **Live mode**)
2. Navigate to **Payment Links** → **Create payment link**
3. Configure your product/service details
4. Set the price
5. Under **After payment** → Set redirect URL to: `https://yourdomain.com/book?payment=success`
6. Save and copy the payment link URL (starts with `https://book.stripe.com/...`)

### 2. Get Your Live Publishable Key

1. In Stripe Dashboard (**Live mode**)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_live_...`)
4. ⚠️ **NEVER** copy the Secret key for frontend use

### 3. Update `src/config/stripe.ts`

Replace the placeholder values in the production section:

```typescript
publishableKey: isProduction 
    ? 'pk_live_YOUR_ACTUAL_LIVE_KEY_HERE'  // ← Replace this
    : 'pk_test_51ShCQoGpjba4drjSVwKH2A65Q904TMxWSQr0LaFLwGoPZLAgS3dAvntfLxuwfQh7Bb28vCl1D7Vg1e7ft4uWu8UY00G6ZJvcQt',

checkoutUrl: isProduction
    ? 'https://book.stripe.com/YOUR_LIVE_LINK_HERE'  // ← Replace this
    : 'https://book.stripe.com/test_5kQ4gz4URa9e1WZ9N81kA00',
```

### 4. Deploy to Production

```bash
# Build your app
npm run build

# Deploy to Netlify (or your hosting platform)
netlify deploy --prod
```

### 5. Test Production Payment Flow

1. Visit your production site
2. Fill out booking form
3. Uncheck "Pay in store"
4. Click "Confirm Booking"
5. Complete payment with **real card** (you can refund it later)
6. Verify redirect works and booking is created

---

## How the Code Works

### Automatic Environment Detection

The code automatically detects the environment:

```typescript
const isProduction = window.location.hostname !== 'localhost' && 
                     !window.location.hostname.includes('127.0.0.1');
```

- **Local**: `localhost:8888` → Uses test keys
- **Production**: `yourdomain.com` → Uses live keys

### Success URL

The success URL automatically adapts:

```typescript
successUrl: `${window.location.origin}/book?payment=success`
```

- **Local**: `http://localhost:8888/book?payment=success`
- **Production**: `https://yourdomain.com/book?payment=success`

---

## Security Best Practices ✅

### ✅ What's Safe in Frontend

- **Publishable keys** (`pk_test_*` or `pk_live_*`)
- Payment link URLs
- Buy button IDs

### ❌ What's NEVER Safe in Frontend

- **Secret keys** (`sk_test_*` or `sk_live_*`)
- Webhook signing secrets
- API credentials

### Your Current Setup

✅ **SECURE** - You're only using publishable keys and payment links
✅ **CORRECT** - Secret key is only in backend (`netlify/functions/create-booking.ts`)

---

## Optional: Environment Variables (Alternative Approach)

If you prefer using environment variables instead of hardcoding:

### 1. Create `.env` file (local)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ShCQoGpjba4drjSVwKH2A65Q904TMxWSQr0LaFLwGoPZLAgS3dAvntfLxuwfQh7Bb28vCl1D7Vg1e7ft4uWu8UY00G6ZJvcQt
VITE_STRIPE_CHECKOUT_URL=https://book.stripe.com/test_5kQ4gz4URa9e1WZ9N81kA00
```

### 2. Set Netlify Environment Variables (production)

In Netlify Dashboard:
- Go to **Site settings** → **Environment variables**
- Add:
  - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
  - `VITE_STRIPE_CHECKOUT_URL` = `https://book.stripe.com/...`

### 3. Update `stripe.ts`

```typescript
export const STRIPE_CONFIG: StripeConfig = {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    checkoutUrl: import.meta.env.VITE_STRIPE_CHECKOUT_URL || '',
    successUrl: `${window.location.origin}/book?payment=success`,
    mode: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') ? 'live' : 'test',
};
```

---

## Testing Checklist

### Local Testing (Test Mode) ✅
- [x] Payment redirect works
- [x] Confirmation modal appears
- [x] Booking is created
- [x] Test card `4242 4242 4242 4242` works

### Production Testing (Live Mode)
- [ ] Create live payment link in Stripe
- [ ] Update production keys in code
- [ ] Deploy to production
- [ ] Test with real card (small amount)
- [ ] Verify redirect works
- [ ] Verify booking is created
- [ ] Refund test payment

---

## Support & Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Payment Links Docs](https://stripe.com/docs/payment-links)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)

---

## Summary

**Current Status**: ✅ Secure and ready for production

**What you need**:
1. Live Stripe payment link
2. Live publishable key
3. Update 2 values in `stripe.ts`
4. Deploy

**Security**: ✅ Perfect - only using safe, public keys in frontend
