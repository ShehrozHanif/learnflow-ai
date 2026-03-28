import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  const studentId = req.nextUrl.searchParams.get("id");
  if (!studentId) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

  // Get student info
  const { rows: userRows } = await pool.query(
    `SELECT id, name, email, created_at FROM users WHERE id = $1 AND role = 'student'`,
    [studentId]
  );
  if (userRows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  const student = userRows[0];

  // Get progress per topic
  const { rows: progressRows } = await pool.query(
    `SELECT topic, mastery_score as pct, level, exercises_completed, quiz_score, code_quality, streak
     FROM progress WHERE user_id = $1 ORDER BY id`,
    [studentId]
  );

  // Get unresolved struggle alerts
  const { rows: alertRows } = await pool.query(
    `SELECT topic, alert_type, attempts, message, created_at
     FROM struggle_alerts WHERE user_id = $1 AND resolved = false
     ORDER BY created_at DESC LIMIT 10`,
    [studentId]
  );

  // Get recent submissions
  const { rows: subRows } = await pool.query(
    `SELECT code, result, feedback, submitted_at
     FROM submissions WHERE user_id = $1
     ORDER BY submitted_at DESC LIMIT 10`,
    [studentId]
  );

  // Get quiz attempts
  let quizRows: any[] = [];
  try {
    const quizResult = await pool.query(
      `SELECT q.topic, qa.score, qa.total, qa.completed_at
       FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.user_id = $1 ORDER BY qa.completed_at DESC LIMIT 10`,
      [studentId]
    );
    quizRows = quizResult.rows;
  } catch { /* table may not exist */ }

  // Get assigned exercises
  let exRows: any[] = [];
  try {
    const exResult = await pool.query(
      `SELECT title, topic, difficulty, status, grade, feedback, created_at
       FROM assigned_exercises WHERE student_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [studentId]
    );
    exRows = exResult.rows;
  } catch { /* table may not exist */ }

  // Determine stuck topics (from alerts)
  const stuckTopics = [...new Set(alertRows.map(a => a.topic))];

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      joined: student.created_at,
    },
    progress: progressRows.map(r => ({
      topic: r.topic,
      pct: Math.round(Number(r.pct)),
      level: r.level || "Beginner",
      exercises_completed: Math.round(Number(r.exercises_completed || 0)),
      quiz_score: Math.round(Number(r.quiz_score || 0)),
      code_quality: Math.round(Number(r.code_quality || 0)),
      streak: Number(r.streak || 0),
      stuck: stuckTopics.includes(r.topic),
    })),
    alerts: alertRows,
    recent_submissions: subRows,
    quiz_attempts: quizRows.map(q => ({
      topic: q.topic,
      score: Number(q.score),
      total: Number(q.total),
      date: q.completed_at,
    })),
    exercises: exRows,
    stuck_topics: stuckTopics,
  });
}
