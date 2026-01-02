import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ Create a shared DB connection pool (efficient for production)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mundke@22",
  database: "rocketdrop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Utility: consistent API response format
const sendResponse = (success, message, data = {}, status = 200) =>
  NextResponse.json({ success, message, ...data }, { status });

// ✅ GET — Fetch all categories
export async function GET() {
  try {
    console.log("📦 [GET /categories] Fetching categories...");

    const [rows] = await db.query(
      "SELECT id, name, slug, image_url FROM categories ORDER BY name ASC"
    );

    // Always return an array even if empty
    const categories = Array.isArray(rows) ? rows : [];

    // Handle empty state gracefully
    if (categories.length === 0) {
      console.warn("⚠️ No categories found in database.");
      return sendResponse(
        true,
        "No categories found — please add some from supplier dashboard.",
        { categories: [], count: 0 },
        200
      );
    }

    // ✅ Normalize category data for frontend (camelCase)
    const normalized = categories.map((cat) => ({
      id: cat.id,
      name: cat.name || "Unnamed Category",
      slug:
        cat.slug && cat.slug.trim() !== ""
          ? cat.slug
          : cat.name?.toLowerCase().replace(/\s+/g, "-") || "",
      imageUrl:
        cat.image_url && cat.image_url.trim() !== ""
          ? cat.image_url
          : "/images/categories/placeholder.svg",
    }));

    console.log(`✅ Categories fetched successfully (${normalized.length})`);

    return sendResponse(true, "Categories fetched successfully", {
      categories: normalized,
      count: normalized.length,
    });
  } catch (error) {
    console.error("❌ [GET /categories] Error:", error.message);

    return sendResponse(
      false,
      "Failed to fetch categories. Please try again later.",
      {
        categories: [],
        hint:
          "Check your database connection or ensure the 'categories' table has columns: id, name, slug, image_url.",
        details: error.message,
      },
      500
    );
  }
}






// import { NextResponse } from "next/server";
// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "Mundke@22",
//   database: "rocketdrop",
// });

// export async function GET() {
//   try {
//     const [rows] = await db.query("SELECT id, name FROM categories");
//     return NextResponse.json(rows);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
