import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

// GET — student notifications: resolved alerts + teacher actions
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  // Ensure columns exist
  await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id)`).catch(() => {});
  await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP`).catch(() => {});
  await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS notif_seen BOOLEAN DEFAULT FALSE`).catch(() => {});

  // Get recently resolved alerts with teacher name (last 30 days)
  const { rows } = await pool.query(`
    SELECT a.id, a.topic, a.alert_type, a.resolved_at, a.notif_seen,
           u.name as resolved_by_name
    FROM struggle_alerts a
    LEFT JOIN users u ON u.id = a.resolved_by
    WHERE a.user_id = $1 AND a.resolved = true AND a.resolved_by IS NOT NULL
      AND a.resolved_at > NOW() - INTERVAL '30 days'
    ORDER BY a.resolved_at DESC
    LIMIT 10
  `, [user.user_id]);

  const unseen = rows.filter(r => !r.notif_seen).length;

  return NextResponse.json({
    notifications: rows.map(r => ({
      id: r.id,
      topic: r.topic,
      alert_type: r.alert_type,
      resolved_at: r.resolved_at,
      resolved_by_name: r.resolved_by_name,
      seen: r.notif_seen,
    })),
    unseen_count: unseen,
  });
}

// POST — mark notifications as seen
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS notif_seen BOOLEAN DEFAULT FALSE`).catch(() => {});
  await pool.query(
    `UPDATE struggle_alerts SET notif_seen = TRUE WHERE user_id = $1 AND resolved = true AND notif_seen = FALSE`,
    [user.user_id]
  );

  return NextResponse.json({ success: true });
}
