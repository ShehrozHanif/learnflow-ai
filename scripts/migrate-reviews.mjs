// Teacher Code Reviews — Database Migration
import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("Reviews migration: add review columns to submissions");

  // Add teacher review columns to submissions table
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_remarks TEXT DEFAULT NULL`);
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_code TEXT DEFAULT NULL`);
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL`);
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) DEFAULT NULL`);
  await pool.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS review_seen BOOLEAN DEFAULT FALSE`);
  console.log("  + Added teacher_remarks, teacher_code, reviewed_at, reviewed_by, review_seen to submissions");

  // Add notif_seen to struggle_alerts for student notification tracking
  await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS notif_seen BOOLEAN DEFAULT FALSE`);
  console.log("  + Added notif_seen to struggle_alerts");

  console.log("Reviews migration complete!");
  await pool.end();
}

migrate().catch((err) => { console.error("Migration failed:", err); process.exit(1); });
