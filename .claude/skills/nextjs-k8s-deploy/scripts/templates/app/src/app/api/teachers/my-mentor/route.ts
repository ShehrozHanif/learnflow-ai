import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email,
      COALESCE(tp.education, '') as education,
      COALESCE(tp.experience, '') as experience,
      COALESCE(tp.specialization, '') as specialization,
      COALESCE(tp.bio, '') as bio,
      e.enrolled_at
    FROM enrollments e
    JOIN users u ON u.id = e.teacher_id
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE e.student_id = $1
    LIMIT 1
  `, [user.user_id]);

  if (rows.length === 0) return NextResponse.json({ mentor: null });

  const t = rows[0];
  return NextResponse.json({
    mentor: {
      id: t.id,
      name: t.name,
      email: t.email,
      education: t.education,
      experience: t.experience,
      specialization: t.specialization,
      bio: t.bio,
      enrolled_at: t.enrolled_at,
    }
  });
}
