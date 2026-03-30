import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

// GET — fetch teacher reviews for the logged-in student
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  // Ensure review columns exist
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_remarks TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_code TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS review_seen BOOLEAN DEFAULT FALSE`).catch(() => {});

  const { rows } = await pool.query(`
    SELECT s.id, s.code, s.result, s.feedback, s.submitted_at,
           s.teacher_remarks, s.teacher_code, s.reviewed_at, s.review_seen,
           u.name as reviewer_name
    FROM submissions s
    JOIN users u ON u.id = s.reviewed_by
    WHERE s.user_id = $1 AND s.reviewed_at IS NOT NULL
    ORDER BY s.reviewed_at DESC
    LIMIT 20
  `, [user.user_id]);

  const unseen = rows.filter(r => !r.review_seen).length;

  return NextResponse.json({
    reviews: rows.map(r => ({
      id: r.id,
      code: r.code,
      result: r.result,
      feedback: r.feedback,
      submitted_at: r.submitted_at,
      teacher_remarks: r.teacher_remarks,
      teacher_code: r.teacher_code,
      reviewed_at: r.reviewed_at,
      review_seen: r.review_seen,
      reviewer_name: r.reviewer_name,
    })),
    unseen_count: unseen,
  });
}

// POST — mark reviews as seen
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS review_seen BOOLEAN DEFAULT FALSE`).catch(() => {});

  await pool.query(
    `UPDATE submissions SET review_seen = TRUE WHERE user_id = $1 AND reviewed_at IS NOT NULL AND review_seen = FALSE`,
    [user.user_id]
  );

  return NextResponse.json({ success: true });
}
