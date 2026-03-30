import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "all"; // "all" | "weekly"

  const dateFilter = period === "weekly"
    ? "AND p.updated_at > NOW() - INTERVAL '7 days'"
    : "";

  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.name,
      COALESCE(ROUND(AVG(p.mastery_score)), 0) as avg_mastery,
      COALESCE(MAX(p.streak), 0) as streak,
      COUNT(DISTINCT p.topic) FILTER (WHERE p.mastery_score > 0) as topics_started,
      COUNT(DISTINCT p.topic) FILTER (WHERE p.level = 'Mastered') as topics_mastered,
      (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id ${period === "weekly" ? "AND s.submitted_at > NOW() - INTERVAL '7 days'" : ""}) as code_runs,
      (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id AND s.result = 'success' ${period === "weekly" ? "AND s.submitted_at > NOW() - INTERVAL '7 days'" : ""}) as successful_runs,
      (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = u.id ${period === "weekly" ? "AND qa.submitted_at > NOW() - INTERVAL '7 days'" : ""}) as quizzes_taken
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id ${dateFilter}
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY avg_mastery DESC, streak DESC, topics_started DESC
  `);

  const colors = ["#3B82F6","#6366F1","#8B5CF6","#F59E0B","#10B981","#F43F5E","#60A5FA","#34D399"];

  const leaderboard = rows.map((r: any, i: number) => ({
    rank: i + 1,
    id: r.id,
    name: r.name,
    initials: r.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    color: colors[i % colors.length],
    avg_mastery: Number(r.avg_mastery),
    streak: Number(r.streak),
    topics_started: Number(r.topics_started),
    topics_mastered: Number(r.topics_mastered),
    code_runs: Number(r.code_runs),
    successful_runs: Number(r.successful_runs),
    quizzes_taken: Number(r.quizzes_taken),
    is_me: r.id === user.user_id,
  }));

  const myRank = leaderboard.find((l: any) => l.is_me);

  return NextResponse.json({ leaderboard, my_rank: myRank || null });
}
