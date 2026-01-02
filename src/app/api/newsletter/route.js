import db from "@/lib/db";
import { NextResponse } from "next/server";

// ✅ POST — subscribe a user to the newsletter
export async function POST(req) {
  try {
    const { email } = await req.json();

    // 🛡 Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 🗂 Ensure table exists (optional but safe)
    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 💾 Try to insert subscriber
    await db.query(
      `INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)`,
      [email]
    );

    return NextResponse.json({ message: "Successfully subscribed!" }, { status: 200 });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json(
      { error: "Server error while subscribing" },
      { status: 500 }
    );
  }
}

// ✅ GET — (optional) fetch all subscribers (for admin dashboard)
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching subscribers:", err);
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}
