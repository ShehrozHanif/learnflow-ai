import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

  // Class overview stats
  const { rows: overviewRows } = await pool.query(`
    SELECT
      COUNT(DISTINCT u.id) as total_students,
      COALESCE(ROUND(AVG(p.mastery_score)), 0) as avg_mastery
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.role = 'student'
  `);
  const overview = overviewRows[0] || { total_students: 0, avg_mastery: 0 };

  let totalExercises = 0;
  try {
    const exRes = await pool.query(`SELECT COUNT(*) as c FROM assigned_exercises`);
    totalExercises = Number(exRes.rows[0]?.c || 0);
  } catch { /* table may not exist */ }

  let totalQuizzes = 0;
  try {
    const qRes = await pool.query(`SELECT COUNT(*) as c FROM quizzes`);
    totalQuizzes = Number(qRes.rows[0]?.c || 0);
  } catch { /* table may not exist */ }

  // Mastery distribution (how many students at each level)
  const { rows: distRows } = await pool.query(`
    SELECT
      u.id,
      COALESCE(ROUND(AVG(p.mastery_score)), 0) as avg_mastery
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.role = 'student'
    GROUP BY u.id
  `);
  const distribution = { Beginner: 0, Learning: 0, Proficient: 0, Mastered: 0 };
  for (const r of distRows) {
    const m = Number(r.avg_mastery);
    if (m >= 91) distribution.Mastered++;
    else if (m >= 71) distribution.Proficient++;
    else if (m >= 41) distribution.Learning++;
    else distribution.Beginner++;
  }

  // Per-topic class average
  const { rows: topicRows } = await pool.query(`
    SELECT
      p.topic,
      ROUND(AVG(p.mastery_score)) as avg_score,
      COUNT(DISTINCT p.user_id) as student_count
    FROM progress p
    JOIN users u ON u.id = p.user_id AND u.role = 'student'
    GROUP BY p.topic
    ORDER BY avg_score ASC
  `);

  // Top performers (top 5 by avg mastery)
  const { rows: topPerformers } = await pool.query(`
    SELECT u.id, u.name, COALESCE(ROUND(AVG(p.mastery_score)), 0) as avg_mastery
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.role = 'student'
    GROUP BY u.id, u.name
    ORDER BY avg_mastery DESC
    LIMIT 5
  `);

  // Struggling students (unresolved alerts or low mastery)
  const { rows: struggling } = await pool.query(`
    SELECT DISTINCT u.id, u.name,
      COALESCE(ROUND(AVG(p.mastery_score)), 0) as avg_mastery,
      (SELECT COUNT(*) FROM struggle_alerts sa WHERE sa.user_id = u.id AND sa.resolved = false) as alert_count
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.role = 'student'
      AND (
        EXISTS (SELECT 1 FROM struggle_alerts sa WHERE sa.user_id = u.id AND sa.resolved = false)
        OR COALESCE((SELECT ROUND(AVG(mastery_score)) FROM progress WHERE user_id = u.id), 0) < 40
      )
    GROUP BY u.id, u.name
    ORDER BY alert_count DESC, avg_mastery ASC
    LIMIT 5
  `);

  // Recent activity (latest quiz attempts + exercise submissions)
  let recentQuizzes: any[] = [];
  try {
    const rq = await pool.query(`
      SELECT u.name, q.topic, qa.score, qa.total, qa.completed_at
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      JOIN users u ON u.id = qa.user_id
      ORDER BY qa.completed_at DESC
      LIMIT 8
    `);
    recentQuizzes = rq.rows;
  } catch { /* table may not exist */ }

  let recentExercises: any[] = [];
  try {
    const re = await pool.query(`
      SELECT u.name, ae.title, ae.topic, ae.status, ae.grade, ae.created_at
      FROM assigned_exercises ae
      JOIN users u ON u.id = ae.student_id
      ORDER BY ae.created_at DESC
      LIMIT 8
    `);
    recentExercises = re.rows;
  } catch { /* table may not exist */ }

  return NextResponse.json({
    overview: {
      total_students: Number(overview.total_students),
      avg_mastery: Number(overview.avg_mastery),
      total_exercises: totalExercises,
      total_quizzes: totalQuizzes,
    },
    distribution,
    topics: topicRows.map(t => ({
      topic: t.topic,
      avg_score: Number(t.avg_score),
      student_count: Number(t.student_count),
    })),
    top_performers: topPerformers.map(s => ({
      id: s.id,
      name: s.name,
      avg_mastery: Number(s.avg_mastery),
    })),
    struggling: struggling.map(s => ({
      id: s.id,
      name: s.name,
      avg_mastery: Number(s.avg_mastery),
      alert_count: Number(s.alert_count),
    })),
    recent_quizzes: recentQuizzes.map(r => ({
      student: r.name,
      topic: r.topic,
      score: Number(r.score),
      total: Number(r.total),
      date: r.completed_at,
    })),
    recent_exercises: recentExercises.map(r => ({
      student: r.name,
      title: r.title,
      topic: r.topic,
      status: r.status,
      grade: r.grade ? Number(r.grade) : null,
      date: r.created_at,
    })),
  });
}
