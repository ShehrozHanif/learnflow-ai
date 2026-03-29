import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

const TOPICS_ORDER = [
  "Variables", "Data Types", "Loops", "Lists",
  "Functions", "OOP", "Error Handling", "Libraries"
];

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get all learning_path entries for this user
  const { rows } = await pool.query(
    `SELECT topic, step, completed FROM learning_path WHERE user_id = $1`,
    [user.user_id]
  );

  // Build status map
  const statusMap: Record<string, { lesson: boolean; practice: boolean; quiz: boolean; build: boolean }> = {};
  for (const r of rows) {
    if (!statusMap[r.topic]) statusMap[r.topic] = { lesson: false, practice: false, quiz: false, build: false };
    if (r.completed) statusMap[r.topic][r.step as "lesson"|"practice"|"quiz"|"build"] = true;
  }

  // Determine which topics are unlocked
  // First topic is always unlocked. Others unlock when previous topic's build is completed.
  const topics = TOPICS_ORDER.map((topic, i) => {
    const s = statusMap[topic] || { lesson: false, practice: false, quiz: false, build: false };
    const prevCompleted = i === 0 ? true : (statusMap[TOPICS_ORDER[i - 1]]?.build === true);
    const allDone = s.lesson && s.practice && s.quiz && s.build;
    return {
      topic,
      index: i,
      unlocked: prevCompleted,
      lesson_done: s.lesson,
      practice_done: s.practice,
      quiz_done: s.quiz,
      build_done: s.build,
      completed: allDone,
      current_step: !s.lesson ? "lesson" : !s.practice ? "practice" : !s.quiz ? "quiz" : !s.build ? "build" : "done",
    };
  });

  const completedCount = topics.filter(t => t.completed).length;

  return NextResponse.json({ topics, completed: completedCount, total: TOPICS_ORDER.length });
}
