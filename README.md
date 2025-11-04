This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



// /app/api/orders/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db'; // MySQL connection

// 🟢 CREATE ORDER
export async function POST(req) {
  try {
    const { userId, cartItems, totalAmount, address, phone } = await req.json();

    if (!userId || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    const supplierId = cartItems[0].supplier_id || null;

    // 1️⃣ Create new order
    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, supplier_id, total_amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [userId, supplierId, totalAmount, 'pending']
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Add products to order_items
    const orderItems = cartItems.map((item) => [
      orderId,
      item.id,
      item.quantity,
      item.discountPrice || item.price,
    ]);

    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [orderItems]
    );

    // 3️⃣ Save shipping info (optional)
    // await db.query(
    //   `INSERT INTO shipping_details (order_id, address, phone) VALUES (?, ?, ?)`,
    //   [orderId, address, phone]
    // );

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      totalAmount,
      status: 'pending',
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// 🟡 GET USER ORDERS
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    // 1️⃣ Fetch all orders for the user
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // 2️⃣ Fetch products for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image, p.category_id 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetching orders failed:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
