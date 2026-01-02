import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 🏷️ Featured products (marked in DB)
    const [featuredProducts] = await db.query(`
      SELECT 
        p.*, 
        c.name AS category_name, 
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `);

    // 📈 Trending products (based on recent orders)
    const [trendingProducts] = await db.query(`
      SELECT 
        p.*, 
        c.name AS category_name, 
        c.slug AS category_slug,
        COUNT(o.id) AS total_orders
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN orders o ON o.product_id = p.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY p.id
      ORDER BY total_orders DESC
      LIMIT 8
    `);

    return NextResponse.json({
      featured: featuredProducts,
      trending: trendingProducts,
    });
  } catch (error) {
    console.error('Error fetching featured/trending products:', error);
    return NextResponse.json(
      { error: 'Failed to load featured and trending products' },
      { status: 500 }
    );
  }
}
