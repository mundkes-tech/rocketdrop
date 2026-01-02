# 🔄 Stripe Integration Setup Guide

## Overview
Your project has been updated to use **Stripe** instead of Razorpay for payment processing.

---

## ✅ What Changed

### Frontend
- ✅ Updated checkout page to use Stripe Checkout
- ✅ Removed Razorpay script and imports
- ✅ Added Stripe.js and @stripe/react-stripe-js dependencies
- ✅ Changed payment method from "razorpay" to "stripe"

### Backend
- ✅ Created `/api/stripe/create-session` - Creates Stripe checkout sessions
- ✅ Created `/api/stripe/verify-payment` - Verifies payments
- ✅ Created `/api/stripe/webhook` - Handles Stripe webhook events
- ✅ Updated package.json with Stripe dependencies

### Database
- Add these columns to `orders` table (if not exists):
  ```sql
  ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255);
  ALTER TABLE orders ADD COLUMN stripe_payment_id VARCHAR(255);
  ```

---

## 🔑 What You Need to Do

### Step 1: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Go to **Developers** → **API Keys**
4. You'll see:
   - **Publishable Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)

**For Development**: Use test keys (they have `_test_` in them)  
**For Production**: Use live keys (they have `_live_` in them)

---

### Step 2: Add Environment Variables

Create/update `.env.local`:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
```

**Important**: 
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_`
- `STRIPE_SECRET_KEY` starts with `sk_` (keep this SECRET!)
- `STRIPE_WEBHOOK_SECRET` is used to verify webhook signatures

---

### Step 3: Set Up Webhooks

Stripe webhooks notify your app when payments succeed.

#### For Development (Using Stripe CLI):

1. Download [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### For Production:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `charge.refunded`
5. Copy the signing secret and set as `STRIPE_WEBHOOK_SECRET` in production

---

### Step 4: Update Database

Add Stripe columns to orders table:

```sql
ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) AFTER razorpay_payment_id;
ALTER TABLE orders ADD COLUMN stripe_payment_id VARCHAR(255) AFTER stripe_session_id;
```

Or if starting fresh:

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total_amount DECIMAL(10, 2),
  payment_mode VARCHAR(50), -- 'stripe' or 'cod'
  payment_status VARCHAR(20), -- 'pending', 'paid', 'failed'
  status VARCHAR(20), -- 'pending', 'processing', 'completed'
  
  -- Stripe fields
  stripe_session_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  
  -- Other fields
  recipient_name VARCHAR(255),
  shipping_address TEXT,
  phone VARCHAR(20),
  coupon_code VARCHAR(50),
  coupon_discount DECIMAL(10, 2),
  final_total DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Step 5: Install Dependencies

```bash
npm install
# or
yarn install
```

This will install the new Stripe packages:
- `@stripe/stripe-js` - Stripe.js library
- `@stripe/react-stripe-js` - React wrapper for Stripe
- `stripe` - Stripe server SDK (for backend)

---

### Step 6: Test Locally

1. Start your app: `npm run dev`
2. Run Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Go to checkout and try payment with test card: **4242 4242 4242 4242**
4. Expiry: any future date (e.g., 12/25)
5. CVC: any 3 digits (e.g., 123)

---

## 🧪 Test Payment Cards

Use these cards in **test mode**:

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | ⚠️ Requires authentication (3D Secure) |

**Expiry & CVC**: Can be any future date and any 3 digits

---

## 📋 Checkout Flow

1. **User selects Stripe payment** → Stripe option loads
2. **User completes form** → Validates shipping details
3. **User clicks "Place Order"** → Creates order with payment_status='pending'
4. **System creates Stripe session** → `/api/stripe/create-session` called
5. **Redirects to Stripe Checkout** → User enters card details
6. **Payment succeeds** → Redirected to `/myorders`
7. **Webhook confirms** → `/api/stripe/webhook` updates order status to 'paid'

---

## 🔍 Troubleshooting

### Webhook not working?
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe Dashboard logs in **Developers** → **Webhooks**
- Ensure endpoint URL is correct

### Payment fails?
- Check Stripe Dashboard for error details
- Verify test keys are being used in development
- Check browser console for client-side errors

### Session creation fails?
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
- Check server logs for errors
- Ensure user is logged in

---

## 📊 Stripe Dashboard

Key pages you'll use:

1. **Developers** → **API Keys** - Get your keys
2. **Developers** → **Webhooks** - Set up webhook URL
3. **Payments** - View all transactions
4. **Customers** - See customer payment history
5. **Testing** - Test with test mode cards

---

## 🚀 Deployment Notes

### Before going live:

1. Get **Live API Keys** from Stripe Dashboard
2. Update `.env.production` with live keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXX
   STRIPE_SECRET_KEY=sk_live_XXX
   STRIPE_WEBHOOK_SECRET=whsec_XXX
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. Set up webhook in Stripe Dashboard pointing to:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

4. Test on staging first with test keys

5. Switch to live keys only after confirming everything works

---

## 💡 Key Features

✅ **Secure** - PCI compliant, Stripe handles sensitive data  
✅ **Multiple Payment Methods** - Cards, Apple Pay, Google Pay (in Stripe Checkout)  
✅ **Webhooks** - Real-time payment confirmation  
✅ **Test Mode** - Safe testing without real charges  
✅ **Refunds** - Easy to process refunds  
✅ **Disputes** - Stripe handles dispute management  

---

## 🆘 Getting Help

- **Stripe Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Webhooks Guide**: https://stripe.com/docs/webhooks

---

## Summary

**What You Need From Stripe:**
1. ✅ Publishable Key (`pk_test_` or `pk_live_`)
2. ✅ Secret Key (`sk_test_` or `sk_live_`)
3. ✅ Webhook Secret (`whsec_`)

**Add to Your Project:**
1. ✅ Set `.env.local` with keys
2. ✅ Run database migration to add stripe columns
3. ✅ Run `npm install` to install Stripe packages
4. ✅ Set up webhook URL in Stripe Dashboard (production)
5. ✅ Test with test cards
6. ✅ Switch to live keys for production

**Ready to go!** 🚀
