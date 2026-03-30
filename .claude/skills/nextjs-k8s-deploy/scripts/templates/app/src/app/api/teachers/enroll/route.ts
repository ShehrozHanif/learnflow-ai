import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  const { teacher_id } = await req.json();
  if (!teacher_id) return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });

  // Verify teacher exists
  const { rows: teacherRows } = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND role = 'teacher'`,
    [teacher_id]
  );
  if (teacherRows.length === 0) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  // Remove any existing enrollment (student switches mentor)
  await pool.query(`DELETE FROM enrollments WHERE student_id = $1`, [user.user_id]);

  // Create new enrollment
  await pool.query(
    `INSERT INTO enrollments (student_id, teacher_id) VALUES ($1, $2)`,
    [user.user_id, teacher_id]
  );

  return NextResponse.json({ success: true, teacher_id });
}
