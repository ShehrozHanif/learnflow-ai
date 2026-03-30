import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  const studentId = req.nextUrl.searchParams.get("student_id");
  if (!studentId) return NextResponse.json({ error: "student_id required" }, { status: 400 });

  // Get student name
  const { rows: userRows } = await pool.query(
    `SELECT name FROM users WHERE id = $1 AND role = 'student'`,
    [studentId]
  );
  if (userRows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Ensure review columns exist
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_remarks TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_code TEXT DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) DEFAULT NULL`).catch(() => {});

  // Get recent submissions, optionally filtered by topic
  const topic = req.nextUrl.searchParams.get("topic");
  let query: string;
  let params: (string | number)[];

  if (topic) {
    query = `
      SELECT s.id, s.code, s.result, s.feedback, s.submitted_at,
             s.teacher_remarks, s.teacher_code, s.reviewed_at,
             COALESCE(e.topic, $3) as topic
      FROM submissions s
      LEFT JOIN assigned_exercises e ON e.id = s.exercise_id
      WHERE s.user_id = $1
      ORDER BY s.submitted_at DESC
      LIMIT $2
    `;
    params = [Number(studentId), 10, topic];
  } else {
    query = `
      SELECT s.id, s.code, s.result, s.feedback, s.submitted_at,
             s.teacher_remarks, s.teacher_code, s.reviewed_at,
             COALESCE(e.topic, 'General') as topic
      FROM submissions s
      LEFT JOIN assigned_exercises e ON e.id = s.exercise_id
      WHERE s.user_id = $1
      ORDER BY s.submitted_at DESC
      LIMIT $2
    `;
    params = [Number(studentId), 10];
  }

  const { rows } = await pool.query(query, params);

  return NextResponse.json({
    student_name: userRows[0].name,
    topic: topic || null,
    submissions: rows.map((s) => ({
      id: s.id,
      code: s.code,
      result: s.result,
      feedback: s.feedback,
      topic: s.topic,
      submitted_at: s.submitted_at,
      teacher_remarks: s.teacher_remarks || null,
      teacher_code: s.teacher_code || null,
      reviewed_at: s.reviewed_at || null,
    })),
  });
}
