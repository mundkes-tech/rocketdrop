import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ DB connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mundke@22",
  database: "rocketdrop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(req, { params }) {
  try {
    const supplierId = await params.id;

    if (!supplierId) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    // === QUERIES ===
    const totalProductsQ = db.query(
      `SELECT COUNT(*) AS totalProducts FROM products WHERE supplier_id = ?`,
      [supplierId]
    );

    const ordersStatsQ = db.query(
      `SELECT
         COUNT(*) AS ordersReceived,
         IFNULL(SUM(p.price), 0) AS revenue,
         SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS completedOrders,
         SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pendingOrders
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.supplier_id = ?`,
      [supplierId]
    );

    const monthlySalesQ = db.query(
      `SELECT DATE_FORMAT(o.created_at, '%b') AS month, SUM(p.price) AS sales
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.supplier_id = ?
       GROUP BY MONTH(o.created_at)
       ORDER BY MONTH(o.created_at)`,
      [supplierId]
    );

    const topProductsQ = db.query(
      `SELECT p.name, COUNT(o.id) AS orders, SUM(p.price) AS revenue
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.supplier_id = ?
       GROUP BY p.id
       ORDER BY orders DESC
       LIMIT 10`,
      [supplierId]
    );

    const categoryRevenueQ = db.query(
      `SELECT c.name AS category, SUM(p.price) AS revenue
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE o.supplier_id = ?
       GROUP BY c.id`,
      [supplierId]
    );

    // ❌ region not in orders, skip or adjust join if needed
    const ordersByRegionQ = db.query(
      `SELECT 'Unknown' AS region, COUNT(*) AS orders
       FROM orders
       WHERE supplier_id = ?
       GROUP BY region`,
      [supplierId]
    ).catch(() => [[], []]);

    const [totalProductsR, ordersStatsR, monthlySalesR, topProductsR, categoryRevenueR, ordersByRegionR] =
      await Promise.all([
        totalProductsQ,
        ordersStatsQ,
        monthlySalesQ,
        topProductsQ,
        categoryRevenueQ,
        ordersByRegionQ,
      ]);

    const dashboard = {
      totalProducts: totalProductsR[0][0]?.totalProducts || 0,
      ...ordersStatsR[0][0],
      monthlySales: monthlySalesR[0],
      topProducts: topProductsR[0],
      categoryRevenue: categoryRevenueR[0],
      ordersByRegion: ordersByRegionR[0],
      recentOrders: [],
    };

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier dashboard", details: error.message },
      { status: 500 }
    );
  }
}



// // src/app/api/supplier/[id]/dashboard/route.js
// import db from '@/lib/db'; // your MySQL connection pool

// export async function GET(req, { params }) {
//   const supplierId = params.id;
//   const url = new URL(req.url);
//   const range = url.searchParams.get('range'); // e.g., '7d', '30d', '6m', '12m'
//   const from = url.searchParams.get('from'); // custom range
//   const to = url.searchParams.get('to');
//   const categoryId = url.searchParams.get('category_id');
//   const productId = url.searchParams.get('product_id');

//   if (!supplierId) {
//     return new Response(JSON.stringify({ error: 'Supplier ID is required' }), { status: 400 });
//   }

//   try {
//     // ----- Date Filter -----
//     let dateFilter = '';
//     if (range && range !== 'custom') {
//       switch(range) {
//         case '7d': dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`; break;
//         case '30d': dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`; break;
//         case '6m': dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`; break;
//         case '12m': dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`; break;
//       }
//     } else if (range === 'custom' && from && to) {
//       dateFilter = `AND created_at BETWEEN '${from}' AND '${to}'`;
//     }

//     // ----- Category & Product Filter -----
//     const categoryFilter = categoryId && categoryId !== 'all' ? `AND p.category_id = ${categoryId}` : '';
//     const productFilter = productId && productId !== 'all' ? `AND p.id = ${productId}` : '';

//     // ----- Total Products -----
//     const [[{ totalProducts }]] = await db.query(
//       `SELECT COUNT(*) AS totalProducts FROM products WHERE supplier_id = ?`,
//       [supplierId]
//     );

//     // ----- Orders Received -----
//     const [[{ ordersReceived }]] = await db.query(
//       `SELECT COUNT(*) AS ordersReceived FROM orders WHERE supplier_id = ? ${dateFilter}`,
//       [supplierId]
//     );

//     // ----- Revenue -----
//     const [[{ revenue }]] = await db.query(
//       `SELECT IFNULL(SUM(o.quantity * p.price),0) AS revenue
//        FROM orders o
//        JOIN products p ON o.product_id = p.id
//        WHERE o.supplier_id = ? ${dateFilter}`,
//       [supplierId]
//     );

//     // ----- Completed & Pending Orders -----
//     const [[{ completedOrders }]] = await db.query(
//       `SELECT COUNT(*) AS completedOrders FROM orders WHERE supplier_id = ? AND status='completed' ${dateFilter}`,
//       [supplierId]
//     );
//     const [[{ pendingOrders }]] = await db.query(
//       `SELECT COUNT(*) AS pendingOrders FROM orders WHERE supplier_id = ? AND status='pending' ${dateFilter}`,
//       [supplierId]
//     );

//     // ----- Monthly Sales -----
//     const [monthlySales] = await db.query(
//       `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(quantity*price) AS sales
//        FROM orders
//        WHERE supplier_id = ? ${dateFilter}
//        GROUP BY month
//        ORDER BY month`,
//       [supplierId]
//     );

//     // ----- Top Products -----
//     const [topProducts] = await db.query(
//       `SELECT p.name, SUM(o.quantity) AS orders, SUM(o.quantity*p.price) AS revenue
//        FROM products p
//        JOIN orders o ON p.id = o.product_id
//        WHERE p.supplier_id = ? ${dateFilter} ${categoryFilter} ${productFilter}
//        GROUP BY p.id
//        ORDER BY orders DESC
//        LIMIT 10`,
//       [supplierId]
//     );

//     // ----- Category Revenue -----
//     const [categoryRevenue] = await db.query(
//       `SELECT c.name AS category, SUM(o.quantity*p.price) AS revenue
//        FROM products p
//        JOIN orders o ON p.id = o.product_id
//        JOIN categories c ON p.category_id = c.id
//        WHERE p.supplier_id = ? ${dateFilter} ${categoryFilter} ${productFilter}
//        GROUP BY c.id`,
//       [supplierId]
//     );

//     // ----- Inventory Stats -----
//     const [[lowStock]] = await db.query(
//       `SELECT COUNT(*) AS lowStock FROM products WHERE supplier_id=? AND stock<5`,
//       [supplierId]
//     );
//     const [[outOfStock]] = await db.query(
//       `SELECT COUNT(*) AS outOfStock FROM products WHERE supplier_id=? AND stock=0`,
//       [supplierId]
//     );
//     const [[inventoryValue]] = await db.query(
//       `SELECT IFNULL(SUM(price*stock),0) AS inventoryValue FROM products WHERE supplier_id=?`,
//       [supplierId]
//     );

//     // ----- Orders by Region -----
//     const [ordersByRegion] = await db.query(
//       `SELECT region, COUNT(*) AS orders
//        FROM orders
//        WHERE supplier_id=? ${dateFilter}
//        GROUP BY region`,
//       [supplierId]
//     );

//     // ----- Response -----
//     return new Response(JSON.stringify({
//       totalProducts,
//       ordersReceived,
//       revenue,
//       completedOrders,
//       pendingOrders,
//       monthlySales,
//       topProducts,
//       categoryRevenue,
//       inventoryStats: {
//         lowStock: lowStock.lowStock,
//         outOfStock: outOfStock.outOfStock,
//         inventoryValue: inventoryValue.inventoryValue
//       },
//       ordersByRegion
//     }), { status: 200 });

//   } catch (err) {
//     console.error('Dashboard API error:', err);
//     return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), { status: 500 });
//   }
// }




// import { NextResponse } from "next/server";
// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "Mundke@22",
//   database: "rocketdrop",
// });

// export async function GET(req, context) {
//   // Await params
//   const { params } = await context;
//   const supplierId = params.id;

//   try {
//     // Total Products
//     const [totalProducts] = await db.query(
//       "SELECT COUNT(*) as total FROM products WHERE supplier_id=?",
//       [supplierId]
//     );

//     // Orders
//     const [ordersReceived] = await db.query(
//       "SELECT COUNT(*) as total FROM orders WHERE supplier_id=?",
//       [supplierId]
//     );

//     const [completedOrders] = await db.query(
//       "SELECT COUNT(*) as total FROM orders WHERE supplier_id=? AND status='delivered'",
//       [supplierId]
//     );

//     const [pendingOrders] = await db.query(
//       "SELECT COUNT(*) as total FROM orders WHERE supplier_id=? AND status IN ('pending','processing')",
//       [supplierId]
//     );

//     // Revenue
//     const [revenue] = await db.query(
//       "SELECT SUM(amount) as total FROM payments WHERE supplier_id=? AND status='completed'",
//       [supplierId]
//     );

//     // Monthly Sales
// // Monthly Sales (last 6 months)
//     const [monthlySales] = await db.query(
//     `SELECT 
//         DATE_FORMAT(MIN(payment_date), '%b %Y') AS month,
//         SUM(amount) AS sales
//     FROM payments
//     WHERE supplier_id=? 
//         AND status='completed'
//         AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
//     GROUP BY YEAR(payment_date), MONTH(payment_date)
//     ORDER BY YEAR(payment_date), MONTH(payment_date)
//     LIMIT 6`,
//     [supplierId]
//     );



//     // Top Products
//     const [topProducts] = await db.query(
//       `SELECT p.name, SUM(oi.quantity) as orders 
//        FROM order_items oi 
//        JOIN products p ON oi.product_id=p.id 
//        JOIN orders o ON oi.order_id=o.id 
//        WHERE o.supplier_id=? 
//        GROUP BY p.id 
//        ORDER BY orders DESC 
//        LIMIT 5`,
//       [supplierId]
//     );

//     // Recent Orders
//     const [recentOrders] = await db.query(
//       `SELECT o.id, u.name AS customer, p.name AS product, oi.quantity*oi.price AS amount, o.status
//        FROM orders o
//        JOIN users u ON o.user_id=u.id
//        JOIN order_items oi ON o.id=oi.order_id
//        JOIN products p ON oi.product_id=p.id
//        WHERE o.supplier_id=?
//        ORDER BY o.created_at DESC
//        LIMIT 5`,
//       [supplierId]
//     );

//     return NextResponse.json({
//       totalProducts: totalProducts[0].total,
//       ordersReceived: ordersReceived[0].total,
//       completedOrders: completedOrders[0].total,
//       pendingOrders: pendingOrders[0].total,
//       revenue: revenue[0].total || 0,
//       monthlySales,
//       topProducts,
//       recentOrders,
//     });
//   } catch (error) {
//     console.error("Dashboard API Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
