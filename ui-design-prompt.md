# LearnFlow — UI Design Brief for Professional Redesign

> Give this prompt to any UI design platform (v0, Figma AI, Lovable, Bolt, etc.) to generate a premium, institutional-grade design.

---

## PROMPT START

Design a **premium, institutional-grade UI** for **LearnFlow** — an AI-powered Python tutoring platform. The design must feel like it belongs at a top US university (think Harvard, MIT, Stanford) or a high-end EdTech SaaS product (think Coursera Pro, Khan Academy, GitHub Education). It should communicate trust, intelligence, sophistication, and clarity.

---

### DESIGN STANDARDS

- **Visual tier:** Ivy League / Fortune 500 EdTech — not a hackathon project, not a toy. This should look like it costs $50M to build.
- **Typography:** Use Inter, Geist, or SF Pro. Clean, readable, professional. Strong typographic hierarchy (display headings, section titles, body, captions).
- **Color system:** Deep navy/slate primary (#0F172A or #1E293B), electric blue accent (#3B82F6), emerald green for success (#10B981), amber for warnings (#F59E0B), rose for errors (#F43F5E). White and cool gray surfaces. No bright candy colors.
- **Spacing:** Generous whitespace. 8px grid system. Nothing cramped.
- **Corners:** Rounded-lg (8-12px). Subtle, not bubbly.
- **Shadows:** Layered, soft box-shadows for depth (not flat, not over-shadowed).
- **Animations:** Subtle transitions on hover/focus (200-300ms). Smooth page transitions. Loading skeletons, not spinners.
- **Dark mode support:** Design primarily for dark mode (slate-900 backgrounds) with light mode as secondary.
- **Responsive:** Desktop-first, but must work on tablet.
- **Accessibility:** WCAG 2.1 AA contrast ratios. Focus rings. Semantic labels.

---

### THE APPLICATION

**LearnFlow** is an AI-powered Python learning platform with these user roles:

#### Role 1: Student
Students chat with AI tutoring agents, write and run Python code in a browser editor, take quizzes, and track their mastery across 8 Python modules.

#### Role 2: Teacher
Teachers monitor class progress, receive real-time struggle alerts when students are stuck, and generate custom coding exercises using AI.

---

### PAGES TO DESIGN (5 total)

---

#### PAGE 1: Landing / Home Page

**Purpose:** Role selection and product introduction.

**Must include:**
- Hero section with a bold headline: "Master Python with AI" or similar
- Subtle animated gradient or mesh background behind the hero
- Brief value proposition (1-2 sentences)
- Two prominent CTA cards:
  - **"I'm a Student"** → links to /student (blue accent)
  - **"I'm a Teacher"** → links to /teacher (green accent)
- Feature highlights section (3-4 cards):
  - "AI Tutoring Agents" — 6 specialized agents that adapt to your level
  - "Live Code Editor" — Write, run, and debug Python in your browser
  - "Smart Progress Tracking" — Mastery scores across 8 Python modules
  - "Struggle Detection" — Teachers get alerted when students need help
- Footer with: "Powered by LearnFlow AI • Built with Claude Code & Goose"
- Optional: subtle floating code snippets or Python symbols as decorative elements

**Vibe:** Clean, confident, inviting. Like opening the Harvard CS50 website.

---

#### PAGE 2: Student Dashboard (3-Column Layout)

**Purpose:** The main student workspace — chat + code + progress in one view.

**Layout:** Full-height, no-scroll page with 3 panels:

```
┌──────────────────────────────────────────────────────────────────────┐
│  NavBar: Logo | "Student Dashboard" | Student Name + Avatar | ☾/☀  │
├────────────────┬──────────────────────────┬──────────────────────────┤
│                │                          │                          │
│   AI Chat      │     Code Editor          │    Progress Panel        │
│   Panel        │                          │                          │
│   (Left)       │     (Center)             │    (Right)               │
│                │                          │                          │
│                │                          │                          │
│                │                          │                          │
│                │                          │                          │
└────────────────┴──────────────────────────┴──────────────────────────┘
```

**Left Panel — AI Chat (width: ~25%)**
- Chat header: "AI Tutor" with a bot avatar icon and online status dot (green)
- Chat messages:
  - User messages: right-aligned, blue bubble, rounded
  - AI messages: left-aligned, slate/gray bubble, rounded
  - Each AI message shows a small tag: "via Concepts Agent" or "via Debug Agent" (the routing info)
  - Typing indicator: three animated dots when AI is thinking
- Message input at bottom: text field + send button (arrow icon)
- Subtle scroll with smooth auto-scroll to latest message

**Center Panel — Code Editor (width: ~50%)**
- Tab bar at top: "main.py" tab (closeable), "+" button for new files
- Monaco editor area:
  - Dark theme (One Dark Pro or similar)
  - Python syntax highlighting
  - Line numbers, bracket matching
  - Default starter code: `# Write your Python code here\nprint("Hello, LearnFlow!")`
- Toolbar below editor:
  - Green "▶ Run" button (primary action)
  - "Clear" button (secondary/ghost)
  - Execution status indicator: "Ready" / "Running..." / "Completed in 0.3s"
- Output terminal below toolbar:
  - Dark terminal look (black/near-black background, green/white monospace text)
  - Shows stdout or error messages
  - Scrollable if output is long
  - Clear distinction between stdout (white/green) and stderr (red/rose)

**Right Panel — Progress Dashboard (width: ~25%)**
- Student info card at top: Name, avatar, current module, overall mastery %
- Overall mastery: large circular progress ring (animated) with percentage in center
- Topic mastery list (8 topics from the Python curriculum):
  - Each topic: name + horizontal progress bar + percentage + level badge
  - Level badges with colors:
    - Beginner (0-40%): Rose/Red badge
    - Learning (41-70%): Amber/Yellow badge
    - Proficient (71-90%): Emerald/Green badge
    - Mastered (91-100%): Blue badge
  - Progress bars are colored to match their level
- "Load Demo Data" button for demo purposes
- Small stats row: "Streak: 5 days" | "Exercises: 23" | "Quiz Avg: 78%"

**NavBar:**
- Left: LearnFlow logo (simple wordmark or icon+text)
- Center: "Student Dashboard" breadcrumb
- Right: Student name ("Maya") + circular avatar + dark mode toggle (moon/sun icon)

---

#### PAGE 3: Teacher Dashboard

**Purpose:** Class monitoring, struggle alerts, exercise generation.

**Layout:** Single-column with card-based sections, generous spacing.

**NavBar:** Same style as student, but says "Teacher Dashboard" and shows teacher name ("Mr. Rodriguez").

**Section 1: Stats Overview (top row of 4 metric cards)**
- Card 1: "Total Students" → "24" with user icon
- Card 2: "Average Mastery" → "67%" with chart icon
- Card 3: "Active Now" → "12" with green dot
- Card 4: "Struggling" → "3" with red alert icon

Each card: white/slate surface, subtle shadow, icon on left, number large, label small.

**Section 2: Struggle Alerts (red/rose accent)**
- Section title: "⚠ Struggle Alerts" with a badge count (e.g., "3")
- List of alert cards, each showing:
  - Student name + avatar
  - What they're struggling with (e.g., "List Comprehensions — 3 failed attempts")
  - Time: "12 minutes ago"
  - Action buttons: "View Code" | "Send Help" | "Assign Exercise"
- Empty state: "No struggling students — great job! 🎉"
- Cards have a subtle red/rose left border accent

**Section 3: Class Progress (data table or grid)**
- Table or card grid showing all students:
  - Columns: Student Name | Current Module | Overall Mastery | Status | Topics
  - Each student's topics shown as small colored dots or mini badges
  - Status column: "On Track" (green) / "Needs Help" (amber) / "Struggling" (red)
  - Sortable by mastery, name, or status
  - Search/filter bar above the table

**Section 4: Exercise Generator (interactive card)**
- Card with heading: "Generate Exercises with AI"
- Text input (large): placeholder "e.g., list comprehensions for beginners"
- "Generate" button (emerald green, prominent)
- Generated exercise appears below in a styled code block with:
  - Exercise title
  - Description
  - Starter code (syntax highlighted)
  - Expected output
  - Difficulty badge
- "Assign to Class" button appears after generation

---

#### PAGE 4: Navigation / Sidebar (Optional — if using sidebar layout)

If using a sidebar instead of top nav:
- Collapsed by default on student page (to maximize workspace)
- Expanded on teacher page
- Items: Home, Dashboard, Progress, Settings
- Bottom: dark mode toggle, logout

---

#### PAGE 5: Login / Auth Page (Optional but recommended)

- Clean centered card layout
- LearnFlow logo at top
- Email + password fields
- "Sign In" button (blue)
- "Sign in as Student (Demo)" and "Sign in as Teacher (Demo)" quick buttons
- Subtle background pattern or gradient
- "Powered by LearnFlow AI" at bottom

---

### PYTHON CURRICULUM (for progress tracking display)

The 8 modules students learn, displayed in the progress panel:

| # | Module | Example Topics |
|---|--------|---------------|
| 1 | Basics | Variables, Data Types, I/O |
| 2 | Control Flow | if/elif/else, for/while loops |
| 3 | Data Structures | Lists, Tuples, Dicts, Sets |
| 4 | Functions | Parameters, Return, Scope |
| 5 | OOP | Classes, Inheritance |
| 6 | Files | Read/Write, CSV, JSON |
| 7 | Error Handling | Try/Except, Custom Exceptions |
| 8 | Libraries | pip, APIs, Virtual Envs |

---

### MASTERY LEVEL SYSTEM (color-coded)

| Level | Range | Color | Badge Style |
|-------|-------|-------|-------------|
| Beginner | 0-40% | Rose/Red (#F43F5E) | Solid badge |
| Learning | 41-70% | Amber (#F59E0B) | Solid badge |
| Proficient | 71-90% | Emerald (#10B981) | Solid badge |
| Mastered | 91-100% | Blue (#3B82F6) | Solid badge with ✓ |

---

### AI AGENT SYSTEM (shown in chat routing tags)

| Agent | When Shown | Tag Color |
|-------|-----------|-----------|
| Triage Agent | Routes all queries | Gray |
| Concepts Agent | Explaining Python concepts | Blue |
| Code Review Agent | Reviewing student code | Purple |
| Debug Agent | Helping with errors | Rose |
| Exercise Agent | Generating challenges | Emerald |
| Progress Agent | Showing progress summaries | Amber |

Each AI response in the chat should show a small colored tag indicating which agent responded.

---

### DEMO DATA (use in mockups)

**Student: Maya Chen**
- Current module: Module 3 — Data Structures
- Overall mastery: 64%
- Streak: 5 days
- Recent topics:
  - Variables: 92% (Mastered)
  - Data Types: 85% (Proficient)
  - Loops: 68% (Learning)
  - Lists: 45% (Learning)
  - Functions: 30% (Beginner)
  - OOP: 0% (Beginner)

**Teacher: Mr. Rodriguez**
- Class size: 24 students
- Average mastery: 67%
- Currently struggling: James (List Comprehensions), Sofia (Recursion), Alex (File I/O)

**Sample chat exchange:**
```
Maya: How do for loops work in Python?

AI (Concepts Agent): A for loop lets you iterate over a sequence...
[shows code example]

Maya: Can you give me an exercise?

AI (Exercise Agent): Sure! Write a for loop that prints...
```

---

### TECH STACK (for implementation context)

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (custom theme with design tokens)
- **Code Editor:** Monaco Editor (@monaco-editor/react)
- **Icons:** Lucide React or Heroicons
- **Charts/Progress:** Circular progress rings (CSS or lightweight library)
- **Font:** Inter (Google Fonts) or Geist (Vercel)
- **Dark mode:** Tailwind dark: variant with CSS variables

---

### WHAT I NEED FROM YOU

1. **Complete page designs** for all 5 pages listed above
2. **Component library** showing: buttons, cards, badges, inputs, chat bubbles, progress bars, navigation
3. **Color palette** and typography scale
4. **Dark mode** as the primary theme
5. **Responsive considerations** (desktop primary, tablet secondary)
6. **Production-ready code** if possible (Next.js + Tailwind CSS)

---

### REFERENCE MOOD BOARD

Design should feel like a blend of:
- **Linear.app** — clean, dark, minimal, professional
- **Vercel Dashboard** — sophisticated developer tool aesthetic
- **GitHub Education** — trusted, institutional
- **Notion** — clean typography and whitespace
- **Stripe Dashboard** — polished data presentation

NOT like: Colorful toy apps, gaming UIs, overly playful designs, Bootstrap defaults.

---

## PROMPT END
