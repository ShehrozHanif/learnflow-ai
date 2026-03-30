import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { topic, step } = await req.json();
  if (!topic || !step) return NextResponse.json({ error: "Topic and step required" }, { status: 400 });
  if (!["lesson", "practice", "quiz"].includes(step)) {
    return NextResponse.json({ error: "Step must be lesson, practice, or quiz" }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO learning_path (user_id, topic, step, completed, completed_at)
     VALUES ($1, $2, $3, true, NOW())
     ON CONFLICT (user_id, topic, step) DO UPDATE SET completed = true, completed_at = NOW()`,
    [user.user_id, topic, step]
  );

  return NextResponse.json({ success: true, topic, step });
}
