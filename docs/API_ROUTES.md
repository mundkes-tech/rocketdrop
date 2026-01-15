# 📡 RocketDrop - API Routes Reference

Complete list of all API endpoints with methods, parameters, and usage examples.

---

## 🔐 Authentication APIs

### POST /api/login
**Description:** User login  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST /api/register
**Description:** Create new user account  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": 1, "username": "johndoe", "email": "user@example.com" }
}
```

### POST /api/auth/logout
**Description:** User logout  
**Auth Required:** ✅ Yes  
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/refresh
**Description:** Refresh access token  
**Auth Required:** ✅ Yes  
**Response:**
```json
{
  "success": true,
  "user": { "id": 1, "username": "johndoe" }
}
```

### POST /api/forgot-password
**Description:** Request password reset email  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /api/reset-password
**Description:** Reset password with token  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

---

## 🛍️ Product APIs

### GET /api/products
**Description:** List all products with pagination and filtering  
**Auth Required:** ❌ No  
**Query Parameters:**
```
?page=1
&limit=10
&category=electronics
&search=laptop
&sort=price
&order=asc
```
**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 999.99,
      "description": "...",
      "category_id": 1,
      "image_url": "...",
      "rating": 4.5,
      "reviews_count": 42
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### GET /api/products/featured
**Description:** Get featured products  
**Auth Required:** ❌ No  
**Query Parameters:** `?limit=10`  
**Response:** Same as product list

### GET /api/products/[id]
**Description:** Get single product details  
**Auth Required:** ❌ No  
**Response:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "description": "...",
    "category_id": 1,
    "image_url": "...",
    "rating": 4.5,
    "reviews_count": 42
  }
}
```

---

## 🛒 Cart APIs

### POST /api/cart
**Description:** Add item to cart (or update quantity)  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```
**Response:**
```json
{
  "success": true,
  "message": "Added to cart",
  "cart": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 999.99,
      "name": "Laptop"
    }
  ]
}
```

### DELETE /api/cart
**Description:** Remove item from cart  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "product_id": 1
}
```

---

## 🎟️ Coupon APIs

### POST /api/coupons/validate
**Description:** Validate coupon code  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "coupon_code": "SAVE20",
  "cart_total": 999.99
}
```
**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": 1,
    "code": "SAVE20",
    "discount_type": "percentage",
    "discount_value": 20,
    "discounted_amount": 199.99
  }
}
```

---

## 💳 Payment APIs (Stripe)

### POST /api/stripe/create-session
**Description:** Create Stripe checkout session  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "cart": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "coupon_code": "SAVE20"
}
```
**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/session_id"
}
```

### GET /api/stripe/verify-payment
**Description:** Verify payment after Stripe redirect  
**Auth Required:** ✅ Yes  
**Query Parameters:** `?session_id=stripe_session_id`  
**Response:**
```json
{
  "success": true,
  "order_id": 123,
  "message": "Payment verified, order created"
}
```

---

## 📦 Order APIs

### GET /api/orders
**Description:** Get user's orders  
**Auth Required:** ✅ Yes  
**Query Parameters:**
```
?page=1
&limit=10
&status=delivered
```
**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": 123,
      "total_amount": 999.99,
      "order_status": "delivered",
      "payment_status": "paid",
      "created_at": "2024-01-15T10:00:00Z",
      "items": [
        {
          "product_id": 1,
          "product_name": "Laptop",
          "quantity": 1,
          "price": 999.99
        }
      ]
    }
  ],
  "total": 5,
  "page": 1
}
```

### GET /api/orders/[id]
**Description:** Get single order details  
**Auth Required:** ✅ Yes  
**Response:** Single order object

### POST /api/orders/cancel
**Description:** Cancel an order and get refund  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "order_id": 123,
  "cancellation_reason": "Changed my mind"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Order cancelled and refund processed",
  "refund_amount": 999.99
}
```

### GET /api/orders/[id]/invoice
**Description:** Download invoice as PDF  
**Auth Required:** ✅ Yes  
**Response:** PDF file  

---

## ⭐ Review APIs

### GET /api/reviews/[product_id]
**Description:** Get product reviews  
**Auth Required:** ❌ No  
**Query Parameters:** `?limit=10&page=1`  
**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "user_name": "John",
      "rating": 5,
      "comment": "Great product!",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 42
}
```

### POST /api/reviews
**Description:** Create product review  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "product_id": 1,
  "rating": 5,
  "comment": "Great product!"
}
```

---

## 💌 Newsletter APIs

### POST /api/newsletter
**Description:** Subscribe to newsletter  
**Auth Required:** ❌ No  
**Body:**
```json
{
  "email": "user@example.com"
}
```

---

## 👤 User Profile APIs

### GET /api/profile
**Description:** Get user profile  
**Auth Required:** ✅ Yes  
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "phone": "+91234567890",
    "address": "...",
    "city": "..."
  }
}
```

### PUT /api/profile
**Description:** Update user profile  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "phone": "+91234567890",
  "address": "123 Main St",
  "city": "New York"
}
```

### POST /api/change-password
**Description:** Change user password  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass123"
}
```

---

## 🗂️ Category APIs

### GET /api/categories
**Description:** Get all product categories  
**Auth Required:** ❌ No  
**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "image_url": "...",
      "product_count": 42
    }
  ]
}
```

---

## ❤️ Wishlist APIs

### GET /api/wishlists
**Description:** Get user's wishlist  
**Auth Required:** ✅ Yes  
**Response:**
```json
{
  "success": true,
  "wishlist": [
    {
      "product_id": 1,
      "name": "Laptop",
      "price": 999.99,
      "image_url": "..."
    }
  ]
}
```

### POST /api/wishlists
**Description:** Add to wishlist  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "product_id": 1
}
```

### DELETE /api/wishlists
**Description:** Remove from wishlist  
**Auth Required:** ✅ Yes  
**Body:**
```json
{
  "product_id": 1
}
```

---

## 👨‍💼 Admin APIs

### GET /api/admin/dashboard
**Description:** Get admin dashboard statistics  
**Auth Required:** ✅ Yes (Admin only)  
**Response:**
```json
{
  "success": true,
  "stats": {
    "total_revenue": 50000,
    "total_orders": 500,
    "total_users": 200,
    "pending_orders": 15,
    "recent_orders": [...]
  }
}
```

### GET /api/admin/products
**Description:** Get all products (admin view)  
**Auth Required:** ✅ Yes (Admin only)  
**Query Parameters:** `?page=1&limit=20&search=laptop`  

### POST /api/admin/products
**Description:** Create new product  
**Auth Required:** ✅ Yes (Admin only)  
**Body:**
```json
{
  "name": "Laptop",
  "description": "...",
  "price": 999.99,
  "category_id": 1,
  "image_url": "..."
}
```

### PUT /api/admin/products/[id]
**Description:** Update product  
**Auth Required:** ✅ Yes (Admin only)  

### DELETE /api/admin/products/[id]
**Description:** Delete product  
**Auth Required:** ✅ Yes (Admin only)  

---

### GET /api/admin/categories
**Description:** Get all categories  
**Auth Required:** ✅ Yes (Admin only)  
**Query Parameters:** `?page=1&limit=20&search=electronics`  

### POST /api/admin/categories
**Description:** Create new category  
**Auth Required:** ✅ Yes (Admin only)  
**Body:**
```json
{
  "name": "Electronics",
  "image_url": "...",
  "description": "..."
}
```

### PUT /api/admin/categories/[id]
**Description:** Update category  
**Auth Required:** ✅ Yes (Admin only)  

### DELETE /api/admin/categories/[id]
**Description:** Delete category  
**Auth Required:** ✅ Yes (Admin only)  

---

### GET /api/admin/users
**Description:** Get all users  
**Auth Required:** ✅ Yes (Admin only)  
**Query Parameters:** `?page=1&limit=20&role=user&search=john`  
**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user",
      "total_orders": 5,
      "total_spent": 5000,
      "created_at": "2024-01-15"
    }
  ],
  "total": 200,
  "page": 1
}
```

### GET /api/admin/users/[id]
**Description:** Get user details with order history  
**Auth Required:** ✅ Yes (Admin only)  
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "total_orders": 5,
    "total_spent": 5000,
    "average_order_value": 1000,
    "orders": [...]
  }
}
```

---

### GET /api/admin/orders
**Description:** Get all orders (admin view)  
**Auth Required:** ✅ Yes (Admin only)  
**Query Parameters:** `?page=1&limit=20&status=pending&sort=created_at&order=desc`  

### PUT /api/admin/orders/[id]
**Description:** Update order status  
**Auth Required:** ✅ Yes (Admin only)  
**Body:**
```json
{
  "order_status": "shipped"
}
```

---

### GET /api/admin/coupons
**Description:** Get all coupons  
**Auth Required:** ✅ Yes (Admin only)  
**Query Parameters:** `?page=1&limit=20&status=active&search=SAVE20`  

### POST /api/admin/coupons
**Description:** Create new coupon  
**Auth Required:** ✅ Yes (Admin only)  
**Body:**
```json
{
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 20,
  "max_uses": 100,
  "min_purchase": 500,
  "valid_from": "2024-01-15",
  "valid_until": "2024-02-15"
}
```

### PUT /api/admin/coupons/[id]
**Description:** Update coupon  
**Auth Required:** ✅ Yes (Admin only)  

### DELETE /api/admin/coupons/[id]
**Description:** Delete coupon  
**Auth Required:** ✅ Yes (Admin only)  

---

## ⚠️ Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "error_code"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `DUPLICATE_ENTRY` - Resource already exists
- `DATABASE_ERROR` - Database operation failed

---

## 🔄 Request Headers

Include these headers with requests:

```
Content-Type: application/json
Authorization: Bearer <token> (for protected routes)
```

The token is automatically included from httpOnly cookies for authenticated requests.

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

**Last Updated:** January 15, 2026  
**Version:** 1.2.0
