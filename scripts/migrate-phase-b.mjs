/**
 * Phase B Migration — Expand schema for real data
 */
import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("ERROR: DATABASE_URL not set"); process.exit(1); }

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });

const MIGRATION = `
-- Struggle alerts table for teacher dashboard
CREATE TABLE IF NOT EXISTS struggle_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL DEFAULT 'repeated_error',
    attempts INTEGER DEFAULT 0,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON struggle_alerts(resolved);

-- Add topic column default list (for seeding on registration)
-- Ensure progress has a unique constraint for user+topic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_progress_user_topic'
    ) THEN
        ALTER TABLE progress ADD CONSTRAINT uq_progress_user_topic UNIQUE (user_id, topic);
    END IF;
END $$;

-- Add level column to progress if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'progress' AND column_name = 'level'
    ) THEN
        ALTER TABLE progress ADD COLUMN level VARCHAR(50) DEFAULT 'Beginner';
    END IF;
END $$;
`;

async function migrate() {
  console.log("Running Phase B migration...");
  const client = await pool.connect();
  try {
    await client.query(MIGRATION);
    console.log("Schema updated!");

    // Verify
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    console.log("Tables:", res.rows.map(r => r.table_name).join(", "));
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error("Migration failed:", err.message); process.exit(1); });
