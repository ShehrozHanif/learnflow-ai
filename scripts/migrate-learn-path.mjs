// Learning Path — Database Migration
import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("Learning Path migration: learning_path + lesson_cache tables");

  // 1. learning_path — tracks per-user topic completion
  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_path (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(255) NOT NULL,
      step VARCHAR(50) NOT NULL DEFAULT 'lesson',
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, topic, step)
    );
    CREATE INDEX IF NOT EXISTS idx_learning_path_user ON learning_path(user_id);
  `);
  console.log("  + learning_path table created");

  // 2. lesson_cache — stores AI-generated lesson content per user per topic
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_cache (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(255) NOT NULL,
      content JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, topic)
    );
    CREATE INDEX IF NOT EXISTS idx_lesson_cache_user_topic ON lesson_cache(user_id, topic);
  `);
  console.log("  + lesson_cache table created");

  console.log("Learning Path migration complete!");
  await pool.end();
}

migrate().catch((err) => { console.error("Migration failed:", err); process.exit(1); });
