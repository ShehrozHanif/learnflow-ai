import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUser } from "@/lib/api-auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { topic, difficulty } = await req.json();
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });
  const diff = difficulty || "medium";

  if (!OPENAI_API_KEY || OPENAI_API_KEY === "mock") {
    return NextResponse.json({
      exercise: {
        difficulty: diff,
        title: `${diff.charAt(0).toUpperCase() + diff.slice(1)} ${topic} Exercise`,
        description: `Write a Python program that demonstrates your understanding of ${topic}. This is a ${diff} level exercise.`,
        starter_code: `# ${diff} ${topic} exercise\n# Write your code here\n`,
        expected_output: "",
      }
    });
  }

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: `You are a Python tutor creating a practice exercise. Return ONLY valid JSON:
{
  "difficulty": "${diff}",
  "title": "string - short exercise title",
  "description": "string - clear description of what to build/solve",
  "starter_code": "string - Python starter code with comments guiding the student",
  "expected_output": "string - what the output should look like (if applicable)"
}
Make it practical, interesting, and appropriate for ${diff} difficulty. The exercise must be about Python "${topic}".`
        },
        {
          role: "user",
          content: `Generate a unique ${diff}-level Python practice exercise about "${topic}". Make it different from typical textbook problems — something fun and practical.`
        }
      ],
      max_tokens: 600,
    });

    const text = resp.choices[0]?.message?.content || "";
    let exercise;
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
      exercise = JSON.parse(jsonMatch ? jsonMatch[1].trim() : text.trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse exercise" }, { status: 500 });
    }

    return NextResponse.json({ exercise });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate: " + (err.message || "unknown") }, { status: 500 });
  }
}
