import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  const { submission_id, teacher_remarks, teacher_code } = await req.json();
  if (!submission_id) return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  if (!teacher_remarks && !teacher_code) return NextResponse.json({ error: "Provide remarks or corrected code" }, { status: 400 });

  // Ensure review columns exist
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_remarks TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_code TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS review_seen BOOLEAN DEFAULT FALSE`).catch(() => {});

  // Verify submission exists
  const { rows: subRows } = await pool.query(`SELECT id FROM submissions WHERE id = $1`, [submission_id]);
  if (subRows.length === 0) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  // Save review
  const { rowCount } = await pool.query(
    `UPDATE submissions SET teacher_remarks = $1, teacher_code = $2, reviewed_at = NOW(), reviewed_by = $3, review_seen = FALSE WHERE id = $4`,
    [teacher_remarks || null, teacher_code || null, user.user_id, submission_id]
  );

  if (rowCount === 0) return NextResponse.json({ error: "Failed to save review" }, { status: 500 });

  return NextResponse.json({ success: true, message: "Review saved. Student will be notified." });
}
