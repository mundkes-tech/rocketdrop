// /src/app/api/profile/route.js
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// Helper for consistent responses
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * =========================================
 * 🔹 GET — Fetch USER Profile (by id or email)
 * =========================================
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email)
      return sendResponse(false, 'User ID or Email is required.', null, 400);

    const condition = id ? 'id = ?' : 'email = ?';
    const value = id || email;

    const [rows] = await db.query(
      `SELECT id, name, email, phone, address FROM users WHERE ${condition}`,
      [value]
    );

    if (rows.length === 0)
      return sendResponse(false, 'User profile not found.', null, 404);

    return sendResponse(true, 'User profile fetched successfully.', { profile: rows[0] });
  } catch (err) {
    console.error('❌ [GET /api/profile] Error:', err);
    return sendResponse(false, 'Server error while fetching profile.', { details: err.message }, 500);
  }
}

/**
 * =========================================
 * 🔹 PATCH — Update USER Profile
 * =========================================
 */
export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return sendResponse(false, 'Invalid JSON body.', null, 400);

    const { id, email, password, ...data } = body;

    if (!id && !email)
      return sendResponse(false, 'User ID or Email required.', null, 400);

    const condition = id ? 'id = ?' : 'email = ?';
    const identifier = id || email;

    // If password is being updated → hash it
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // No fields to update?
    if (Object.keys(data).length === 0)
      return sendResponse(false, 'No fields provided to update.', null, 400);

    // Build dynamic SET clause
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col) => `${col} = ?`).join(', ');

    const [result] = await db.query(
      `UPDATE users SET ${setClause} WHERE ${condition}`,
      [...values, identifier]
    );

    if (result.affectedRows === 0)
      return sendResponse(false, 'User not found or no changes applied.', null, 404);

    const [updatedRows] = await db.query(
      `SELECT id, name, email, phone, address FROM users WHERE ${condition}`,
      [identifier]
    );

    return sendResponse(true, 'Profile updated successfully.', { updatedProfile: updatedRows[0] });
  } catch (err) {
    console.error('❌ [PATCH /api/profile] Error:', err);
    return sendResponse(false, 'Server error while updating profile.', { details: err.message }, 500);
  }
}