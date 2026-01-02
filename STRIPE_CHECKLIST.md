# ⚡ Stripe Setup - Quick Checklist

## ✅ What I've Done (Already Complete)

- [x] Updated checkout page to use Stripe
- [x] Created Stripe API endpoints (`/api/stripe/*`)
- [x] Updated `package.json` with Stripe dependencies
- [x] Removed all Razorpay references from code
- [x] Created setup documentation

---

## 📋 What YOU Need To Do

### 1️⃣ Get Stripe Keys (5 min)
- [ ] Go to https://dashboard.stripe.com
- [ ] Sign up or log in
- [ ] Navigate to **Developers** → **API Keys**
- [ ] Copy **Publishable Key** (pk_test_...)
- [ ] Copy **Secret Key** (sk_test_...)

### 2️⃣ Set Environment Variables (2 min)
- [ ] Open `.env.local` in your project
- [ ] Add these lines:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Update Database (5 min)
- [ ] Run this SQL in your database:
```sql
ALTER TABLE orders 
ADD COLUMN stripe_session_id VARCHAR(255),
ADD COLUMN stripe_payment_id VARCHAR(255);
```

### 4️⃣ Install Dependencies (1 min)
- [ ] Run in terminal:
```bash
npm install
```

### 5️⃣ Set Up Webhooks - Dev (5 min)
- [ ] Download [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [ ] Run: `stripe login`
- [ ] Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Copy webhook secret shown
- [ ] Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 6️⃣ Test Locally (2 min)
- [ ] Run: `npm run dev`
- [ ] Go to checkout
- [ ] Select "Card Payment (Stripe)"
- [ ] Use test card: **4242 4242 4242 4242**
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Should see order confirmed with payment_status = 'paid'

---

## 🚀 For Production

When deploying to production:

- [ ] Get **Live Keys** from Stripe (pk_live_... and sk_live_...)
- [ ] Update production `.env` with live keys
- [ ] Set up webhook in Stripe Dashboard
- [ ] Webhook URL: `https://yourdomain.com/api/stripe/webhook`
- [ ] Test on staging first
- [ ] Deploy to production

---

## 📊 Files Changed

**Frontend:**
- `src/app/checkout/CheckoutPageContent.js` - Updated checkout form

**Backend:**
- `src/app/api/stripe/create-session/route.js` - NEW
- `src/app/api/stripe/verify-payment/route.js` - NEW
- `src/app/api/stripe/webhook/route.js` - NEW

**Config:**
- `package.json` - Updated dependencies

**Docs:**
- `STRIPE_SETUP_GUIDE.md` - Detailed setup instructions
- `STRIPE_MIGRATION_SUMMARY.md` - Complete overview

---

## 🧪 Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | ⚠️ Requires Auth |

---

## 🎯 Time Required

- Get Stripe keys: **5 min**
- Set environment vars: **2 min**
- Update database: **5 min**
- Install packages: **1 min**
- Set up webhook: **5 min**
- Test: **2 min**

**Total: ~20 minutes** ⏱️

---

## ❓ Issues?

Check `STRIPE_SETUP_GUIDE.md` for:
- Detailed step-by-step instructions
- Troubleshooting guide
- FAQ section
- Production deployment guide

---

**Status**: Ready to set up! 🚀
