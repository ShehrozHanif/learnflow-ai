import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS snippets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      code TEXT NOT NULL,
      tags VARCHAR(255) DEFAULT '',
      starred BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// GET — list user's snippets + starter snippets
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await ensureTable();

  const { rows } = await pool.query(
    `SELECT id, title, description, code, tags, starred, created_at
     FROM snippets WHERE user_id = $1
     ORDER BY starred DESC, updated_at DESC`,
    [user.user_id]
  );

  // Pre-built starter snippets (always available, not in DB)
  const starters = [
    { id: "s1", title: "Hello World", description: "Basic print statement", code: 'print("Hello, World!")', tags: "basics,beginner", starred: false, is_starter: true },
    { id: "s2", title: "For Loop", description: "Iterate over a range", code: 'for i in range(10):\n    print(f"Number: {i}")', tags: "loops,basics", starred: false, is_starter: true },
    { id: "s3", title: "List Comprehension", description: "Create a list with comprehension", code: "squares = [x**2 for x in range(10)]\nprint(squares)", tags: "lists,intermediate", starred: false, is_starter: true },
    { id: "s4", title: "File I/O", description: "Read and write files", code: '# Write to file\nwith open("output.txt", "w") as f:\n    f.write("Hello from Python!")\n\n# Read from file\nwith open("output.txt", "r") as f:\n    print(f.read())', tags: "files,intermediate", starred: false, is_starter: true },
    { id: "s5", title: "Dictionary Operations", description: "Create and manipulate dicts", code: 'student = {"name": "Maya", "grade": 95, "topics": ["loops", "functions"]}\n\nfor key, value in student.items():\n    print(f"{key}: {value}")', tags: "dicts,basics", starred: false, is_starter: true },
    { id: "s6", title: "Function with Args", description: "Define and call a function", code: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Maya"))\nprint(greet("Ali", "Welcome"))', tags: "functions,basics", starred: false, is_starter: true },
    { id: "s7", title: "Try/Except", description: "Error handling basics", code: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\nexcept Exception as e:\n    print(f"Error: {e}")\nfinally:\n    print("Done!")', tags: "errors,intermediate", starred: false, is_starter: true },
    { id: "s8", title: "Class Definition", description: "OOP basics with a class", code: 'class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n\n    def is_passing(self):\n        return self.grade >= 60\n\n    def __str__(self):\n        return f"{self.name}: {self.grade}%"\n\ns = Student("Maya", 95)\nprint(s)\nprint(f"Passing: {s.is_passing()}")', tags: "oop,advanced", starred: false, is_starter: true },
  ];

  return NextResponse.json({ snippets: rows, starters });
}

// POST — save a new snippet
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await ensureTable();

  const { title, description, code, tags } = await req.json();
  if (!title || !code) return NextResponse.json({ error: "Title and code required" }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO snippets (user_id, title, description, code, tags)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
    [user.user_id, title.slice(0, 100), (description || "").slice(0, 255), code.slice(0, 50000), (tags || "").slice(0, 255)]
  );

  return NextResponse.json({ id: rows[0].id, created_at: rows[0].created_at });
}

// DELETE — remove a snippet
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Snippet ID required" }, { status: 400 });

  await pool.query(
    `DELETE FROM snippets WHERE id = $1 AND user_id = $2`,
    [id, user.user_id]
  );

  return NextResponse.json({ ok: true });
}

// PATCH — toggle star
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Snippet ID required" }, { status: 400 });

  await pool.query(
    `UPDATE snippets SET starred = NOT starred, updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [id, user.user_id]
  );

  return NextResponse.json({ ok: true });
}
