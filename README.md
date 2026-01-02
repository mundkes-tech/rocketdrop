# 🚀 RocketDrop - E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15, featuring secure authentication, payment integration, and real-time order management.

---

## **📋 Features**

### **✅ Implemented**
- 🔐 **JWT Authentication** - Secure login with access & refresh tokens
- 👥 **Role-Based Access Control** - User & Admin dashboards
- 💳 **Payment Integration** - Stripe (Cards, Digital Wallets)
- 📧 **Email Notifications** - Order confirmations & password resets
- 🔑 **Password Reset** - Secure token-based password recovery
- 🛒 **Shopping Cart** - Persistent cart with guest/user merge
- 📦 **Order Management** - Complete order tracking system
- 🎨 **Modern UI** - Responsive design with Tailwind CSS & Framer Motion

---

## **🚀 Quick Start**

### **1. Clone & Install**

```bash
cd rocketdrop
npm install
```

### **2. Database Setup**

```bash
# Create database
mysql -u root -p
CREATE DATABASE rocketdrop;

# Run migrations (from database folder)
mysql -u root -p rocketdrop < database/create_password_reset_table.sql

# Add Stripe columns to orders table
ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN stripe_payment_id VARCHAR(255);
```

### **3. Environment Configuration**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### **4. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## **⚙️ Environment Variables - ACTION REQUIRED**

### **🔴 MUST CONFIGURE (App won't work without these):**

#### **Database Configuration**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rocketdrop
```

#### **JWT Secret** (Generate a secure key)
```bash
# Run this command to generate:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
```env
JWT_SECRET=your_generated_secret_here
```

---

### **🟡 REQUIRED FOR PAYMENTS (Stripe):**

1. **Sign up:** https://dashboard.stripe.com/register
2. **Get Test Keys:** Developers → API Keys
3. **Add to .env.local:**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_YYYYYYYYYYYYYYYYYY
STRIPE_WEBHOOK_SECRET=whsec_ZZZZZZZZZZZZZZZZ
```

**📖 Detailed Guide:** See [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)

---

### **🟡 REQUIRED FOR EMAILS (Gmail):**

1. **Enable 2FA:** https://myaccount.google.com/security
2. **Generate App Password:** https://myaccount.google.com/apppasswords
3. **Add to .env.local:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=RocketDrop <noreply@rocketdrop.com>
```

---

### **🟢 OPTIONAL (Already Set):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## **📁 Project Structure**

```
rocketdrop/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── stripe/        # Payment endpoints
│   │   │   ├── cart/          # Cart management
│   │   │   ├── orders/        # Order management
│   │   │   └── admin/         # Admin APIs
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── forgot-password/   # Password reset request
│   │   ├── reset-password/    # Password reset form
│   │   ├── checkout/          # Checkout page
│   │   ├── user-dashboard/    # User dashboard
│   │   └── admin/             # Admin panel
│   ├── components/            # Reusable React components
│   ├── contexts/              # React Context (Auth, Cart)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   │   ├── db.js             # MySQL connection
│   │   ├── jwt.js            # JWT utilities
│   │   ├── email.js          # Email sending
│   │   └── api-middleware.js # Auth middleware
│   └── utils/                 # Helper functions
├── public/                    # Static assets
├── database/                  # SQL migration scripts
│   └── create_password_reset_table.sql
├── docs/                      # Technical documentation
│   └── JWT_IMPLEMENTATION_SUMMARY.md
├── .env.local                 # Your environment variables (GITIGNORED)
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## **🧪 Testing Checklist**

### **1. User Registration & Login**
- [ ] Register a new user
- [ ] Auto-login after registration
- [ ] Toast notification appears (500ms)
- [ ] Redirect to user dashboard

### **2. Password Reset**
- [ ] Go to `/forgot-password`
- [ ] Enter email
- [ ] Check inbox for reset link
- [ ] Click link and set new password
- [ ] Login with new password

### **3. Payment Flow (Stripe)**
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Select "Card Payment (Stripe)"
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Payment succeeds
- [ ] Email confirmation received
- [ ] Order shows in "My Orders"

### **4. Admin Panel**
- [ ] Login as admin
- [ ] Access `/admin/admin-dashboard`
- [ ] View orders
- [ ] Manage productsdocs/JWT_IMPLEMENTATION_SUMMARY.md](docs/JWT_IMPLEMENTATION_SUMMARY.md)
- **Payment Setup:** [docs/RAZORPAY_SETUP_GUIDE.md](docs/
---

## **📚 Additional Documentation**

- **JWT Implementation:** [docs/JWT_IMPLEMENTATION_SUMMARY.md](docs/JWT_IMPLEMENTATION_SUMMARY.md)
- **Stripe Payment Setup:** [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)
- **Stripe Migration Summary:** [STRIPE_MIGRATION_SUMMARY.md](STRIPE_MIGRATION_SUMMARY.md)

---

## **🔧 Common Issues & Solutions**

### **"Failed to fetch" error**
✅ **Fixed:** All fetch calls now include `credentials: 'include'` for JWT cookies

### **Email not sending**
- Verify Gmail app password (16 characters, no spaces)
- Check 2FA is enabled
- Look in spam folder

### **Stripe checkout not working**
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Verify using test mode keys (pk_test_...)
- Check Stripe Dashboard for webhook events

### **Database connection failed**
- Verify MySQL is running
- Check credentials in `.env.local`
- Ensure database `rocketdrop` exists

---

## **📦 Tech Stack**

- **Framework:** Next.js 15.5.5 (App Router)
- **UI:** React 19, Tailwind CSS, Framer Motion
- **Database:** MySQL2 with connection pooling
- **Authentication:** JWT (jose library)
- **Payments:** Stripe SDK
- **Email:** Nodemailer (Gmail SMTP)
- **Security:** bcrypt, HTTP-only cookies, CSRF protection

---

## **🚀 Production Deployment**

### **Before Going Live:**

1. **Switch to Stripe Live Keys** (pk_live_... and sk_live_...)
2. **Configure Stripe Webhook** in Dashboard with production URL
3. **Update environment variables** in hosting platform
4. **Enable HTTPS** (required for Stripe)
5. **Configure email service** for production (SendGrid/AWS SES recommended)
6. **Update CORS settings** if needed
7. **Run production build:** `npm run build`

### **Hosting Options:**
- **Vercel** (Recommended - automatic deployments)
- **Railway** (Database + App hosting)
- **DigitalOcean/AWS** (Full control)

---

## **📝 License**

Private project - All rights reserved

---

## **👨‍💻 Support**

For issues or questions, contact: support@rocketdrop.com

---

**Built with ❤️ using Next.js**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

