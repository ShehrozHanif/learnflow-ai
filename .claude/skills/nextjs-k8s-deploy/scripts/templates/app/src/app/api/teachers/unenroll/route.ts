import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  const { action } = await req.json();

  if (action === "request") {
    // Request removal — sets 7-day countdown
    const { rowCount } = await pool.query(
      `UPDATE enrollments SET removal_requested_at = NOW() WHERE student_id = $1 AND removal_requested_at IS NULL`,
      [user.user_id]
    );
    if (rowCount === 0) return NextResponse.json({ error: "No active enrollment found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Removal requested. Your enrollment will end in 7 days." });
  }

  if (action === "cancel") {
    // Cancel pending removal
    const { rowCount } = await pool.query(
      `UPDATE enrollments SET removal_requested_at = NULL WHERE student_id = $1 AND removal_requested_at IS NOT NULL`,
      [user.user_id]
    );
    if (rowCount === 0) return NextResponse.json({ error: "No pending removal found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Removal cancelled. You are still enrolled." });
  }

  return NextResponse.json({ error: "Invalid action. Use 'request' or 'cancel'." }, { status: 400 });
}
