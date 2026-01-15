# 🚀 RocketDrop - Developer Quick Reference

A quick guide for developers working on the RocketDrop project.

---

## 📋 Quick Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database
```bash
# Connect to MySQL
mysql -u root -p

# Show all databases
SHOW DATABASES;

# Select database
USE rocketdrop;

# Show all tables
SHOW TABLES;

# Backup database
mysqldump -u root -p rocketdrop > backup.sql

# Restore database
mysql -u root -p rocketdrop < backup.sql
```

---

## 🗂️ File Organization

### API Endpoints
**Location:** `/src/app/api/`

**Pattern:**
```
/api/resource/route.js          (GET, POST)
/api/resource/[id]/route.js     (GET, PUT, DELETE)
/api/resource/action/route.js   (Special actions)
```

**Example:**
- `/api/products/route.js` - List & create products
- `/api/products/[id]/route.js` - Get, update, delete product
- `/api/orders/cancel/route.js` - Cancel order action

### Pages
**Location:** `/src/app/`

**Structure:**
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/products` - Product listing
- `/products/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/myorders` - User orders
- `/admin/*` - Admin pages

### Components
**Location:** `/src/components/`

**Naming Convention:**
- `component-name.js` - Functional component
- `ComponentName.js` - Main page component
- Use lowercase with hyphens for file names

**Common Components:**
- `navbar.js` - Navigation bar
- `product-card.js` - Product card display
- `button.js` - Reusable button
- `LoadingSpinner.js` - Loading indicator

### Utilities & Libraries
**Location:** `/src/lib/`

**Key Files:**
- `db.js` - Database connection
- `jwt.js` - JWT utilities
- `email.js` - Email service
- `invoice.js` - PDF invoice generation
- `api-middleware.js` - Auth middleware

---

## 🔑 Authentication Flow

### Login Process
```
User submits credentials
  ↓
POST /api/login
  ↓
Validate email & password
  ↓
Generate JWT tokens
  ↓
Set httpOnly cookies
  ↓
Return user data
  ↓
Redirect to dashboard
```

### Protected Routes
```
useAuth() hook checks for token
  ↓
Middleware validates JWT
  ↓
If valid → allow access
  ↓
If invalid → redirect to login
```

### Token Refresh
```
Access token expires (15 mins)
  ↓
Request refresh endpoint
  ↓
POST /api/auth/refresh
  ↓
Generate new access token
  ↓
Continue session
```

---

## 💳 Payment Flow (Stripe)

```
User clicks "Buy Now" or "Checkout"
  ↓
Create Stripe checkout session
  ↓
POST /api/stripe/create-session
  ↓
Redirect to Stripe checkout
  ↓
User completes payment
  ↓
Stripe redirects to success page
  ↓
GET /api/stripe/verify-payment
  ↓
Create order in database
  ↓
Send confirmation email
  ↓
Show success message
```

### Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Expired:** `4000 0000 0000 0069`
- **3D Secure:** `4000 0025 0000 3155`

---

## 📧 Email Service

### Available Functions

```javascript
// Import
import { 
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendCancellationEmail,
  sendCancellationAdminEmail,
  sendInvoiceEmail
} from '@/lib/email';

// Send order confirmation
await sendOrderConfirmationEmail({
  user_email: "user@example.com",
  user_name: "John",
  order_id: 123,
  total: 99.99,
  items: [{name: "Product", quantity: 1, price: 99.99}]
});

// Send password reset
await sendPasswordResetEmail({
  email: "user@example.com",
  resetToken: "token123"
});

// Send invoice
await sendInvoiceEmail(orderData, pdfBuffer);
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_password (not regular password)
EMAIL_FROM=RocketDrop <noreply@rocketdrop.com>
ADMIN_EMAIL=admin@rocketdrop.com
```

---

## 🗄️ Database Schema Quick Reference

### Users Table
```sql
SELECT id, username, email, password_hash, role, created_at 
FROM users;

-- Roles: 'user', 'admin'
```

### Products Table
```sql
SELECT id, name, description, price, category_id, image_url 
FROM products;
```

### Orders Table
```sql
SELECT 
  order_id, 
  user_id, 
  total_amount, 
  payment_status,      -- 'paid', 'pending', 'refunded'
  order_status,        -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  cancelled_at,        -- NULL or timestamp
  cancellation_reason, -- NULL or reason text
  created_at 
FROM orders;
```

### Order Items Table
```sql
SELECT oi.item_id, oi.order_id, oi.product_id, oi.quantity, oi.price
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id;
```

### Coupons Table
```sql
SELECT 
  id,
  code,
  discount_type,  -- 'percentage' or 'fixed'
  discount_value,
  max_uses,       -- 0 = unlimited
  usage_count,
  min_purchase,
  is_active,
  valid_from,
  valid_until
FROM coupons;
```

---

## 🔐 Authorization Levels

### Public Routes
- `/` - Homepage
- `/login` - Login
- `/register` - Registration
- `/products` - Product listing
- `/forgot-password` - Password reset request

### User Routes (requires login)
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/myorders` - Order history
- `/profile` - User profile
- `/wishlist` - Wishlist

### Admin Routes (requires admin role)
- `/admin/admin-dashboard` - Dashboard
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/coupons` - Coupon management
- `/admin/users` - User management

### Middleware Check
```javascript
// In API routes
import { requireAdmin } from '@/lib/api-middleware';

export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    // Admin-only code here
  });
}
```

---

## 🎯 Common Tasks

### Add a New Admin Feature

1. **Create API endpoint**
   ```javascript
   // /src/app/api/admin/feature/route.js
   import { requireAdmin } from '@/lib/api-middleware';
   
   export async function GET(req) {
     return requireAdmin(req, async (req, user) => {
       // Implementation
     });
   }
   ```

2. **Create admin page**
   ```javascript
   // /src/app/admin/feature/page.js
   'use client';
   import useSWR from 'swr';
   
   export default function FeaturePage() {
     const { data, error, mutate } = useSWR('/api/admin/feature', fetcher);
     // Implementation
   }
   ```

3. **Update admin navigation**
   ```javascript
   // /src/app/admin/layout.js
   const navigation = [
     // ... existing items
     { name: 'Feature', href: '/admin/feature', icon: IconName },
   ];
   ```

### Add Email Notification

1. **Create email function in `/src/lib/email.js`**
   ```javascript
   export async function sendCustomEmail(data) {
     const transporter = createTransporter();
     const mailOptions = {
       from: process.env.EMAIL_FROM,
       to: data.email,
       subject: "Your Subject",
       html: `<html>...</html>`
     };
     return await transporter.sendMail(mailOptions);
   }
   ```

2. **Call the function**
   ```javascript
   import { sendCustomEmail } from '@/lib/email';
   
   await sendCustomEmail({
     email: user.email,
     data: someData
   });
   ```

### Download File (Invoice)

```javascript
// In API route
const blob = await generateInvoicePDF(data);
return new Response(blob, {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="invoice.pdf"'
  }
});

// In frontend
const handleDownload = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}/invoice`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${orderId}.pdf`;
  link.click();
};
```

---

## 🐛 Debugging Tips

### Check Database Directly
```bash
mysql -u root -p rocketdrop
SELECT * FROM orders WHERE order_id = 123;
```

### View API Response
```javascript
const response = await fetch('/api/endpoint');
const data = await response.json();
console.log(data);
```

### Check Logs
```bash
# Dev server logs
npm run dev

# Check browser console (F12)
# Check Network tab for API calls
```

### Email Debugging
```javascript
// Add console logs in email service
console.log('Sending email to:', email);
console.log('Email result:', result.messageId);
```

### Payment Debugging
```javascript
// Check Stripe dashboard
// Dashboard → Events → Look for payment attempts
// Test cards: Use test mode keys only
```

---

## 📚 Key Libraries

### SWR (Data Fetching)
```javascript
import useSWR from 'swr';

const { data, error, mutate } = useSWR('/api/endpoint', fetcher);

// Revalidate
mutate();
```

### Framer Motion (Animations)
```javascript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### React Hot Toast (Notifications)
```javascript
import { toast } from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create Pull Request
# After review, merge to main
```

---

## 🧪 Testing Checklist

Before pushing to production:

- [ ] Feature works locally
- [ ] No console errors
- [ ] API endpoints return correct data
- [ ] UI is responsive
- [ ] Database queries are optimized
- [ ] Error handling is in place
- [ ] Email notifications work (test with admin email)
- [ ] Payment flow tested with test card
- [ ] Admin access is restricted
- [ ] Security checks pass

---

## 📖 Documentation Links

- **Full Feature List:** [docs/FEATURES.md](docs/FEATURES.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Changelog:** [docs/CHANGELOG.md](docs/CHANGELOG.md)
- **JWT Implementation:** [docs/JWT_IMPLEMENTATION_SUMMARY.md](docs/JWT_IMPLEMENTATION_SUMMARY.md)

---

## 🆘 Getting Help

1. Check existing code for similar implementations
2. Review documentation in `/docs` folder
3. Check console for error messages
4. Review database schema
5. Check API response data
6. Look for similar patterns in codebase

---

**Last Updated:** January 15, 2026  
**Version:** 1.2.0
