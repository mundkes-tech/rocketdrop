# 📝 RocketDrop - Changelog

All notable changes to the RocketDrop e-commerce platform are documented here.

---

## [1.2.0] - January 15, 2026

### 🎉 Major Features Added

#### Phase 4: Invoice Generation System ✨
- **PDF Invoice Generation** - Professional invoice creation using pdfkit
  - Complete order itemization
  - Company branding and customer details
  - Automatic calculations (subtotal, discount, total)
  - Payment and order status information
  
- **Invoice Download API** - Secure endpoint for invoice retrieval
  - `/api/orders/[id]/invoice` - Download professional PDF invoices
  - Authentication and authorization checks
  - Proper error handling and validation
  
- **Invoice Email Integration** - Send invoices via email
  - HTML email templates with PDF attachment
  - Order summary in email body
  - Professional branding and styling
  - `sendInvoiceEmail()` function added to email service
  
- **Frontend Invoice Downloads** - User and Admin interfaces
  - Download button on My Orders page (customer side)
  - Download button in admin orders table
  - Toast notifications for download progress
  - Automatic PDF file naming

**Related Files:**
- `/src/lib/invoice.js` - PDF generation utility
- `/src/app/api/orders/[id]/invoice/route.js` - Invoice API
- `/src/lib/email.js` - Invoice email function
- `/src/app/myorders/MyOrdersPageContent.js` - Customer invoice button
- `/src/app/admin/orders/page.js` - Admin invoice button

### ✅ Admin Features (Phase 3)

#### Category Management
- CRUD operations for product categories
- Search by category name
- Auto-slug generation from category name
- Category images with URL support
- Duplicate prevention
- Product count validation before deletion
- `/admin/categories` management page
- Pagination support

#### User Management
- View all users with pagination
- Search users by username or email
- Filter by role (User/Admin)
- User detail modal with:
  - User information and join date
  - Statistics (total orders, total spent, avg order value)
  - Recent order history with status
  - Order details inline
- `/admin/users` management page

#### Coupon Management
- Create, edit, delete discount coupons
- Support for percentage and fixed amount discounts
- Set maximum usage limits (0 = unlimited)
- Set minimum purchase requirements
- Validity date range management
- Active/Inactive toggling
- Status tracking:
  - Active (currently valid)
  - Inactive (disabled)
  - Expired (validity period passed)
  - Upcoming (not yet valid)
  - Used Up (reached max uses)
- Search by coupon code
- Filter by status
- Usage statistics (current uses / max uses)
- Pagination support
- `/admin/coupons` management page

### 🔧 Infrastructure Updates

#### Dependencies
- Added `pdfkit` (^0.14.0) for PDF generation
- All dependencies validated with `--legacy-peer-deps`

#### Documentation
- New `FEATURES.md` - Complete feature list and API reference
- New `DEPLOYMENT.md` - Production deployment guide
- Updated `README.md` - Reflects all new features

### 🐛 Bug Fixes & Improvements

1. **Order Cancellation System** (Previous Phase)
   - Fixed amount formatting for email notifications
   - Added database columns: `cancelled_at`, `cancellation_reason`
   - Automatic Stripe refund processing
   - Email notifications to both user and admin

2. **Payment Verification**
   - Payment verification now happens before order confirmation
   - Prevents creation of orders without actual payment

3. **Admin Navigation**
   - Updated sidebar to include all new features
   - Added Ticket icon for Coupons
   - Category, Coupon, and User management links added

### 📚 Documentation Updates

- **README.md** - Updated with new features and latest instructions
- **FEATURES.md** - Complete feature inventory with API references
- **DEPLOYMENT.md** - Production deployment guide with multiple options

---

## [1.1.0] - January 8, 2026

### Order Management Enhancement

#### Order Cancellation System ✨
- Users can cancel pending/processing orders
- Automatic Stripe refund processing
- Cancellation reason tracking
- Email notifications:
  - User cancellation confirmation with refund timeline
  - Admin alert with order and customer details
- Refund status updates
- Admin visibility of cancelled orders
- Read-only cancelled order status (no status change allowed)

**Related Files:**
- `/src/app/api/orders/cancel/route.js` - Cancellation API
- `/src/lib/email.js` - Cancellation email functions
- `/src/app/myorders/MyOrdersPageContent.js` - Cancel button
- `/src/app/admin/orders/page.js` - Cancelled status handling

#### Payment System Improvements
- Payment verification endpoint added
- Order confirmation requires successful payment verification
- Prevents phantom orders without actual payment

**Related Files:**
- `/src/app/checkout/success/page.js` - Payment verification page

---

## [1.0.0] - December 2025

### Initial Release

#### Core Features
- ✅ User Authentication (JWT with refresh tokens)
- ✅ User Registration & Login
- ✅ Password Reset System
- ✅ Shopping Cart Management
- ✅ Product Browsing & Search
- ✅ Product Categories
- ✅ Product Reviews & Ratings
- ✅ Wishlist Management
- ✅ Order Management
- ✅ Stripe Payment Integration
- ✅ Email Notifications
- ✅ Admin Dashboard
- ✅ Product Management (Admin)
- ✅ Admin Order Management

#### Technology Stack
- Next.js 15.5.5
- React 19.1.0
- Tailwind CSS 3.4
- MySQL 8.0
- Stripe API
- Nodemailer
- JWT for authentication

---

## Roadmap (Planned Features)

### Phase 5: Stock Management [In Progress]
- [ ] Product inventory tracking
- [ ] Low stock alerts
- [ ] Automatic stock deduction on order
- [ ] Out of stock indicators
- [ ] Stock reorder management

### Phase 6: Advanced Analytics [Planned]
- [ ] Sales reports
- [ ] Revenue tracking
- [ ] Top products analysis
- [ ] User behavior analytics
- [ ] Inventory insights

### Phase 7: Order Status Emails [Planned]
- [ ] Automatic shipment notifications
- [ ] Delivery status updates
- [ ] Tracking information emails

### Phase 8: Review Moderation [Planned]
- [ ] Admin review approval/rejection
- [ ] Admin response to reviews
- [ ] Moderate inappropriate content
- [ ] Featured reviews

### Phase 9: Newsletter System [Planned]
- [ ] Newsletter subscription management
- [ ] Email campaign builder
- [ ] Subscriber segmentation
- [ ] Campaign analytics

### Phase 10: Multi-Language Support [Future]
- [ ] i18n implementation
- [ ] Multiple language support
- [ ] Language switching

### Phase 11: Mobile App [Future]
- [ ] React Native mobile app
- [ ] iOS and Android support
- [ ] Push notifications

---

## Breaking Changes

### v1.2.0
- None (fully backward compatible)

### v1.1.0
- Database schema change: Added `cancelled_at` and `cancellation_reason` to orders table
  - **Migration Required:** `ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP NULL;`
  - **Migration Required:** `ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(500);`

---

## Known Issues

### Current
1. Stock management system not yet implemented
2. Admin audit logging not available
3. Review moderation system pending
4. Email templates could be more customizable

### Fixed
- ~~Orders marked paid without verification~~ Fixed in v1.1.0
- ~~Duplicate React keys in order items~~ Fixed in v1.0.0
- ~~Payment flow issues~~ Fixed in v1.1.0

---

## Migration Guide

### Upgrading from v1.0.0 to v1.1.0
```bash
# 1. Pull latest code
git pull origin main

# 2. Run database migrations
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(500);

# 3. Install dependencies
npm install

# 4. Restart server
npm run dev
```

### Upgrading from v1.1.0 to v1.2.0
```bash
# 1. Pull latest code
git pull origin main

# 2. Install new dependencies
npm install pdfkit --legacy-peer-deps

# 3. Restart server
npm run dev
```

---

## Contributors

- **Lead Developer:** Kaustubh Mohil
- **Architecture:** Full-stack Next.js design
- **Testing:** Manual and automated testing

---

## Version History

| Version | Date | Status | Features |
|---------|------|--------|----------|
| 1.2.0 | Jan 15, 2026 | ✅ Released | Invoice System, Admin Features |
| 1.1.0 | Jan 8, 2026 | ✅ Released | Order Cancellation, Payment Verification |
| 1.0.0 | Dec 2025 | ✅ Released | Core E-Commerce Features |

---

## Support & Questions

For questions or issues:
1. Check documentation in `/docs` folder
2. Review code comments
3. Check GitHub issues
4. Contact development team

---

**Last Updated:** January 15, 2026  
**Next Version:** 1.3.0 (Stock Management - Planned)
