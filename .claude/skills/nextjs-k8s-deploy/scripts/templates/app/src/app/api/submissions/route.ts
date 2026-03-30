import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT id, code, result, feedback, submitted_at
     FROM submissions WHERE user_id = $1
     ORDER BY submitted_at DESC LIMIT 50`,
    [user.user_id]
  );

  // Calculate stats
  const stats = await pool.query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE result = 'success') as successes,
       COUNT(*) FILTER (WHERE result = 'error') as failures,
       COUNT(DISTINCT DATE(submitted_at)) as active_days
     FROM submissions WHERE user_id = $1`,
    [user.user_id]
  );

  // Calculate true consecutive-day streak (counting back from today)
  const streakQuery = await pool.query(
    `SELECT DISTINCT DATE(submitted_at) as d FROM submissions
     WHERE user_id = $1 ORDER BY d DESC`,
    [user.user_id]
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < streakQuery.rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const actual = new Date(streakQuery.rows[i].d);
    actual.setHours(0, 0, 0, 0);
    if (actual.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate current failure streak (consecutive errors from most recent)
  const recentRuns = await pool.query(
    `SELECT result FROM submissions WHERE user_id = $1
     ORDER BY submitted_at DESC LIMIT 20`,
    [user.user_id]
  );
  let failStreak = 0;
  for (const r of recentRuns.rows) {
    if (r.result === "error") failStreak++;
    else break;
  }

  const s = stats.rows[0] || {};
  return NextResponse.json({
    submissions: rows,
    stats: {
      total: Number(s.total || 0),
      successes: Number(s.successes || 0),
      failures: Number(s.failures || 0),
      active_days: Number(s.active_days || 0),
      streak,
      fail_streak: failStreak,
    }
  });
}
