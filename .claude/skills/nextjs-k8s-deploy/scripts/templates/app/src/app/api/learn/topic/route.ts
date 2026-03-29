import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pool from "@/lib/db";
import { getUser } from "@/lib/api-auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const topic = req.nextUrl.searchParams.get("topic");
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

  // Check cache first
  const { rows: cached } = await pool.query(
    `SELECT content FROM lesson_cache WHERE user_id = $1 AND topic = $2`,
    [user.user_id, topic]
  );
  if (cached.length > 0) {
    return NextResponse.json({ topic, lesson: cached[0].content, cached: true });
  }

  // Generate lesson via OpenAI
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "mock") {
    // Fallback mock lesson
    const mockLesson = {
      title: `Learn ${topic}`,
      explanation: `${topic} is a fundamental concept in Python programming. It allows you to store, manipulate, and work with data effectively.`,
      why_it_matters: `Understanding ${topic} is essential for writing any Python program. It forms the building blocks of all programming logic.`,
      real_world: `Think of ${topic} like a labeled container — you give it a name and put something inside. Just like how you label boxes when moving houses.`,
      code_examples: [
        { title: "Basic Example", code: `# Example of ${topic}\nprint("Hello, ${topic}!")`, explanation: "A simple demonstration." },
        { title: "Practical Example", code: `# Using ${topic} in practice\nresult = 42\nprint(f"The answer is {result}")`, explanation: "A more practical usage." },
      ],
      key_rules: [
        `${topic} follows Python's standard syntax rules`,
        "Always use descriptive names for clarity",
        "Practice with small examples before building larger programs",
      ],
      practice_exercises: [
        { difficulty: "easy", title: `Basic ${topic}`, description: `Write a simple program using ${topic}.`, starter_code: `# Your code here\n`, expected_output: "Hello, World!" },
        { difficulty: "medium", title: `${topic} Challenge`, description: `Solve a problem using ${topic} concepts.`, starter_code: `# Solve this challenge\n`, expected_output: "" },
        { difficulty: "hard", title: `Advanced ${topic}`, description: `Build a mini project using ${topic}.`, starter_code: `# Build your project\n`, expected_output: "" },
      ],
    };
    await pool.query(
      `INSERT INTO lesson_cache (user_id, topic, content) VALUES ($1, $2, $3) ON CONFLICT (user_id, topic) DO UPDATE SET content = $3`,
      [user.user_id, topic, JSON.stringify(mockLesson)]
    );
    return NextResponse.json({ topic, lesson: mockLesson, cached: false });
  }

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert Python tutor creating a structured lesson. Return ONLY valid JSON with this exact structure:
{
  "title": "string - lesson title",
  "explanation": "string - 2-3 paragraphs explaining the concept clearly",
  "why_it_matters": "string - why this concept is important in real programming",
  "real_world": "string - a relatable real-world analogy",
  "code_examples": [
    { "title": "string", "code": "string - Python code", "explanation": "string" },
    { "title": "string", "code": "string - Python code", "explanation": "string" },
    { "title": "string", "code": "string - Python code", "explanation": "string" }
  ],
  "key_rules": ["string - important rule 1", "string - rule 2", "string - rule 3", "string - rule 4"],
  "practice_exercises": [
    { "difficulty": "easy", "title": "string", "description": "string", "starter_code": "string - Python code with comments", "expected_output": "string" },
    { "difficulty": "medium", "title": "string", "description": "string", "starter_code": "string", "expected_output": "string" },
    { "difficulty": "hard", "title": "string", "description": "string", "starter_code": "string", "expected_output": "" }
  ]
}
Make code examples progressively harder. Make exercises practical and testable.`
        },
        {
          role: "user",
          content: `Create a complete Python lesson for the topic: "${topic}". The student is learning Python from scratch.`
        }
      ],
      max_tokens: 2000,
    });

    const text = resp.choices[0]?.message?.content || "";
    let lesson;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
      lesson = JSON.parse(jsonMatch ? jsonMatch[1].trim() : text.trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse lesson content" }, { status: 500 });
    }

    // Cache the lesson
    await pool.query(
      `INSERT INTO lesson_cache (user_id, topic, content) VALUES ($1, $2, $3) ON CONFLICT (user_id, topic) DO UPDATE SET content = $3`,
      [user.user_id, topic, JSON.stringify(lesson)]
    );

    return NextResponse.json({ topic, lesson, cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate lesson: " + (err.message || "unknown") }, { status: 500 });
  }
}
