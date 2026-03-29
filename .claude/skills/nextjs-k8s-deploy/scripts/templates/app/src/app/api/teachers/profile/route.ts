import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  const { rows } = await pool.query(
    `SELECT education, experience, specialization, achievements, bio FROM teacher_profiles WHERE user_id = $1`,
    [user.user_id]
  );

  if (rows.length === 0) {
    // Auto-create profile
    await pool.query(`INSERT INTO teacher_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [user.user_id]);
    return NextResponse.json({ education: "", experience: "", specialization: "", achievements: "", bio: "" });
  }

  return NextResponse.json(rows[0]);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  const { education, experience, specialization, achievements, bio } = await req.json();

  await pool.query(
    `INSERT INTO teacher_profiles (user_id, education, experience, specialization, achievements, bio, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       education = COALESCE($2, teacher_profiles.education),
       experience = COALESCE($3, teacher_profiles.experience),
       specialization = COALESCE($4, teacher_profiles.specialization),
       achievements = COALESCE($5, teacher_profiles.achievements),
       bio = COALESCE($6, teacher_profiles.bio),
       updated_at = NOW()`,
    [user.user_id, education || "", experience || "", specialization || "", achievements || "", bio || ""]
  );

  return NextResponse.json({ success: true });
}
