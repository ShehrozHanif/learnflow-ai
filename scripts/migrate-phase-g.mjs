// Phase G: Quizzes & Exercises — Database Migration
import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("Phase G migration: Quizzes & Exercises");

  // 1. Quizzes table — stores AI-generated quizzes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id SERIAL PRIMARY KEY,
      topic VARCHAR(255) NOT NULL,
      difficulty VARCHAR(50) DEFAULT 'beginner',
      title VARCHAR(255) NOT NULL,
      questions JSONB NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);
  `);
  console.log("  ✓ quizzes table created");

  // 2. Quiz attempts — tracks student submissions and scores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      percentage DECIMAL(5,2) DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
  `);
  console.log("  ✓ quiz_attempts table created");

  // 3. Extend assigned_exercises with student submission + grading columns
  const cols = [
    ["student_code", "TEXT"],
    ["grade", "INTEGER"],
    ["feedback", "TEXT"],
    ["graded_at", "TIMESTAMP"],
    ["expected_output", "TEXT"],
  ];
  for (const [col, type] of cols) {
    try {
      await pool.query(`ALTER TABLE assigned_exercises ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    } catch { /* column may already exist */ }
  }
  console.log("  ✓ assigned_exercises grading columns added");

  console.log("Phase G migration complete!");
  await pool.end();
}

migrate().catch((err) => { console.error("Migration failed:", err); process.exit(1); });
