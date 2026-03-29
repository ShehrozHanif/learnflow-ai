import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows } = await pool.query(`
    SELECT
      u.id, u.name, u.email, u.created_at,
      COALESCE(tp.education, '') as education,
      COALESCE(tp.experience, '') as experience,
      COALESCE(tp.specialization, '') as specialization,
      COALESCE(tp.achievements, '') as achievements,
      COALESCE(tp.bio, '') as bio,
      (SELECT COUNT(*) FROM enrollments e WHERE e.teacher_id = u.id) as student_count
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.role = 'teacher'
    ORDER BY u.name
  `);

  // If student, also check if enrolled with any teacher
  let myMentorId = null;
  if (user.role === "student") {
    const { rows: enrollRows } = await pool.query(
      `SELECT teacher_id FROM enrollments WHERE student_id = $1 LIMIT 1`,
      [user.user_id]
    );
    if (enrollRows.length > 0) myMentorId = enrollRows[0].teacher_id;
  }

  const colors = ["#3B82F6","#6366F1","#8B5CF6","#F59E0B","#10B981","#F43F5E","#60A5FA","#34D399"];
  return NextResponse.json({
    teachers: rows.map((t, i) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      initials: t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      color: colors[i % colors.length],
      education: t.education,
      experience: t.experience,
      specialization: t.specialization,
      achievements: t.achievements,
      bio: t.bio,
      student_count: Number(t.student_count),
      joined: t.created_at,
      is_my_mentor: t.id === myMentorId,
    })),
    my_mentor_id: myMentorId,
  });
}
