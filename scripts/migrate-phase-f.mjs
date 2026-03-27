// Phase F: Struggle Detection Live — Database Migration
// Adds assigned_exercises table and extends struggle_alerts

import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("Phase F migration: Struggle Detection Live");

  // 1. Assigned exercises table — teachers assign exercises to specific students
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assigned_exercises (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      starter_code TEXT,
      difficulty VARCHAR(50) DEFAULT 'beginner',
      topic VARCHAR(255),
      due_date TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_assigned_student ON assigned_exercises(student_id, status);
    CREATE INDEX IF NOT EXISTS idx_assigned_teacher ON assigned_exercises(teacher_id);
  `);
  console.log("  ✓ assigned_exercises table created");

  // 2. Add alert_type values we'll use: frustrated_message, low_quiz_score, stuck_time
  //    Also add message column to struggle_alerts for context
  try {
    await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS message TEXT`);
    console.log("  ✓ struggle_alerts.message column added");
  } catch {
    console.log("  ⓘ struggle_alerts.message column already exists or skipped");
  }

  // 3. Add resolved_by and resolved_at to struggle_alerts
  try {
    await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id)`);
    await pool.query(`ALTER TABLE struggle_alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP`);
    console.log("  ✓ struggle_alerts resolved tracking columns added");
  } catch {
    console.log("  ⓘ resolved columns already exist or skipped");
  }

  console.log("Phase F migration complete!");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
