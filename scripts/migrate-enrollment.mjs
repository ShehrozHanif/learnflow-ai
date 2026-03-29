// Enrollment System — Database Migration
import pg from "pg";
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("Enrollment migration: teacher_profiles + enrollments tables");

  // 1. teacher_profiles — stores teacher details
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      education TEXT DEFAULT '',
      experience TEXT DEFAULT '',
      specialization TEXT DEFAULT '',
      achievements TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user ON teacher_profiles(user_id);
  `);
  console.log("  + teacher_profiles table created");

  // 2. enrollments — student picks a teacher
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, teacher_id)
    );
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_teacher ON enrollments(teacher_id);
  `);
  console.log("  + enrollments table created");

  // 3. Auto-create teacher_profiles for existing teachers
  await pool.query(`
    INSERT INTO teacher_profiles (user_id)
    SELECT id FROM users WHERE role = 'teacher'
    ON CONFLICT (user_id) DO NOTHING
  `);
  console.log("  + seeded profiles for existing teachers");

  console.log("Enrollment migration complete!");
  await pool.end();
}

migrate().catch((err) => { console.error("Migration failed:", err); process.exit(1); });
