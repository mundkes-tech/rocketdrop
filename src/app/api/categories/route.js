import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mundke@22",
  database: "rocketdrop",
});

export async function GET() {
  try {
    const [rows] = await db.query("SELECT id, name FROM categories");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
