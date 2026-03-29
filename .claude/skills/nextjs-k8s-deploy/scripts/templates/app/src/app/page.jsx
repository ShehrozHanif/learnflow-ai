"use client";
import { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// SHARED DATA & UTILS
// ══════════════════════════════════════════════════════════════════════════════
const AGENTS = {
  "Triage Agent":      { color:"#94A3B8", bg:"rgba(148,163,184,0.12)", border:"rgba(148,163,184,0.2)" },
  "Concepts Agent":    { color:"#60A5FA", bg:"rgba(96,165,250,0.12)",  border:"rgba(96,165,250,0.25)" },
  "Debug Agent":       { color:"#FB7185", bg:"rgba(251,113,133,0.12)", border:"rgba(251,113,133,0.25)" },
  "Exercise Agent":    { color:"#34D399", bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.25)" },
  "Code Review Agent": { color:"#C084FC", bg:"rgba(192,132,252,0.12)", border:"rgba(192,132,252,0.25)" },
  "Progress Agent":    { color:"#FBBF24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.25)" },
};
const INIT_MSGS = [
  { id:1, role:"ai",   agent:"Triage Agent",  text:"Hi Maya! 👋 I'm your AI tutor. What would you like to work on today?" },
  { id:2, role:"user",                         text:"How do for loops work in Python?" },
  { id:3, role:"ai",   agent:"Concepts Agent", text:"A `for` loop iterates over any sequence.\n\nBasic syntax:\n```python\nfor item in collection:\n    print(item)\n```\nWith range:\n```python\nfor i in range(5):\n    print(i)  # 0,1,2,3,4\n```\nWant a practice exercise?" },
  { id:4, role:"user",                         text:"Yes please!" },
  { id:5, role:"ai",   agent:"Exercise Agent", text:"Write a `for` loop through `[3, 7, 2, 9, 1]` and print only numbers **greater than 4**.\n\nExpected:\n```\n7\n9\n```\nTry it in the Code tab!" },
];
const TOPICS = [
  { name:"Variables",      pct:92, level:"Mastered" },
  { name:"Data Types",     pct:85, level:"Proficient" },
  { name:"Loops",          pct:68, level:"Learning" },
  { name:"Lists",          pct:45, level:"Learning" },
  { name:"Functions",      pct:30, level:"Beginner" },
  { name:"OOP",            pct:0,  level:"Beginner" },
  { name:"Error Handling", pct:0,  level:"Beginner" },
  { name:"Libraries",      pct:0,  level:"Beginner" },
];
const LEVEL = {
  Mastered:   { color:"#60A5FA", bg:"rgba(96,165,250,0.12)",  border:"rgba(96,165,250,0.25)",  bar:"#3B82F6", label:"✓ Mastered" },
  Proficient: { color:"#34D399", bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.25)",  bar:"#10B981", label:"Proficient" },
  Learning:   { color:"#FBBF24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.25)",  bar:"#F59E0B", label:"Learning" },
  Beginner:   { color:"#FB7185", bg:"rgba(251,113,133,0.12)", border:"rgba(251,113,133,0.25)", bar:"#F43F5E", label:"Beginner" },
};
const STARTER = `# Write your Python code here\nprint("Hello, LearnFlow!")\n\n# Exercise: print numbers > 4\nnumbers = [3, 7, 2, 9, 1]\nfor n in numbers:\n    if n > 4:\n        print(n)\n`;
const ALERTS = [
  { id:1, name:"James Park",    initials:"JP", color:"#3B82F6", topic:"List Comprehensions", attempts:3, time:"12 min ago" },
  { id:2, name:"Sofia Alvarez", initials:"SA", color:"#8B5CF6", topic:"Recursion",            attempts:5, time:"24 min ago" },
  { id:3, name:"Alex Kim",      initials:"AK", color:"#F59E0B", topic:"File I/O",             attempts:2, time:"41 min ago" },
];
const STUDENTS = [
  { id:1, name:"Maya Chen",    initials:"MC", color:"#3B82F6", module:"Data Structures", mastery:64, status:"On Track",   active:true  },
  { id:2, name:"James Park",   initials:"JP", color:"#6366F1", module:"Control Flow",    mastery:31, status:"Struggling", active:true  },
  { id:3, name:"Sofia Alvarez",initials:"SA", color:"#8B5CF6", module:"Functions",       mastery:48, status:"Needs Help", active:false },
  { id:4, name:"Alex Kim",     initials:"AK", color:"#F59E0B", module:"Files",           mastery:39, status:"Struggling", active:true  },
  { id:5, name:"Priya Singh",  initials:"PS", color:"#10B981", module:"OOP",             mastery:82, status:"On Track",   active:true  },
  { id:6, name:"Luca Romano",  initials:"LR", color:"#F43F5E", module:"Libraries",       mastery:91, status:"On Track",   active:false },
  { id:7, name:"Aisha Diallo", initials:"AD", color:"#60A5FA", module:"Error Handling",  mastery:73, status:"On Track",   active:true  },
  { id:8, name:"Tom Walker",   initials:"TW", color:"#34D399", module:"Basics",          mastery:55, status:"Needs Help", active:true  },
];
const STATUS_STYLE = {
  "On Track":   { color:"#34D399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.2)"  },
  "Needs Help": { color:"#FBBF24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.2)"  },
  "Struggling": { color:"#FB7185", bg:"rgba(251,113,133,0.1)", border:"rgba(251,113,133,0.2)" },
};
const GENERATED_EX = {
  title:"List Comprehension Challenge", difficulty:"Intermediate",
  starter:`# Rewrite using list comprehensions\nnumbers = [1, 2, 3, 4, 5]\nsquares = []   # → list comprehension\nevens   = []   # → list comprehension\nprint(squares) # [1, 4, 9, 16, 25]\nprint(evens)   # [2, 4]`,
  expected:"[1, 4, 9, 16, 25]\n[2, 4]",
};

function hl(line) {
  let h = line.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  h = h.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, m=>`<span style="color:#98C379">${m}</span>`);
  h = h.replace(/\b(for|in|if|else|elif|while|def|class|return|import|from|print|True|False|None|and|or|not|pass|break|continue)\b/g, m=>`<span style="color:#C678DD">${m}</span>`);
  h = h.replace(/\b(\d+)\b/g, m=>`<span style="color:#D19A66">${m}</span>`);
  h = h.replace(/(#.*)$/, m=>`<span style="color:#5C6370;font-style:italic">${m}</span>`);
  return h;
}
function Avatar({ initials, color, size=30 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}22`, border:`1.5px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:700, color, flexShrink:0 }}>{initials}</div>;
}
function Toast({ message, type="error", onClose }) {
  const colors = { error:{ bg:"rgba(244,63,94,0.12)", border:"rgba(244,63,94,0.25)", text:"#FB7185" }, success:{ bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.25)", text:"#34D399" }, info:{ bg:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.25)", text:"#60A5FA" } };
  const c=colors[type]||colors.error;
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[onClose]);
  return <div style={{position:"fixed",top:14,right:14,zIndex:9999,padding:"10px 16px",borderRadius:10,background:c.bg,border:`1px solid ${c.border}`,color:c.text,fontSize:13,fontWeight:500,maxWidth:340,animation:"fadein 0.2s ease",boxShadow:"0 8px 24px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:8}}>
    <span style={{flex:1}}>{message}</span>
    <button onClick={onClose} style={{background:"transparent",border:"none",color:c.text,cursor:"pointer",fontSize:14,padding:0}}>×</button>
  </div>;
}
function LoadingSpinner({size=24,color="#3B82F6"}) {
  return <div style={{width:size,height:size,border:`2.5px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>;
}
function useLocalStorage(key,initial) {
  const [val,setVal]=useState(()=>{if(typeof window==="undefined")return initial;try{const s=localStorage.getItem(key);return s!==null?JSON.parse(s):initial;}catch{return initial;}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(val));}catch{}},[key,val]);
  return [val,setVal];
}
function Badge({ label, style:s }) {
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{label}</span>;
}
function Ring({ pct, size=110, stroke=8 }) {
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(pct/100)*c} ${c}`}/>
      <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
const floatingSymbols = [
  { char:"def",     style:{ top:"12%", left:"4%",   fontSize:"1.1rem", transform:"rotate(-15deg)" } },
  { char:"[]",      style:{ top:"25%", left:"8%",   fontSize:"1.4rem", transform:"rotate(10deg)"  } },
  { char:"λ",       style:{ top:"60%", left:"3%",   fontSize:"2rem",   transform:"rotate(-5deg)"  } },
  { char:"for i in",style:{ top:"75%", left:"6%",   fontSize:"0.9rem", transform:"rotate(8deg)"   } },
  { char:"{}",      style:{ top:"40%", left:"2%",   fontSize:"1.6rem", transform:"rotate(-20deg)" } },
  { char:"import",  style:{ top:"88%", left:"5%",   fontSize:"1rem",   transform:"rotate(12deg)"  } },
  { char:"print()", style:{ top:"8%",  right:"5%",  fontSize:"1rem",   transform:"rotate(10deg)"  } },
  { char:"class",   style:{ top:"22%", right:"3%",  fontSize:"1.1rem", transform:"rotate(-8deg)"  } },
  { char:"→",       style:{ top:"45%", right:"4%",  fontSize:"1.8rem", transform:"rotate(5deg)"   } },
  { char:"True",    style:{ top:"65%", right:"6%",  fontSize:"1rem",   transform:"rotate(-12deg)" } },
  { char:"//",      style:{ top:"80%", right:"4%",  fontSize:"1.4rem", transform:"rotate(15deg)"  } },
  { char:"≡",       style:{ top:"90%", right:"8%",  fontSize:"1.6rem", transform:"rotate(-6deg)"  } },
];
const FEATURES = [
  { accent:"#3B82F6", accentBg:"rgba(59,130,246,0.12)",  label:"AI Tutoring Agents",    desc:"6 specialized agents that adapt to your level — from concept explainers to live debuggers.", icon:"🤖" },
  { accent:"#8B5CF6", accentBg:"rgba(139,92,246,0.12)",  label:"Live Code Editor",       desc:"Write, run, and debug Python directly in your browser with syntax highlighting and instant output.", icon:"💻" },
  { accent:"#10B981", accentBg:"rgba(16,185,129,0.12)",  label:"Smart Progress Tracking",desc:"Mastery scores across 8 Python modules with visual progress rings and level badges.", icon:"📊" },
  { accent:"#F59E0B", accentBg:"rgba(245,158,11,0.12)",  label:"Struggle Detection",     desc:"Teachers get real-time alerts the moment a student is stuck — before they give up.", icon:"🔔" },
];
const MODULES = [
  { n:"01", label:"Basics",          sub:"Variables & I/O",        topics:["Variables","Data Types","Input/Output","Operators","String Formatting"], projects:["Calculator App","Greeting Generator"], lessons:5, quizzes:3, exercises:2, time:"2 hours" },
  { n:"02", label:"Control Flow",    sub:"Loops & Conditions",     topics:["if/elif/else","for Loops","while Loops","break/continue","Nested Conditions"], projects:["Number Guessing Game","FizzBuzz"], lessons:6, quizzes:3, exercises:3, time:"2.5 hours" },
  { n:"03", label:"Data Structures", sub:"Lists, Dicts, Sets",     topics:["Lists","Tuples","Dictionaries","Sets","List Comprehensions"], projects:["Contact Book","Word Counter"], lessons:6, quizzes:4, exercises:3, time:"3 hours" },
  { n:"04", label:"Functions",       sub:"Scope & Return",         topics:["Defining Functions","Parameters & Arguments","Return Values","Scope","Lambda Functions"], projects:["Math Toolkit","Password Generator"], lessons:5, quizzes:3, exercises:2, time:"2 hours" },
  { n:"05", label:"OOP",             sub:"Classes & Inheritance",  topics:["Classes","Objects","Inheritance","Encapsulation","Polymorphism"], projects:["Bank Account System","Animal Hierarchy"], lessons:7, quizzes:4, exercises:3, time:"3.5 hours" },
  { n:"06", label:"Files",           sub:"CSV & JSON",             topics:["Reading Files","Writing Files","CSV Processing","JSON Handling","File Paths"], projects:["Log Analyzer","Data Converter"], lessons:5, quizzes:3, exercises:2, time:"2 hours" },
  { n:"07", label:"Error Handling",  sub:"Try/Except",             topics:["try/except","Exception Types","Custom Exceptions","finally Block","Debugging Tips"], projects:["Input Validator","Safe Calculator"], lessons:4, quizzes:2, exercises:2, time:"1.5 hours" },
  { n:"08", label:"Libraries",       sub:"pip & APIs",             topics:["pip Install","Popular Libraries","API Requests","JSON APIs","Virtual Environments"], projects:["Weather App","API Dashboard"], lessons:5, quizzes:3, exercises:2, time:"2.5 hours" },
];

function FeatureModal({ feature, onClose }) {
  const modalContent = {
    "AI Tutoring Agents": {
      title: "6 Specialized AI Agents",
      sections: [
        { icon: "🎯", name: "Triage Agent", desc: "Analyzes your question and routes it to the best specialist. Uses NLP to understand intent — concepts, debugging, exercises, or code review." },
        { icon: "📖", name: "Concepts Agent", desc: "Explains Python topics with clear examples and analogies. Adapts explanations to your current mastery level." },
        { icon: "🔍", name: "Code Review Agent", desc: "Reviews your code for quality, best practices, and potential bugs. Provides actionable improvement suggestions." },
        { icon: "🐛", name: "Debug Agent", desc: "Helps you understand and fix errors. Walks through your code step-by-step to find the root cause." },
        { icon: "💪", name: "Exercise Agent", desc: "Creates practice challenges tailored to your level. Generates unique problems for topics you need to strengthen." },
        { icon: "📈", name: "Progress Agent", desc: "Tracks your learning journey across all topics. Identifies strengths, weaknesses, and recommends what to study next." },
      ]
    },
    "Live Code Editor": {
      title: "Write & Run Python in Your Browser",
      sections: [
        { icon: "⚡", name: "Instant Execution", desc: "Run Python code directly in the browser with real-time output. No setup, no installation required." },
        { icon: "🎨", name: "Syntax Highlighting", desc: "Monaco editor (same as VS Code) with full Python syntax highlighting and auto-completion." },
        { icon: "🔒", name: "Secure Sandbox", desc: "Code runs in an isolated sandbox with 5-second timeout and memory limits. Safe for experimentation." },
        { icon: "📊", name: "Execution Tracking", desc: "Every code run is tracked — success rate, streak, and consecutive failures feed into your progress score." },
      ]
    },
    "Smart Progress Tracking": {
      title: "Mastery-Based Learning System",
      sections: [
        { icon: "🔴", name: "Beginner (0-40%)", desc: "Just getting started. Focus on completing exercises and understanding core concepts." },
        { icon: "🟡", name: "Learning (41-70%)", desc: "Building momentum. Keep practicing with quizzes and coding challenges to strengthen understanding." },
        { icon: "🟢", name: "Proficient (71-90%)", desc: "Strong grasp of the topic. Polish your skills with advanced exercises and code quality improvements." },
        { icon: "🔵", name: "Mastered (91-100%)", desc: "Expert level achieved! Maintain your streak and help others while exploring advanced patterns." },
      ],
      formula: true
    },
    "Struggle Detection": {
      title: "Real-Time Student Support",
      sections: [
        { icon: "🔁", name: "Repeated Errors", desc: "5+ consecutive code failures trigger an alert. The system detects when a student is stuck in a loop." },
        { icon: "😤", name: "Frustration Detection", desc: "NLP analyzes chat messages for signs of frustration. Proactive support before the student gives up." },
        { icon: "📉", name: "Low Quiz Scores", desc: "Quiz scores below 50% generate an alert. Teachers can assign targeted exercises to address gaps." },
        { icon: "⏰", name: "Time-Based Detection", desc: "3+ errors within 10 minutes suggests the student is stuck. Periodic checks catch struggling students early." },
      ]
    }
  };
  const content = modalContent[feature.label];
  if (!content) return null;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadein 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0F172A",border:`1px solid ${feature.accent}35`,borderRadius:18,padding:"28px 24px",maxWidth:520,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:`0 24px 64px -16px rgba(0,0,0,0.6),0 0 0 1px ${feature.accent}20`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:feature.accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{feature.icon}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{content.title}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{feature.label}</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"1px solid rgba(148,163,184,0.1)",background:"rgba(30,41,59,0.6)",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>x</button>
        </div>
        <div style={{display:"grid",gap:8}}>
          {content.sections.map((s,i) => (
            <div key={i} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0,marginTop:2}}>{s.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0",marginBottom:3}}>{s.name}</div>
                <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.6}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        {content.formula && (
          <div style={{marginTop:14,background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",marginBottom:8}}>Mastery Formula</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[{l:"Exercises",w:"40%",c:"#3B82F6"},{l:"Quizzes",w:"30%",c:"#8B5CF6"},{l:"Code Quality",w:"20%",c:"#10B981"},{l:"Streak",w:"10%",c:"#F59E0B"}].map(m=>(
                <div key={m.l} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:99,background:m.c}}/>
                  <span style={{fontSize:11,color:"#94A3B8"}}>{m.l}: <span style={{fontWeight:700,color:m.c}}>{m.w}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={onClose} style={{marginTop:16,width:"100%",padding:"10px",borderRadius:10,border:"none",background:`${feature.accent}20`,color:feature.accent,fontWeight:600,fontSize:13,cursor:"pointer"}}>Got it</button>
      </div>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  const [hovered, setHovered] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", minHeight:"100vh", background:"#0F172A", color:"#E2E8F0", overflowX:"hidden", position:"relative" }}>

      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:700, height:700, top:"-20%", left:"30%", borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", width:500, height:500, top:"50%", right:"-10%", borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", width:400, height:400, bottom:"10%", left:"5%", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"linear-gradient(rgba(148,163,184,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.4) 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>
      </div>

      {/* Floating code symbols — hidden on mobile */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        {floatingSymbols.map((s,i)=>(
          <span key={i} style={{ position:"absolute", fontFamily:"monospace", color:"rgba(96,165,250,0.08)", userSelect:"none", fontSize:"1rem", ...s.style }}>
            {s.char}
          </span>
        ))}
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"relative", zIndex:20, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:58, background:"rgba(15,23,42,0.8)", borderBottom:"1px solid rgba(148,163,184,0.08)", backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#3B82F6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>LearnFlow</span>
        </div>

        {/* desktop nav */}
        <div style={{ display:"flex", alignItems:"center", gap:24, fontSize:13, color:"#94A3B8" }} className="lf-hide-mobile">
          {["Features","Curriculum","For Teachers","Pricing"].map(item=>(
            <a key={item} href="#" style={{ color:"#94A3B8", textDecoration:"none", transition:"color 0.15s" }}
              onMouseEnter={e=>e.target.style.color="#E2E8F0"} onMouseLeave={e=>e.target.style.color="#94A3B8"}>{item}</a>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={()=>onNavigate("login")} style={{ fontSize:13, fontWeight:500, padding:"7px 14px", borderRadius:8, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", color:"#93C5FD", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(59,130,246,0.22)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(59,130,246,0.12)"; }}>
            Sign In
          </button>
          {/* mobile hamburger */}
          <button onClick={()=>setMobileMenu(v=>!v)} className="lf-show-mobile" style={{ background:"rgba(30,41,59,0.7)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:7, padding:"6px 7px", color:"#94A3B8", cursor:"pointer", display:"none", alignItems:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {mobileMenu && (
        <div style={{ position:"relative", zIndex:20, background:"rgba(15,23,42,0.99)", borderBottom:"1px solid rgba(148,163,184,0.08)", padding:"10px 16px 14px" }}>
          {["Features","Curriculum","For Teachers","Pricing"].map(item=>(
            <div key={item} style={{ padding:"10px 4px", fontSize:14, color:"#94A3B8", borderBottom:"1px solid rgba(148,163,184,0.05)" }}>{item}</div>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"80px 20px 64px" }}>
        {/* eyebrow */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:28, padding:"6px 16px", borderRadius:99, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", color:"#93C5FD" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#60A5FA", display:"inline-block", animation:"pulse2 2s ease-in-out infinite" }}/>
          AI-Powered Python Education
        </div>

        {/* headline */}
        <h1 style={{ fontSize:"clamp(2.4rem,7vw,4.5rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.05, marginBottom:20, color:"white" }}>
          Master Python<br/>
          <span style={{ background:"linear-gradient(90deg,#3B82F6 0%,#818CF8 50%,#A78BFA 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            with AI
          </span>
        </h1>

        <p style={{ fontSize:"clamp(0.95rem,2.5vw,1.15rem)", color:"#94A3B8", maxWidth:520, marginBottom:44, lineHeight:1.7 }}>
          Six specialized AI tutors. A live code editor. Real-time progress tracking.
          Everything you need to go from zero to proficient.
        </p>

        {/* CTA cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:460 }} className="lf-cta-row">
          {/* Student */}
          <button
            onClick={()=>onNavigate("login")}
            style={{ flex:1, padding:"18px 22px", borderRadius:14, border:"none", textAlign:"left", cursor:"pointer", transition:"all 0.25s",
              background: hovered==="student" ? "linear-gradient(135deg,#2563EB,#3B82F6)" : "linear-gradient(135deg,#1D4ED8,#2563EB)",
              boxShadow: hovered==="student" ? "0 20px 40px -12px rgba(59,130,246,0.5),0 0 0 1px rgba(59,130,246,0.4)" : "0 8px 24px -8px rgba(59,130,246,0.3),0 0 0 1px rgba(59,130,246,0.2)",
              transform: hovered==="student" ? "translateY(-2px)" : "translateY(0)",
            }}
            onMouseEnter={()=>setHovered("student")} onMouseLeave={()=>setHovered(null)}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(191,219,254,0.7)" }}>Student</span>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{width:14,height:14,color:"rgba(191,219,254,0.6)",transform:hovered==="student"?"translateX(3px)":"none",transition:"transform 0.2s"}}><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:3 }}>I'm a Student</div>
            <div style={{ fontSize:12, color:"rgba(219,234,254,0.65)" }}>Start learning with your AI tutor</div>
          </button>

          {/* Teacher */}
          <button
            onClick={()=>onNavigate("login")}
            style={{ flex:1, padding:"18px 22px", borderRadius:14, border:"none", textAlign:"left", cursor:"pointer", transition:"all 0.25s",
              background: hovered==="teacher" ? "linear-gradient(135deg,#059669,#10B981)" : "linear-gradient(135deg,#047857,#059669)",
              boxShadow: hovered==="teacher" ? "0 20px 40px -12px rgba(16,185,129,0.5),0 0 0 1px rgba(16,185,129,0.4)" : "0 8px 24px -8px rgba(16,185,129,0.3),0 0 0 1px rgba(16,185,129,0.2)",
              transform: hovered==="teacher" ? "translateY(-2px)" : "translateY(0)",
            }}
            onMouseEnter={()=>setHovered("teacher")} onMouseLeave={()=>setHovered(null)}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(167,243,208,0.7)" }}>Teacher</span>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{width:14,height:14,color:"rgba(167,243,208,0.6)",transform:hovered==="teacher"?"translateX(3px)":"none",transition:"transform 0.2s"}}><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:3 }}>I'm a Teacher</div>
            <div style={{ fontSize:12, color:"rgba(167,243,208,0.65)" }}>Monitor your class in real-time</div>
          </button>
        </div>

        <p style={{ marginTop:20, fontSize:11, color:"#334155", letterSpacing:"0.04em" }}>
          Trusted by 2,400+ students across 18 universities
        </p>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position:"relative", zIndex:10, padding:"0 20px 72px", maxWidth:1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569", marginBottom:10 }}>Platform</p>
          <h2 style={{ fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:800, color:"white", letterSpacing:"-0.02em" }}>Everything you need to learn Python</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} onClick={()=>setActiveFeature(f)} style={{ background:"rgba(15,23,42,0.6)", border:`1px solid ${f.accent}25`, borderRadius:14, padding:"22px 20px", backdropFilter:"blur(12px)", transition:"all 0.2s", cursor:"pointer" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor=`${f.accent}45`; e.currentTarget.style.boxShadow=`0 12px 32px -8px rgba(0,0,0,0.4)`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=`${f.accent}25`; e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ width:40, height:40, borderRadius:10, background:f.accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:7 }}>{f.label}</h3>
              <p style={{ fontSize:12, color:"#64748B", lineHeight:1.65 }}>{f.desc}</p>
              <div style={{ marginTop:10, fontSize:10, fontWeight:600, color:f.accent, display:"flex", alignItems:"center", gap:4 }}>Learn more <span style={{fontSize:12}}>→</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section style={{ position:"relative", zIndex:10, padding:"0 20px 72px", maxWidth:860, margin:"0 auto" }}>
        <div style={{ background:"rgba(15,23,42,0.7)", border:"1px solid rgba(148,163,184,0.08)", borderRadius:20, padding:"28px 24px", backdropFilter:"blur(16px)" }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:24 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569", marginBottom:6 }}>Curriculum</p>
              <h2 style={{ fontSize:"clamp(1.2rem,3vw,1.6rem)", fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>8 Modules. One clear path.</h2>
            </div>
            <span style={{ fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:99, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", color:"#93C5FD" }}>Structured progression</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
            {MODULES.map(m=>(
              <div key={m.n} onClick={()=>setActiveModule(m)} style={{ background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.06)", borderRadius:10, padding:"11px 13px", transition:"all 0.18s", cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(59,130,246,0.25)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(148,163,184,0.06)";e.currentTarget.style.transform="translateY(0)";}}
              >
                <span style={{ fontSize:10, fontFamily:"monospace", color:"rgba(59,130,246,0.5)", display:"block", marginBottom:3 }}>{m.n}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", display:"block", lineHeight:1.3 }}>{m.label}</span>
                <span style={{ fontSize:11, color:"#475569" }}>{m.sub}</span>
                <div style={{ marginTop:6, display:"flex", gap:8, fontSize:9, color:"#475569" }}>
                  <span>{m.lessons} lessons</span><span>·</span><span>{m.quizzes} quizzes</span><span>·</span><span>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position:"relative", zIndex:10, textAlign:"center", padding:"24px 20px 32px", borderTop:"1px solid rgba(148,163,184,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginBottom:6 }}>
          <div style={{ width:20, height:20, borderRadius:5, background:"linear-gradient(135deg,#3B82F6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{width:11,height:11}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:"#CBD5E1" }}>LearnFlow</span>
        </div>
        <p style={{ fontSize:11, color:"#334155" }}>Powered by LearnFlow AI &nbsp;•&nbsp; Built with Claude Code &amp; Goose</p>
      </footer>

      {activeFeature && <FeatureModal feature={activeFeature} onClose={()=>setActiveFeature(null)}/>}

      {activeModule && (
        <div onClick={()=>setActiveModule(null)} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadein 0.2s ease"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0F172A",border:"1px solid rgba(59,130,246,0.2)",borderRadius:18,padding:"28px 24px",maxWidth:480,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 24px 64px -16px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(59,130,246,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,fontFamily:"monospace",color:"#60A5FA"}}>{activeModule.n}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{activeModule.label}</div>
                  <div style={{fontSize:11,color:"#64748B"}}>{activeModule.sub}</div>
                </div>
              </div>
              <button onClick={()=>setActiveModule(null)} style={{width:30,height:30,borderRadius:8,border:"1px solid rgba(148,163,184,0.1)",background:"rgba(30,41,59,0.6)",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>x</button>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
              {[{v:activeModule.lessons,l:"Lessons",c:"#3B82F6"},{v:activeModule.quizzes,l:"Quizzes",c:"#8B5CF6"},{v:activeModule.exercises,l:"Exercises",c:"#10B981"},{v:activeModule.time,l:"Est. Time",c:"#F59E0B"}].map(s=>(
                <div key={s.l} style={{background:"rgba(30,41,59,0.5)",borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,fontWeight:600,color:"#64748B",textTransform:"uppercase",marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Topics */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Topics Covered</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {activeModule.topics.map(t=>(
                  <span key={t} style={{fontSize:11,fontWeight:500,padding:"4px 10px",borderRadius:99,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.15)",color:"#93C5FD"}}>{t}</span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Hands-On Projects</div>
              <div style={{display:"grid",gap:6}}>
                {activeModule.projects.map(p=>(
                  <div key={p} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:8,padding:"10px 12px"}}>
                    <span style={{fontSize:14}}>🛠️</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0"}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={()=>{setActiveModule(null);onNavigate("login");}} style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1D4ED8,#2563EB)",color:"white",fontWeight:600,fontSize:13,cursor:"pointer",transition:"opacity 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              Start Learning {activeModule.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin, onDemoLogin, onBack }) {
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [name, setName]       = useState("");
  const [regRole, setRegRole] = useState("student");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(null);
  const [err, setErr]         = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const demoLogin = (role) => {
    setLoading(role); setErr("");
    setTimeout(() => { setLoading(null); onDemoLogin(role); }, 600);
  };
  const submit = async () => {
    if (isRegister && !name.trim()) { setErr("Please enter your name."); return; }
    if (!email.trim() || !pw.trim()) { setErr("Please enter your email and password."); return; }
    if (isRegister && pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading("auth"); setErr("");
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister ? { name, email, password: pw, role: regRole } : { email, password: pw };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong"); setLoading(null); return; }
      setLoading(null);
      onLogin(data.user, data.token);
    } catch { setErr("Network error. Please try again."); setLoading(null); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:"60vw", height:"60vw", maxWidth:500, top:"-15%", left:"25%", borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", width:"40vw", height:"40vw", maxWidth:400, bottom:"5%", right:"5%", borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"linear-gradient(rgba(148,163,184,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.5) 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>
      </div>

      {/* back to landing */}
      <button onClick={onBack} style={{ position:"absolute", top:16, left:16, display:"flex", alignItems:"center", gap:6, background:"rgba(30,41,59,0.7)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:8, padding:"7px 12px", color:"#94A3B8", cursor:"pointer", fontSize:12, fontWeight:500, zIndex:10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
        Back
      </button>

      <div style={{ width:"100%", maxWidth:380, position:"relative", zIndex:1, animation:"fadein 0.3s ease" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28 }}>
          <div style={{ width:44, height:44, borderRadius:13, background:"linear-gradient(135deg,#3B82F6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, boxShadow:"0 8px 24px rgba(59,130,246,0.3)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{width:20,height:20}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontSize:20, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>LearnFlow</span>
          <span style={{ fontSize:12, color:"#475569", marginTop:3 }}>AI-Powered Python Education</span>
        </div>

        <div style={{ background:"rgba(30,41,59,0.65)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:18, padding:"24px 22px", backdropFilter:"blur(16px)", boxShadow:"0 24px 48px rgba(0,0,0,0.4)" }}>
          <h1 style={{ fontSize:17, fontWeight:700, color:"#F1F5F9", marginBottom:3, textAlign:"center" }}>{isRegister ? "Create Account" : "Welcome back"}</h1>
          <p style={{ fontSize:12, color:"#64748B", textAlign:"center", marginBottom:22 }}>{isRegister ? "Join LearnFlow today" : "Sign in to continue learning"}</p>

          {err && <div style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:9, padding:"9px 13px", fontSize:12, color:"#FB7185", marginBottom:14, textAlign:"center" }}>{err}</div>}

          {isRegister && (
            <>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 }}>Full Name</label>
                <div style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:10, padding:"10px 12px" }}
                  onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(59,130,246,0.4)"}
                  onBlurCapture={e=>e.currentTarget.style.borderColor="rgba(148,163,184,0.1)"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" style={{width:15,height:15,flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                  <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Your full name" style={{ flex:1, background:"transparent", border:"none", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", minWidth:0 }}/>
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 }}>I am a</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <button onClick={()=>setRegRole("student")} style={{ padding:"8px", borderRadius:8, border:`1px solid ${regRole==="student"?"rgba(59,130,246,0.5)":"rgba(148,163,184,0.1)"}`, background:regRole==="student"?"rgba(59,130,246,0.15)":"rgba(15,23,42,0.6)", color:regRole==="student"?"#60A5FA":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>Student</button>
                  <button onClick={()=>setRegRole("teacher")} style={{ padding:"8px", borderRadius:8, border:`1px solid ${regRole==="teacher"?"rgba(16,185,129,0.5)":"rgba(148,163,184,0.1)"}`, background:regRole==="teacher"?"rgba(16,185,129,0.15)":"rgba(15,23,42,0.6)", color:regRole==="teacher"?"#34D399":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>Teacher</button>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 }}>Email</label>
            <div style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:10, padding:"10px 12px" }}
              onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(59,130,246,0.4)"}
              onBlurCapture={e=>e.currentTarget.style.borderColor="rgba(148,163,184,0.1)"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" style={{width:15,height:15,flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@university.edu" style={{ flex:1, background:"transparent", border:"none", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", minWidth:0 }}/>
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <label style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", textTransform:"uppercase" }}>Password</label>
              <button style={{ fontSize:11, color:"#3B82F6", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Forgot?</button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:10, padding:"10px 12px" }}
              onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(59,130,246,0.4)"}
              onBlurCapture={e=>e.currentTarget.style.borderColor="rgba(148,163,184,0.1)"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" style={{width:15,height:15,flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
              <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?"text":"password"} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} style={{ flex:1, background:"transparent", border:"none", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", minWidth:0 }}/>
              <button onClick={()=>setShowPw(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", color:"#475569", display:"flex", padding:2, flexShrink:0 }}>
                {showPw
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:15,height:15}}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:15,height:15}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                }
              </button>
            </div>
          </div>

          <button onClick={submit} disabled={!!loading} style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", background:loading?"rgba(59,130,246,0.25)":"linear-gradient(135deg,#2563EB,#3B82F6)", color:"white", fontSize:14, fontWeight:600, cursor:loading?"default":"pointer", boxShadow:loading?"none":"0 4px 16px rgba(59,130,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
            {loading==="auth" ? <><span style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.35)",borderTopColor:"white",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>{isRegister?"Creating account...":"Signing in..."}</> : isRegister?"Create Account":"Sign In"}
          </button>

          <button onClick={()=>{setIsRegister(v=>!v);setErr("");}} style={{ width:"100%", background:"none", border:"none", color:"#3B82F6", fontSize:12, cursor:"pointer", padding:"6px", fontFamily:"inherit", marginBottom:14 }}>
            {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"rgba(148,163,184,0.08)" }}/>
            <span style={{ fontSize:11, color:"#334155", whiteSpace:"nowrap" }}>or try demo</span>
            <div style={{ flex:1, height:1, background:"rgba(148,163,184,0.08)" }}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <button onClick={()=>demoLogin("student")} disabled={!!loading}
              style={{ padding:"10px 6px", borderRadius:10, border:"1px solid rgba(59,130,246,0.25)", background:"rgba(59,130,246,0.1)", color:"#60A5FA", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(59,130,246,0.1)"}
            >
              {loading==="student"?<span style={{width:12,height:12,border:"2px solid #60A5FA",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>:"🎓"} Student Demo
            </button>
            <button onClick={()=>demoLogin("teacher")} disabled={!!loading}
              style={{ padding:"10px 6px", borderRadius:10, border:"1px solid rgba(16,185,129,0.25)", background:"rgba(16,185,129,0.1)", color:"#34D399", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(16,185,129,0.1)"}
            >
              {loading==="teacher"?<span style={{width:12,height:12,border:"2px solid #34D399",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>:"👨‍🏫"} Teacher Demo
            </button>
          </div>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:"#2D3748", marginTop:18 }}>Powered by LearnFlow AI · Built with Claude Code &amp; Goose</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:"dashboard",    label:"Dashboard",    emoji:"⊞" },
  { id:"learn",        label:"Learn",        emoji:"📚", studentOnly:true },
  { id:"snippets",     label:"Snippets",     emoji:"📌", studentOnly:true },
  { id:"history",      label:"Chat History", emoji:"🗂️", studentOnly:true },
  { id:"teachers",     label:"Teachers",     emoji:"👨‍🏫", studentOnly:true },
  { id:"leaderboard",  label:"Leaderboard",  emoji:"🏆" },
  { id:"progress",     label:"Progress",     emoji:"📈" },
  { id:"settings",     label:"Settings",     emoji:"⚙️" },
];
function Sidebar({ expanded, setExpanded, activePage, setActivePage, role, user, onLogout, isMobile, onClose, theme }) {
  const accent = role==="teacher"?"#10B981":"#3B82F6";
  const grad   = role==="teacher"?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#3B82F6,#6366F1)";
  return (
    <>
      {isMobile && expanded && <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:25, backdropFilter:"blur(2px)" }}/>}
      <div style={{ position:isMobile?"fixed":"relative", top:0, left:isMobile?(expanded?0:-240):"auto", height:isMobile?"100vh":"100%", width:isMobile?220:(expanded?210:56), background:"var(--lf-sidebar)", borderRight:"1px solid var(--lf-border)", display:"flex", flexDirection:"column", transition:isMobile?"left 0.25s cubic-bezier(.4,0,.2,1)":"width 0.25s cubic-bezier(.4,0,.2,1), background 0.3s", overflow:"hidden", flexShrink:0, zIndex:30 }}>
        <div style={{ height:50, display:"flex", alignItems:"center", padding:"0 13px", borderBottom:"1px solid var(--lf-border)", gap:8, flexShrink:0 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:grad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{width:12,height:12}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          {(expanded||isMobile) && <span style={{ fontSize:14, fontWeight:700, color:"var(--lf-text)", whiteSpace:"nowrap" }}>LearnFlow</span>}
        </div>
        {(expanded||isMobile) && (
          <div style={{ margin:"10px 8px 4px", padding:"9px 11px", background:"var(--lf-surface2)", border:"1px solid var(--lf-border)", borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"white", flexShrink:0 }}>{user?.name?user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():role==="teacher"?"T":"S"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--lf-text2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name||"User"}</div>
              <div style={{ fontSize:10, color:accent, fontWeight:500, textTransform:"capitalize" }}>{role}</div>
            </div>
          </div>
        )}
        <nav style={{ flex:1, padding:"8px", display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_ITEMS.filter(n=>!n.studentOnly||role==="student").map(n=>{
            const active=activePage===n.id;
            return <button key={n.id} onClick={()=>{ setActivePage(n.id); if(isMobile) onClose(); }} style={{ display:"flex", alignItems:"center", gap:9, padding:(expanded||isMobile)?"8px 11px":"8px", justifyContent:(expanded||isMobile)?"flex-start":"center", borderRadius:8, border:"none", cursor:"pointer", background:active?`${accent}15`:"transparent", color:active?accent:"#64748B", fontWeight:active?600:400, fontSize:13, transition:"all 0.15s", width:"100%", position:"relative" }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="rgba(148,163,184,0.06)"; e.currentTarget.style.color="#94A3B8"; }}}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748B"; }}}>
              {active && <span style={{ position:"absolute", left:0, top:"18%", bottom:"18%", width:3, borderRadius:"0 3px 3px 0", background:accent }}/>}
              <span style={{ fontSize:14, flexShrink:0 }}>{n.emoji}</span>
              {(expanded||isMobile) && <span style={{ whiteSpace:"nowrap" }}>{n.label}</span>}
            </button>;
          })}
        </nav>
        <div style={{ padding:"8px", borderTop:"1px solid rgba(148,163,184,0.07)", display:"flex", flexDirection:"column", gap:3 }}>
          <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:9, padding:(expanded||isMobile)?"8px 11px":"8px", justifyContent:(expanded||isMobile)?"flex-start":"center", borderRadius:8, border:"none", cursor:"pointer", background:"transparent", color:"#64748B", fontSize:13, width:"100%", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(244,63,94,0.08)"; e.currentTarget.style.color="#FB7185"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748B"; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:15,height:15,flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
            {(expanded||isMobile) && <span style={{whiteSpace:"nowrap"}}>Log Out</span>}
          </button>
          {!isMobile && (
            <button onClick={()=>setExpanded(v=>!v)} style={{ display:"flex", alignItems:"center", gap:9, padding:expanded?"8px 11px":"8px", justifyContent:expanded?"flex-start":"center", borderRadius:8, border:"none", cursor:"pointer", background:"rgba(148,163,184,0.04)", color:"#475569", fontSize:12, width:"100%", transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(148,163,184,0.1)"; e.currentTarget.style.color="#94A3B8"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(148,163,184,0.04)"; e.currentTarget.style.color="#475569"; }}>
              <span style={{ display:"flex", transform:expanded?"rotate(180deg)":"none", transition:"transform 0.25s", flexShrink:0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </span>
              {expanded && <span style={{whiteSpace:"nowrap"}}>Collapse</span>}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function StudentDashboard({ user, snippetCode, clearSnippetCode }) {
  const isDemo = !user || user.id === 0;
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [tab, setTab]           = useLocalStorage("lf_student_tab","chat");
  const [msgs, setMsgs]         = useState(isDemo ? INIT_MSGS : []);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [runState, setRunState] = useState("ready");
  const [output, setOutput]     = useState("");
  const [code, setCode]         = useLocalStorage("lf_code",STARTER);
  const [topics, setTopics]     = useState(isDemo ? TOPICS : []);
  const [execStats, setExecStats] = useState({ total: 0, successes: 0, streak: 0, active_days: 0 });
  const [dataLoading, setDataLoading] = useState(!isDemo);
  const [toast, setToast] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const chatEnd = useRef(null);
  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[msgs,typing]);

  // Handle snippet loaded from SnippetsPage
  useEffect(()=>{
    if(snippetCode){setCode(snippetCode);setTab("code");clearSnippetCode();}
  },[snippetCode]);

  // Load real data on mount
  useEffect(()=>{
    if(isDemo) return;
    let loaded=0;
    const done=()=>{loaded++;if(loaded>=3)setDataLoading(false);};
    // Load progress
    fetch("/api/progress",{headers:authHeaders}).then(r=>{if(!r.ok)throw new Error("Failed to load progress");return r.json();}).then(d=>{if(d)setTopics(d.topics);}).catch(e=>{setToast({message:e.message||"Failed to load progress",type:"error"});}).finally(done);
    // Load execution stats
    fetch("/api/submissions",{headers:authHeaders}).then(r=>{if(!r.ok)throw new Error("Failed to load stats");return r.json();}).then(d=>{if(d&&d.stats)setExecStats(d.stats);}).catch(()=>{}).finally(done);
    // Load chat history
    fetch("/api/chat/history",{headers:authHeaders}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{
      if(d && d.messages && d.messages.length>0) setMsgs(d.messages.map(m=>({id:m.id,role:m.role==="user"?"user":"ai",agent:m.agent||"Concepts Agent",text:m.text})));
      else setMsgs([{id:1,role:"ai",agent:"Triage Agent",text:`Hi ${user?.name?.split(" ")[0]||"there"}! I'm your AI tutor. What would you like to learn today?`}]);
    }).catch(()=>{setMsgs([{id:1,role:"ai",agent:"Triage Agent",text:`Hi ${user?.name?.split(" ")[0]||"there"}! I'm your AI tutor. What would you like to learn today?`}]);}).finally(done);
    // Periodic struggle check (stuck time + low quiz detection) every 60s
    const struggleCheck = setInterval(()=>{
      fetch("/api/progress/check-struggle",{headers:authHeaders}).catch(()=>{});
    }, 60000);
    return ()=>clearInterval(struggleCheck);
  },[]);

  const send = () => {
    const t=input.trim(); if(!t) return;
    setMsgs(p=>[...p,{id:Date.now(),role:"user",text:t}]);
    setInput(""); setTyping(true);
    // Save user message to DB
    if(!isDemo) fetch("/api/chat/history",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({role:"user",text:t})}).catch(()=>{});
    // Call AI chat API
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({message:t,user_id:user?.id||"anonymous"})})
      .then(r=>r.json())
      .then(data=>{
        setTyping(false);
        const aiText = data.message || data.error || "I'm here to help! Try asking about Python concepts.";
        const aiAgent = data.agent || "Concepts Agent";
        setMsgs(p=>[...p,{id:Date.now()+1,role:"ai",agent:aiAgent,text:aiText}]);
        // Save AI response to DB + refresh progress (mastery may have changed)
        if(!isDemo) {
          fetch("/api/chat/history",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({role:"ai",text:aiText,agent:aiAgent})}).catch(()=>{});
          fetch("/api/progress",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d)setTopics(d.topics);}).catch(()=>{});
        }
      })
      .catch(()=>{
        setTyping(false);
        setMsgs(p=>[...p,{id:Date.now()+1,role:"ai",agent:"Triage Agent",text:"Sorry, I couldn't reach the AI tutor right now. Please try again!"}]);
        setToast({message:"Chat request failed. Check your connection.",type:"error"});
      });
  };
  const [assignments,setAssignments]=useState([]);
  const [quizzes,setQuizzes]=useState([]);
  const [activeQuiz,setActiveQuiz]=useState(null);
  const [quizAnswers,setQuizAnswers]=useState([]);
  const [quizResult,setQuizResult]=useState(null);
  const [submittingQuiz,setSubmittingQuiz]=useState(false);
  const [activeExercise,setActiveExercise]=useState(null);
  const [exCode,setExCode]=useState("");
  const [exSubmitting,setExSubmitting]=useState(false);
  const [exResult,setExResult]=useState(null);
  const [genQuizTopic,setGenQuizTopic]=useState("");
  const [genQuizLoading,setGenQuizLoading]=useState(false);
  const [snippetModal,setSnippetModal]=useState(false);
  const [snippetTitle,setSnippetTitle]=useState("");
  const [snippetDesc,setSnippetDesc]=useState("");
  const [snippetTags,setSnippetTags]=useState("");
  const [snippetSaving,setSnippetSaving]=useState(false);

  const saveSnippet=async()=>{
    if(!snippetTitle.trim()||!code.trim()){setToast({message:"Title and code are required",type:"error"});return;}
    setSnippetSaving(true);
    try{
      const res=await fetch("/api/snippets",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({title:snippetTitle,description:snippetDesc,code,tags:snippetTags})});
      if(!res.ok)throw new Error("Failed to save");
      setToast({message:`Snippet "${snippetTitle}" saved!`,type:"success"});
      setSnippetModal(false);setSnippetTitle("");setSnippetDesc("");setSnippetTags("");
    }catch(e){setToast({message:e.message||"Save failed",type:"error"});}
    setSnippetSaving(false);
  };

  // Voice input (Web Speech API)
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleVoice = () => {
    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setToast({message:"Voice input not supported in this browser. Try Chrome or Edge.",type:"error"}); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setInput(transcript);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setToast({message:"Microphone access denied. Please allow mic access.",type:"error"});
      else if (e.error !== "aborted") setToast({message:`Voice error: ${e.error}`,type:"error"});
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  // Load assignments + quizzes
  useEffect(()=>{
    if(isDemo) return;
    fetch("/api/teacher/assign",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.exercises)setAssignments(d.exercises);}).catch(()=>{});
    fetch("/api/quizzes",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.quizzes)setQuizzes(d.quizzes);}).catch(()=>{});
  },[]);

  const submitQuiz=async()=>{
    if(!activeQuiz||submittingQuiz)return;
    setSubmittingQuiz(true);
    try {
      const res=await fetch("/api/quizzes/submit",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({quiz_id:activeQuiz.quiz_id,answers:quizAnswers})});
      if(!res.ok)throw new Error("Failed to submit quiz");
      const data=await res.json();
      setQuizResult(data);
      setToast({message:data.passed?`Quiz passed! ${data.percentage}%`:`Quiz completed: ${data.percentage}%`,type:data.passed?"success":"info"});
      fetch("/api/progress",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d)setTopics(d.topics);}).catch(()=>{});
    } catch(e){setToast({message:e.message||"Quiz submission failed",type:"error"});}
    setSubmittingQuiz(false);
  };

  const submitExercise=async()=>{
    if(!activeExercise||exSubmitting)return;
    setExSubmitting(true);
    try {
      const res=await fetch("/api/exercises/submit",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({exercise_id:activeExercise.id,code:exCode})});
      if(!res.ok)throw new Error("Failed to submit exercise");
      const data=await res.json();
      setExResult(data);
      setToast({message:data.passed?`Exercise passed! Grade: ${data.grade}/100`:`Graded: ${data.grade}/100 — Keep trying!`,type:data.passed?"success":"info"});
      fetch("/api/teacher/assign",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.exercises)setAssignments(d.exercises);}).catch(()=>{});
      fetch("/api/progress",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d)setTopics(d.topics);}).catch(()=>{});
    } catch(e){setToast({message:e.message||"Exercise submission failed",type:"error"});}
    setExSubmitting(false);
  };

  const getAdaptiveQuizParams=(topicName)=>{
    const t=topics.find(x=>x.name===topicName);
    const pct=t?t.pct:0;
    if(pct>=91) return {difficulty:"advanced",num_questions:Math.floor(Math.random()*4)+12,level:"Mastered"};
    if(pct>=71) return {difficulty:"advanced",num_questions:10,level:"Proficient"};
    if(pct>=41) return {difficulty:"intermediate",num_questions:8,level:"Learning"};
    return {difficulty:"beginner",num_questions:5,level:"Beginner"};
  };

  const generateQuiz=async()=>{
    if(!genQuizTopic||genQuizLoading)return;
    setGenQuizLoading(true);
    const params=getAdaptiveQuizParams(genQuizTopic);
    try {
      const res=await fetch("/api/quizzes/generate",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({topic:genQuizTopic,difficulty:params.difficulty,num_questions:params.num_questions})});
      if(!res.ok)throw new Error("Failed to generate quiz");
      const data=await res.json();
      if(data.quiz_id&&data.questions){
        setActiveQuiz(data);
        setQuizAnswers(new Array(data.questions.length).fill(-1));
        setQuizResult(null);
        setTab("exercises");
        setToast({message:"Quiz ready! Answer all questions to submit.",type:"success"});
      }
      fetch("/api/quizzes",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.quizzes)setQuizzes(d.quizzes);}).catch(()=>{});
    } catch(e){setToast({message:e.message||"Quiz generation failed",type:"error"});}
    setGenQuizLoading(false);
  };

  const TABS=[{id:"chat",label:"AI Chat",icon:"💬"},{id:"code",label:"Code",icon:"💻"},{id:"exercises",label:"Exercises",icon:"📝"},{id:"progress",label:"Progress",icon:"📊"}];
  const renderMsg=(msg)=>{
    const isUser=msg.role==="user";
    const ag=msg.agent?AGENTS[msg.agent]:null;
    const body=msg.text.split(/(```[\s\S]*?```)/g).map((p,i)=>{
      if(p.startsWith("```")){const code=p.replace(/^```\w*\n?/,"").replace(/```$/,"");return <pre key={i} style={{marginTop:7,padding:"9px 12px",borderRadius:8,fontSize:12,fontFamily:"monospace",background:"rgba(0,0,0,0.45)",color:"#98C379",border:"1px solid rgba(255,255,255,0.06)",overflowX:"auto",lineHeight:1.6}}>{code}</pre>;}
      return <span key={i} style={{whiteSpace:"pre-wrap"}}>{p.replace(/\*\*(.*?)\*\*/g,(_,m)=>m)}</span>;
    });
    if(isUser) return <div key={msg.id} style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><div style={{maxWidth:"75%",padding:"9px 13px",borderRadius:"18px 18px 4px 18px",fontSize:14,lineHeight:1.6,background:"linear-gradient(135deg,#1D4ED8,#3B82F6)",color:"#EFF6FF"}}>{body}</div></div>;
    return <div key={msg.id} style={{display:"flex",gap:9,marginBottom:14,alignItems:"flex-start"}}>
      <div style={{width:30,height:30,borderRadius:9,flexShrink:0,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div>
      <div style={{flex:1,minWidth:0}}>
        {ag&&<span style={{display:"inline-flex",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,marginBottom:5,color:ag.color,background:ag.bg,border:`1px solid ${ag.border}`}}>{msg.agent}</span>}
        <div style={{padding:"9px 13px",borderRadius:"4px 18px 18px 18px",fontSize:14,lineHeight:1.6,background:"rgba(30,41,59,0.9)",color:"#CBD5E1",border:"1px solid rgba(148,163,184,0.07)"}}>{body}</div>
      </div>
    </div>;
  };
  const avgMastery = topics.length ? Math.round(topics.reduce((a,t)=>a+t.pct,0)/topics.length) : 0;

  if(dataLoading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={32}/><span style={{fontSize:13,color:"#64748B"}}>Loading your dashboard...</span></div>;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div style={{display:"flex",alignItems:"center",background:"rgba(15,23,42,0.7)",borderBottom:"1px solid rgba(148,163,184,0.07)",flexShrink:0,padding:"0 4px",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {TABS.map(t=>{const active=tab===t.id;return <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",height:42,border:"none",borderBottom:active?"2px solid #3B82F6":"2px solid transparent",cursor:"pointer",fontSize:13,fontWeight:active?600:400,color:active?"#93C5FD":"#64748B",background:"transparent",transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}><span>{t.icon}</span>{t.label}</button>;})}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,padding:"0 12px",flexShrink:0}}>
          <div style={{width:48,height:3,borderRadius:99,background:"rgba(148,163,184,0.1)",overflow:"hidden"}}><div style={{height:"100%",width:`${avgMastery}%`,borderRadius:99,background:"linear-gradient(90deg,#3B82F6,#818CF8)"}}/></div>
          <span style={{fontSize:11,fontWeight:700,color:"#60A5FA"}}>{avgMastery}%</span>
        </div>
      </div>
      {tab==="chat"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"18px 0"}}>
            <div style={{maxWidth:620,margin:"0 auto",padding:"0 14px"}}>
              {msgs.map(renderMsg)}
              {typing&&<div style={{display:"flex",gap:9,marginBottom:12}}><div style={{width:30,height:30,borderRadius:9,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🤖</div><div style={{display:"flex",alignItems:"center",gap:5,padding:"11px 14px",borderRadius:"4px 18px 18px 18px",background:"rgba(30,41,59,0.9)",border:"1px solid rgba(148,163,184,0.07)"}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#475569",display:"block",animation:`tdot 1.3s ease-in-out ${i*0.18}s infinite`}}/>)}</div></div>}
              <div ref={chatEnd}/>
            </div>
          </div>
          <div style={{flexShrink:0,borderTop:"1px solid rgba(148,163,184,0.07)",background:"rgba(15,23,42,0.85)",padding:"12px 14px"}}>
            <div style={{maxWidth:620,margin:"0 auto",display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{flex:1,background:"rgba(30,41,59,0.9)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:12,padding:"9px 12px"}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask anything about Python…" rows={1} style={{width:"100%",resize:"none",fontSize:14,background:"transparent",border:"none",color:"#E2E8F0",lineHeight:1.55,maxHeight:80,fontFamily:"inherit"}}/>
              </div>
              <button onClick={toggleVoice} title={listening?"Stop listening":"Voice input"} style={{width:38,height:38,borderRadius:10,flexShrink:0,background:listening?"rgba(244,63,94,0.15)":"rgba(30,41,59,0.8)",border:listening?"1px solid rgba(244,63,94,0.3)":"1px solid rgba(148,163,184,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:listening?"#FB7185":"#64748B",transition:"all 0.18s",position:"relative"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>
                {listening&&<span style={{position:"absolute",inset:-3,borderRadius:12,border:"2px solid rgba(244,63,94,0.4)",animation:"pulse2 1.5s ease-in-out infinite"}}/>}
              </button>
              <button onClick={()=>{if(listening&&recognitionRef.current){recognitionRef.current.stop();setListening(false);}send();}} style={{width:38,height:38,borderRadius:10,flexShrink:0,background:input.trim()?"linear-gradient(135deg,#2563EB,#3B82F6)":"rgba(30,41,59,0.8)",border:input.trim()?"none":"1px solid rgba(148,163,184,0.1)",cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",color:input.trim()?"white":"#334155",transition:"all 0.18s"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {tab==="code"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",background:"rgba(15,23,42,0.9)",borderBottom:"1px solid rgba(148,163,184,0.07)",flexShrink:0,paddingLeft:6}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#181E2D",borderRight:"1px solid rgba(148,163,184,0.07)",borderBottom:"2px solid #3B82F6",fontSize:12,fontWeight:500,color:"#CBD5E1"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" style={{width:11,height:11}}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>main.py
            </div>
          </div>
          <div style={{flex:1,display:"flex",overflow:"hidden",background:"#181E2D"}}>
            <div style={{width:36,flexShrink:0,paddingTop:10,textAlign:"right",userSelect:"none",fontFamily:"monospace"}}>
              {code.split("\n").map((_,i)=><div key={i} style={{lineHeight:"22px",paddingRight:12,fontSize:12,color:"#3E4451"}}>{i+1}</div>)}
            </div>
            <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} style={{flex:1,background:"transparent",border:"none",color:"#ABB2BF",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:"22px",padding:"10px 12px 10px 0",resize:"none",outline:"none",tabSize:4,whiteSpace:"pre",overflowX:"auto"}} onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart;const end=e.target.selectionEnd;setCode(code.substring(0,s)+"    "+code.substring(end));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+4;},0);}}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderTop:"1px solid rgba(148,163,184,0.07)",background:"rgba(15,23,42,0.7)",flexShrink:0}}>
            <button onClick={()=>{setRunState("running");setOutput("");fetch("/api/execute",{method:"POST",headers:{"Content-Type":"application/json",...authHeaders},body:JSON.stringify({code})}).then(r=>{if(!r.ok)throw new Error("Execution service unavailable");return r.json();}).then(d=>{setRunState("done");setOutput(d.output||d.error||"(no output)");if(!isDemo)fetch("/api/submissions",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(s=>{if(s&&s.stats)setExecStats(s.stats);}).catch(()=>{});if(!isDemo)fetch("/api/progress",{headers:authHeaders}).then(r=>r.ok?r.json():null).then(s=>{if(s)setTopics(s.topics);}).catch(()=>{});}).catch(e=>{setRunState("done");setOutput("Error: "+(e.message||"could not execute code"));setToast({message:"Code execution failed: "+(e.message||"unknown error"),type:"error"});});}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:8,border:"none",background:runState==="running"?"rgba(16,185,129,0.12)":"linear-gradient(135deg,#059669,#10B981)",color:runState==="running"?"#34D399":"white",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{width:11,height:11}}><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd"/></svg>
              {runState==="running"?"Running…":"▶ Run"}
            </button>
            <button onClick={()=>{setOutput("");setRunState("ready");}} style={{padding:"7px 11px",borderRadius:8,background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.1)",color:"#94A3B8",fontSize:13,cursor:"pointer"}}>Clear</button>
            <button onClick={()=>setSnippetModal(true)} style={{padding:"7px 11px",borderRadius:8,background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",color:"#A78BFA",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:11,height:11}}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
              Save
            </button>
            <span style={{marginLeft:"auto",fontSize:11,color:runState==="ready"?"#334155":runState==="running"?"#F59E0B":"#34D399"}}>{runState==="ready"?"● Ready":runState==="running"?"● Running...":"● Done"}</span>
          </div>
          <div style={{height:120,background:"#0D1117",borderTop:"1px solid rgba(148,163,184,0.07)",flexShrink:0,padding:"10px 13px",overflowY:"auto"}}>
            {!output&&runState==="ready"&&<span style={{fontFamily:"monospace",fontSize:12,color:"#3E4451"}}>$ _</span>}
            {runState==="running"&&<span style={{fontFamily:"monospace",fontSize:12,color:"#F59E0B"}}>Running…</span>}
            {output&&<pre style={{fontFamily:"monospace",fontSize:13,lineHeight:1.7,color:"#E2E8F0",whiteSpace:"pre-wrap"}}><span style={{color:"#475569"}}>{"$ python main.py\n"}</span>{output}{"\n"}{output.startsWith("Error")||output.includes("Traceback")?<span style={{color:"#FB7185"}}>✗ Error</span>:<span style={{color:"#34D399"}}>✓ Success</span>}</pre>}
          </div>
        </div>
      )}
      {/* Save Snippet Modal */}
      {snippetModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(2px)"}} onClick={()=>setSnippetModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1E293B",border:"1px solid rgba(148,163,184,0.15)",borderRadius:16,padding:"24px",width:"100%",maxWidth:420,animation:"fadein 0.2s ease"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Save Code Snippet</div>
            <div style={{fontSize:12,color:"#64748B",marginBottom:18}}>Save this code to your snippets library for quick reuse</div>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:4,display:"block"}}>Title *</label>
                <input value={snippetTitle} onChange={e=>setSnippetTitle(e.target.value)} placeholder="e.g. My Fibonacci Function" style={{width:"100%",padding:"10px 12px",background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,fontSize:12,color:"#E2E8F0",outline:"none"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:4,display:"block"}}>Description</label>
                <input value={snippetDesc} onChange={e=>setSnippetDesc(e.target.value)} placeholder="Brief description of what this code does" style={{width:"100%",padding:"10px 12px",background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,fontSize:12,color:"#E2E8F0",outline:"none"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:4,display:"block"}}>Tags (comma-separated)</label>
                <input value={snippetTags} onChange={e=>setSnippetTags(e.target.value)} placeholder="e.g. functions, recursion, math" style={{width:"100%",padding:"10px 12px",background:"rgba(15,23,42,0.5)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,fontSize:12,color:"#E2E8F0",outline:"none"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:4,display:"block"}}>Code Preview</label>
                <pre style={{padding:"10px 12px",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:8,fontSize:11,color:"#93C5FD",fontFamily:"monospace",maxHeight:100,overflow:"auto",lineHeight:1.5}}>{code.length>500?code.slice(0,500)+"...":code}</pre>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>setSnippetModal(false)} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#94A3B8",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={saveSnippet} disabled={snippetSaving||!snippetTitle.trim()} style={{flex:2,padding:"10px",borderRadius:8,border:"none",background:snippetTitle.trim()?"linear-gradient(135deg,#7C3AED,#8B5CF6)":"rgba(148,163,184,0.1)",color:snippetTitle.trim()?"white":"#475569",fontSize:13,fontWeight:700,cursor:snippetTitle.trim()?"pointer":"not-allowed",opacity:snippetSaving?0.6:1}}>
                {snippetSaving?"Saving...":"Save Snippet"}
              </button>
            </div>
          </div>
        </div>
      )}
      {tab==="exercises"&&(
        <div style={{flex:1,overflowY:"auto",padding:"18px 14px"}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>

            {/* Active Quiz */}
            {activeQuiz&&!quizResult&&(
              <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{activeQuiz.title}</span>
                  <button onClick={()=>{setActiveQuiz(null);setQuizAnswers([]);}} style={{fontSize:11,color:"#64748B",background:"transparent",border:"none",cursor:"pointer"}}>Close</button>
                </div>
                <div style={{padding:"15px"}}>
                  {activeQuiz.questions.map((q,qi)=>(
                    <div key={qi} style={{marginBottom:18}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0",marginBottom:8}}>{qi+1}. {q.question}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {q.options.map((opt,oi)=>(
                          <button key={oi} onClick={()=>{const a=[...quizAnswers];a[qi]=oi;setQuizAnswers(a);}} style={{textAlign:"left",padding:"9px 12px",borderRadius:8,border:quizAnswers[qi]===oi?"2px solid #8B5CF6":"1px solid rgba(148,163,184,0.1)",background:quizAnswers[qi]===oi?"rgba(139,92,246,0.1)":"rgba(15,23,42,0.4)",color:quizAnswers[qi]===oi?"#C4B5FD":"#94A3B8",fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>
                            <span style={{fontWeight:700,marginRight:8}}>{String.fromCharCode(65+oi)}.</span>{opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={submitQuiz} disabled={submittingQuiz||quizAnswers.includes(-1)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:quizAnswers.includes(-1)?"rgba(148,163,184,0.1)":"linear-gradient(135deg,#7C3AED,#8B5CF6)",color:quizAnswers.includes(-1)?"#475569":"white",fontSize:14,fontWeight:600,cursor:quizAnswers.includes(-1)?"default":"pointer"}}>
                    {submittingQuiz?"Grading...":"Submit Quiz"}
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Result */}
            {quizResult&&(
              <div style={{background:"rgba(30,41,59,0.4)",border:`1px solid ${quizResult.passed?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.2)"}`,borderRadius:14,padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:8}}>{quizResult.passed?"🎉":"💪"}</div>
                <div style={{fontSize:20,fontWeight:800,color:quizResult.passed?"#34D399":"#FB7185"}}>{quizResult.percentage}%</div>
                <div style={{fontSize:13,color:"#94A3B8",marginBottom:12}}>{quizResult.score}/{quizResult.total} correct — {quizResult.passed?"Passed!":"Keep practicing!"}</div>
                {quizResult.results&&<div style={{textAlign:"left",marginTop:12}}>
                  {quizResult.results.map((r,i)=>(
                    <div key={i} style={{padding:"8px 12px",marginBottom:4,borderRadius:8,background:r.is_correct?"rgba(16,185,129,0.08)":"rgba(244,63,94,0.08)",border:`1px solid ${r.is_correct?"rgba(16,185,129,0.15)":"rgba(244,63,94,0.15)"}`}}>
                      <div style={{fontSize:12,fontWeight:600,color:r.is_correct?"#34D399":"#FB7185"}}>Q{i+1}: {r.is_correct?"Correct":"Incorrect"}</div>
                      <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{r.explanation}</div>
                    </div>
                  ))}
                </div>}
                <button onClick={()=>{setQuizResult(null);setActiveQuiz(null);setQuizAnswers([]);}} style={{marginTop:14,padding:"9px 20px",borderRadius:8,border:"none",background:"rgba(30,41,59,0.8)",color:"#94A3B8",fontSize:13,cursor:"pointer"}}>Done</button>
              </div>
            )}

            {/* Active Exercise */}
            {activeExercise&&(
              <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div><div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{activeExercise.title}</div><div style={{fontSize:11,color:"#64748B"}}>{activeExercise.topic} — {activeExercise.difficulty}</div></div>
                  <button onClick={()=>{setActiveExercise(null);setExCode("");setExResult(null);}} style={{fontSize:11,color:"#64748B",background:"transparent",border:"none",cursor:"pointer"}}>Close</button>
                </div>
                {activeExercise.description&&<div style={{padding:"10px 15px",fontSize:12,color:"#94A3B8",borderBottom:"1px solid rgba(148,163,184,0.04)"}}>{activeExercise.description}</div>}
                <div style={{background:"#181E2D",position:"relative"}}>
                  <textarea value={exCode} onChange={e=>setExCode(e.target.value)} spellCheck={false} style={{width:"100%",minHeight:160,background:"transparent",border:"none",color:"#ABB2BF",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:"22px",padding:"12px 14px",resize:"vertical",outline:"none",tabSize:4}} onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart;const end=e.target.selectionEnd;setExCode(exCode.substring(0,s)+"    "+exCode.substring(end));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+4;},0);}}} placeholder="Write your solution here..."/>
                </div>
                <div style={{padding:"12px 15px",borderTop:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={submitExercise} disabled={exSubmitting||!exCode.trim()} style={{padding:"8px 16px",borderRadius:8,border:"none",background:exCode.trim()?"linear-gradient(135deg,#059669,#10B981)":"rgba(148,163,184,0.1)",color:exCode.trim()?"white":"#475569",fontSize:13,fontWeight:600,cursor:exCode.trim()?"pointer":"default"}}>{exSubmitting?"Grading...":"Submit & Grade"}</button>
                  {activeExercise.expected_output&&<span style={{fontSize:11,color:"#475569"}}>Expected: {activeExercise.expected_output.slice(0,60)}</span>}
                </div>
                {exResult&&(
                  <div style={{padding:"12px 15px",borderTop:"1px solid rgba(148,163,184,0.06)",background:exResult.passed?"rgba(16,185,129,0.05)":"rgba(244,63,94,0.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:18}}>{exResult.passed?"✅":"❌"}</span>
                      <span style={{fontSize:16,fontWeight:700,color:exResult.passed?"#34D399":"#FB7185"}}>Grade: {exResult.grade}/100</span>
                    </div>
                    <div style={{fontSize:12,color:"#94A3B8",whiteSpace:"pre-wrap"}}>{exResult.feedback}</div>
                    {exResult.output&&<pre style={{marginTop:6,padding:"8px 10px",borderRadius:6,background:"rgba(0,0,0,0.3)",fontSize:11,color:"#E2E8F0",fontFamily:"monospace"}}>{exResult.output.slice(0,500)}</pre>}
                  </div>
                )}
              </div>
            )}

            {/* Generate Quiz */}
            {!activeQuiz&&!quizResult&&(
              <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,padding:"15px"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#F1F5F9",marginBottom:8}}>Take a Quiz</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <select value={genQuizTopic} onChange={e=>setGenQuizTopic(e.target.value)} style={{flex:1,minWidth:140,padding:"9px 12px",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,color:"#E2E8F0",fontSize:13,fontFamily:"inherit"}}>
                    <option value="">Select topic…</option>
                    {topics.map(t=><option key={t.name} value={t.name}>{t.name} ({t.pct}%)</option>)}
                  </select>
                  <button onClick={generateQuiz} disabled={!genQuizTopic||genQuizLoading} style={{padding:"9px 16px",borderRadius:9,border:"none",background:genQuizTopic?"linear-gradient(135deg,#7C3AED,#8B5CF6)":"rgba(148,163,184,0.1)",color:genQuizTopic?"white":"#475569",fontSize:13,fontWeight:600,cursor:genQuizTopic?"pointer":"default"}}>
                    {genQuizLoading?"Generating...":"Generate Quiz"}
                  </button>
                </div>
                {genQuizTopic&&(()=>{const p=getAdaptiveQuizParams(genQuizTopic);const lc=p.level==="Mastered"?"#3B82F6":p.level==="Proficient"?"#10B981":p.level==="Learning"?"#FBBF24":"#F43F5E";return(
                  <div style={{marginTop:8,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:`${lc}15`,color:lc}}>{p.level}</span>
                    <span style={{fontSize:10,color:"#64748B"}}>{p.num_questions} questions</span>
                    <span style={{fontSize:10,color:"#475569"}}>•</span>
                    <span style={{fontSize:10,color:"#64748B"}}>{p.difficulty} difficulty</span>
                    <span style={{fontSize:10,color:"#475569"}}>•</span>
                    <span style={{fontSize:10,color:"#475569",fontStyle:"italic"}}>Adapts to your mastery level</span>
                  </div>);})()}
                {quizzes.length>0&&<div style={{marginTop:12}}>
                  <div style={{fontSize:11,color:"#475569",marginBottom:6}}>Previous Quizzes:</div>
                  {quizzes.slice(0,5).map(q=>(
                    <div key={q.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(148,163,184,0.06)",marginBottom:4}}>
                      <div><span style={{fontSize:12,fontWeight:500,color:"#E2E8F0"}}>{q.title}</span><span style={{fontSize:10,color:"#475569",marginLeft:8}}>{q.attempts} attempt{q.attempts!==1?"s":""}</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {q.best_score!==null&&<span style={{fontSize:11,fontWeight:700,color:q.best_score>=70?"#34D399":"#FB7185"}}>{q.best_score}%</span>}
                        <button onClick={async()=>{try{const r=await fetch(`/api/quizzes/load?id=${q.id}`,{headers:authHeaders});const d=await r.json();if(d.questions){setActiveQuiz(d);setQuizAnswers(new Array(d.questions.length).fill(-1));setQuizResult(null);}}catch{}}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(139,92,246,0.2)",background:"rgba(139,92,246,0.08)",color:"#C4B5FD",fontSize:10,fontWeight:600,cursor:"pointer"}}>{q.attempts>0?"Retake":"Start"}</button>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {/* Assigned Exercises */}
            {!activeExercise&&(
              <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#F1F5F9"}}>Assigned Exercises</span>
                  <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"rgba(59,130,246,0.15)",color:"#60A5FA",border:"1px solid rgba(59,130,246,0.25)"}}>{assignments.length}</span>
                </div>
                {assignments.length===0?<div style={{padding:"20px",textAlign:"center",fontSize:13,color:"#475569"}}>No exercises assigned yet. Your teacher can assign exercises to you.</div>
                :assignments.map(ex=>{
                  const done=ex.status==="completed";
                  return(
                    <div key={ex.id} style={{padding:"12px 15px",borderBottom:"1px solid rgba(148,163,184,0.04)",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,borderRadius:8,background:done?"rgba(16,185,129,0.12)":"rgba(59,130,246,0.12)",border:`1px solid ${done?"rgba(16,185,129,0.25)":"rgba(59,130,246,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{done?"✓":"📝"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:"#E2E8F0"}}>{ex.title}</div>
                        <div style={{fontSize:10,color:"#475569"}}>{ex.topic} — {ex.difficulty}{ex.grade!=null?` — Grade: ${ex.grade}/100`:""}</div>
                      </div>
                      {done?<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(16,185,129,0.1)",color:"#34D399",border:"1px solid rgba(16,185,129,0.2)"}}>Done</span>
                      :<button onClick={()=>{setActiveExercise(ex);setExCode(ex.starter_code||"# Write your solution here\n");setExResult(null);}} style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(59,130,246,0.25)",background:"rgba(59,130,246,0.1)",color:"#60A5FA",fontSize:11,fontWeight:600,cursor:"pointer"}}>Start</button>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {tab==="progress"&&(
        <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:16,padding:"20px",marginBottom:14,display:"flex",flexWrap:"wrap",gap:18,alignItems:"center"}}>
              <div style={{position:"relative",width:96,height:96,flexShrink:0}}>
                <Ring pct={topics.length?Math.round(topics.reduce((a,t)=>a+t.pct,0)/topics.length):0} size={96} stroke={7}/>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>{topics.length?Math.round(topics.reduce((a,t)=>a+t.pct,0)/topics.length):0}%</span>
                  <span style={{fontSize:9,color:"#64748B",textTransform:"uppercase",letterSpacing:"0.08em"}}>Mastery</span>
                </div>
              </div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:15,fontWeight:700,color:"#F1F5F9",marginBottom:2}}>{user?.name||"Student"}</div>
                <div style={{fontSize:12,color:"#64748B",marginBottom:12}}>{topics.filter(t=>t.pct>0).length} of {topics.length} topics started</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[{e:"🔥",v:execStats.streak+"d",l:"Streak"},{e:"📝",v:String(execStats.total),l:"Code Runs"},{e:"✅",v:execStats.total?Math.round(execStats.successes/execStats.total*100)+"%":"0%",l:"Success Rate"}].map(s=>(
                    <div key={s.l} style={{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:9,padding:"7px 10px",textAlign:"center"}}>
                      <div style={{fontSize:14}}>{s.e}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{s.v}</div>
                      <div style={{fontSize:9,color:"#475569",textTransform:"uppercase"}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:9}}>
              {topics.map(t=>{const ls=LEVEL[t.level]||LEVEL.Beginner;const isExp=expandedTopic===t.name;return(
                <div key={t.name} onClick={()=>setExpandedTopic(isExp?null:t.name)} style={{background:isExp?"rgba(30,41,59,0.6)":"rgba(30,41,59,0.4)",border:`1px solid ${isExp?ls.border:"rgba(148,163,184,0.07)"}`,borderRadius:11,padding:"12px 13px",cursor:"pointer",transition:"all 0.2s ease",gridColumn:isExp?"1 / -1":"auto"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{t.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,color:ls.color,background:ls.bg,border:`1px solid ${ls.border}`}}>{ls.label}</span>
                      <span style={{fontSize:10,color:"#64748B",transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{flex:1,height:3,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${t.pct}%`,borderRadius:99,background:ls.bar}}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:ls.color,width:30,textAlign:"right"}}>{t.pct}%</span>
                  </div>
                  {isExp&&(
                    <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(148,163,184,0.1)"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Mastery Breakdown</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[
                          {label:"Exercises",value:t.exercises_completed||0,weight:"40%",color:"#3B82F6"},
                          {label:"Quizzes",value:t.quiz_score||0,weight:"30%",color:"#8B5CF6"},
                          {label:"Code Quality",value:t.code_quality||0,weight:"20%",color:"#10B981"},
                          {label:"Streak",value:Math.min((t.streak||0)*10,100),weight:"10%",color:"#F59E0B"},
                        ].map(m=>(
                          <div key={m.label} style={{background:"rgba(15,23,42,0.5)",borderRadius:8,padding:"8px 10px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:11,color:"#94A3B8"}}>{m.label}</span>
                              <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.value}%</span>
                            </div>
                            <div style={{height:3,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${m.value}%`,borderRadius:99,background:m.color,transition:"width 0.3s ease"}}/>
                            </div>
                            <div style={{fontSize:9,color:"#475569",marginTop:3}}>Weight: {m.weight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function TeacherDashboard({ user }) {
  const isDemo = !user || user.id === 0;
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
  const [search,setSearch]=useState("");
  const [prompt,setPrompt]=useState("");
  const [generating,setGenerating]=useState(false);
  const [generatedEx,setGeneratedEx]=useState(null);
  const [students,setStudents]=useState(isDemo?STUDENTS:[]);
  const [unassigned,setUnassigned]=useState([]);
  const [alerts,setAlerts]=useState(isDemo?ALERTS:[]);
  const [assignModal,setAssignModal]=useState(null);
  const [assignStudent,setAssignStudent]=useState("");
  const [assigning,setAssigning]=useState(false);
  const [lastRefresh,setLastRefresh]=useState(Date.now());
  const [teacherLoading,setTeacherLoading]=useState(!isDemo);
  const [toast,setToast]=useState(null);
  const [quizTopic,setQuizTopic]=useState("");
  const [quizDiff,setQuizDiff]=useState("beginner");
  const [genQuiz,setGenQuiz]=useState(false);
  const [genQuizResult,setGenQuizResult]=useState(null);
  const [statsExpanded,setStatsExpanded]=useState(null);
  const [studentDetail,setStudentDetail]=useState(null);
  const [detailLoading,setDetailLoading]=useState(false);

  const openStudentDetail = async (studentId) => {
    if(isDemo) return;
    setDetailLoading(true);
    setStudentDetail(null);
    try {
      const res = await fetch(`/api/teacher/student-detail?id=${studentId}`,{headers:authHeaders});
      if(!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setStudentDetail(data);
    } catch(e) {
      setToast({message:e.message||"Failed to load student details",type:"error"});
      setDetailLoading(false);
    }
    setDetailLoading(false);
  };

  const ALERT_TYPE_LABELS = {
    repeated_error: { label: "Repeated Errors", color: "#F43F5E", bg: "rgba(244,63,94,0.1)" },
    frustrated_message: { label: "Frustrated", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    low_quiz_score: { label: "Low Quiz", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
    stuck_time: { label: "Stuck 10min+", color: "#FB923C", bg: "rgba(251,146,60,0.1)" },
  };

  const fetchData = (showLoading=false) => {
    if(isDemo) return;
    const p1=fetch("/api/teacher/students",{headers:authHeaders}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{if(d&&d.students)setStudents(d.students);if(d&&d.unassigned)setUnassigned(d.unassigned);}).catch(()=>{});
    const p2=fetch("/api/teacher/alerts",{headers:authHeaders}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{if(d&&d.alerts)setAlerts(d.alerts);}).catch(()=>{});
    if(showLoading) Promise.all([p1,p2]).finally(()=>setTeacherLoading(false));
  };

  useEffect(()=>{
    fetchData(true);
    if(isDemo) return;
    const interval = setInterval(()=>{fetchData();setLastRefresh(Date.now());}, 10000);
    return ()=>clearInterval(interval);
  },[]);

  const resolveAlert = async (alertId) => {
    if(isDemo){setAlerts(p=>p.filter(a=>a.id!==alertId));return;}
    try {
      const res=await fetch("/api/teacher/alerts/resolve",{method:"POST",headers:authHeaders,body:JSON.stringify({alert_id:alertId})});
      if(!res.ok)throw new Error("Failed to resolve alert");
      setAlerts(p=>p.filter(a=>a.id!==alertId));
      setToast({message:"Alert resolved",type:"success"});
    } catch(e) {setToast({message:e.message||"Failed to resolve",type:"error"});}
  };

  const generateExercise = async () => {
    if(!prompt.trim()||generating)return;
    setGenerating(true);
    if(isDemo){setTimeout(()=>{setGenerating(false);setGeneratedEx(GENERATED_EX);},1500);return;}
    try {
      const res = await fetch("/api/teacher/exercises/generate",{method:"POST",headers:authHeaders,body:JSON.stringify({prompt:prompt.trim(),difficulty:"intermediate",topic:prompt.trim().split(" ")[0]})});
      const data = await res.json();
      if(data.title){setGeneratedEx(data);}else{setGeneratedEx(GENERATED_EX);}
    } catch {setGeneratedEx(GENERATED_EX);}
    setGenerating(false);
  };

  const assignExercise = async () => {
    if(!assignStudent||!assignModal||assigning)return;
    setAssigning(true);
    try {
      const res=await fetch("/api/teacher/assign",{method:"POST",headers:authHeaders,body:JSON.stringify({
        student_id:Number(assignStudent),
        title:assignModal.title,
        description:assignModal.description||"",
        starter_code:assignModal.starter_code||assignModal.starter||"",
        difficulty:assignModal.difficulty||"beginner",
        topic:assignModal.topic||"General",
      })});
      if(!res.ok)throw new Error("Failed to assign exercise");
      setAssignModal(null);setAssignStudent("");
      setToast({message:"Exercise assigned successfully!",type:"success"});
    } catch(e) {setToast({message:e.message||"Assignment failed",type:"error"});}
    setAssigning(false);
  };

  const visible=alerts;
  const filtered=students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.module.toLowerCase().includes(search.toLowerCase()));

  if(teacherLoading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={32} color="#10B981"/><span style={{fontSize:13,color:"#64748B"}}>Loading class data...</span></div>;

  return(
    <div style={{flex:1,overflowY:"auto",padding:"18px 14px"}}>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      {assignModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setAssignModal(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#1E293B",border:"1px solid rgba(148,163,184,0.15)",borderRadius:16,padding:24,maxWidth:420,width:"100%"}}>
          <div style={{fontSize:15,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Assign Exercise</div>
          <div style={{fontSize:12,color:"#94A3B8",marginBottom:16}}>{assignModal.title}</div>
          <div style={{fontSize:12,color:"#94A3B8",marginBottom:6}}>Select Student:</div>
          <select value={assignStudent} onChange={e=>setAssignStudent(e.target.value)} style={{width:"100%",padding:"10px 12px",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:9,color:"#E2E8F0",fontSize:13,marginBottom:16,fontFamily:"inherit"}}>
            <option value="">Choose a student…</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.module} ({s.mastery}%)</option>)}
          </select>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setAssignModal(null)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#94A3B8",fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            <button onClick={assignExercise} disabled={!assignStudent||assigning} style={{padding:"8px 16px",borderRadius:8,border:"none",background:assignStudent?"linear-gradient(135deg,#8B5CF6,#6366F1)":"rgba(148,163,184,0.1)",color:assignStudent?"white":"#475569",fontSize:12,fontWeight:600,cursor:assignStudent?"pointer":"default"}}>{assigning?"Assigning…":"Assign"}</button>
          </div>
        </div>
      </div>}
      {(studentDetail||detailLoading)&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>{setStudentDetail(null);setDetailLoading(false);}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#1E293B",border:"1px solid rgba(148,163,184,0.15)",borderRadius:16,padding:0,maxWidth:600,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
          {detailLoading&&!studentDetail?<div style={{padding:40,textAlign:"center"}}><LoadingSpinner size={28} color="#3B82F6"/><div style={{fontSize:12,color:"#64748B",marginTop:8}}>Loading student profile...</div></div>
          :studentDetail&&(<>
            <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(148,163,184,0.1)",display:"flex",alignItems:"center",gap:12}}>
              <Avatar initials={studentDetail.student.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()} color="#3B82F6" size={42}/>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{studentDetail.student.name}</div>
                <div style={{fontSize:11,color:"#64748B"}}>{studentDetail.student.email} — Joined {new Date(studentDetail.student.joined).toLocaleDateString()}</div>
              </div>
              {studentDetail.stuck_topics.length>0&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:99,background:"rgba(244,63,94,0.12)",color:"#FB7185",border:"1px solid rgba(244,63,94,0.25)"}}>Struggling</span>}
              <button onClick={()=>{setStudentDetail(null);setDetailLoading(false);}} style={{padding:"4px 8px",borderRadius:6,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#64748B",fontSize:14,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"16px 24px"}}>
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                {[
                  {l:"Avg Mastery",v:studentDetail.progress.length?Math.round(studentDetail.progress.reduce((a,p)=>a+p.pct,0)/studentDetail.progress.length)+"%":"0%",c:"#3B82F6"},
                  {l:"Topics",v:`${studentDetail.progress.filter(p=>p.pct>0).length}/${studentDetail.progress.length}`,c:"#8B5CF6"},
                  {l:"Quizzes",v:String(studentDetail.quiz_attempts.length),c:"#10B981"},
                  {l:"Exercises",v:String(studentDetail.exercises.length),c:"#F59E0B"},
                ].map(s=>(
                  <div key={s.l} style={{flex:1,minWidth:80,background:"rgba(15,23,42,0.5)",borderRadius:9,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#475569",textTransform:"uppercase"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {studentDetail.stuck_topics.length>0&&(
                <div style={{background:"rgba(244,63,94,0.08)",border:"1px solid rgba(244,63,94,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#FB7185",marginBottom:4}}>Stuck On</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {studentDetail.stuck_topics.map(t=>(
                      <span key={t} style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:6,background:"rgba(244,63,94,0.15)",color:"#FB7185"}}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Progress by Topic</div>
              <div style={{display:"grid",gap:6,marginBottom:16}}>
                {studentDetail.progress.map(p=>{const ls=LEVEL[p.level]||LEVEL.Beginner;return(
                  <div key={p.topic} style={{display:"flex",alignItems:"center",gap:10,background:p.stuck?"rgba(244,63,94,0.06)":"rgba(15,23,42,0.4)",border:`1px solid ${p.stuck?"rgba(244,63,94,0.2)":"rgba(148,163,184,0.05)"}`,borderRadius:8,padding:"8px 12px"}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0",width:100,flexShrink:0}}>{p.topic}</span>
                    <div style={{flex:1,height:4,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${p.pct}%`,borderRadius:99,background:p.stuck?"#F43F5E":ls.bar}}/></div>
                    <span style={{fontSize:11,fontWeight:700,color:p.stuck?"#FB7185":ls.color,width:35,textAlign:"right"}}>{p.pct}%</span>
                    <span style={{fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:99,color:ls.color,background:ls.bg}}>{ls.label}</span>
                    {p.stuck&&<span style={{fontSize:9,color:"#F43F5E"}}>⚠️</span>}
                  </div>
                );})}
              </div>
              {studentDetail.quiz_attempts.length>0&&(<>
                <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Recent Quizzes</div>
                <div style={{display:"grid",gap:4,marginBottom:16}}>
                  {studentDetail.quiz_attempts.slice(0,5).map((q,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(15,23,42,0.4)",borderRadius:7,padding:"7px 12px"}}>
                      <span style={{fontSize:11,color:"#94A3B8",flex:1}}>{q.topic}</span>
                      <span style={{fontSize:12,fontWeight:700,color:q.score/q.total>=0.7?"#34D399":q.score/q.total>=0.5?"#FBBF24":"#FB7185"}}>{q.score}/{q.total}</span>
                      <span style={{fontSize:10,color:"#475569"}}>{new Date(q.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </>)}
              <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Quick Actions</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={()=>{setStudentDetail(null);setAssignModal({title:"Custom Exercise",description:"Practice exercise assigned by teacher.",starter_code:"# Write your solution here\n",difficulty:"beginner",topic:studentDetail.stuck_topics[0]||"General"});setAssignStudent(String(studentDetail.student.id));}} style={{padding:"10px",borderRadius:9,border:"1px solid #8B5CF630",background:"#8B5CF610",color:"#8B5CF6",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"center"}}>Assign Exercise</button>
                <button onClick={()=>{setStudentDetail(null);setQuizTopic(studentDetail.stuck_topics[0]||"");}} style={{padding:"10px",borderRadius:9,border:"1px solid #3B82F630",background:"#3B82F610",color:"#3B82F6",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"center"}}>Generate Quiz</button>
              </div>
            </div>
          </>)}
        </div>
      </div>}
      <div style={{maxWidth:940,margin:"0 auto",display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
          {[{key:"students",label:"My Students",value:String(students.length||0),accent:"#3B82F6",e:"👥"},{key:"unassigned",label:"Unassigned",value:String(unassigned.length||0),accent:"#F59E0B",e:"🆓"},{key:"active",label:"Active Now",value:String([...students,...unassigned].filter(s=>s.active).length),accent:"#10B981",e:"⚡",pulse:true},{key:"struggling",label:"Struggling",value:String([...students,...unassigned].filter(s=>s.status==="Struggling").length+visible.length),accent:"#F43F5E",e:"⚠️"}].map(c=>(
            <div key={c.label} onClick={()=>setStatsExpanded(statsExpanded===c.key?null:c.key)} style={{background:statsExpanded===c.key?"rgba(30,41,59,0.7)":"rgba(30,41,59,0.5)",border:`1px solid ${statsExpanded===c.key?c.accent:c.accent+"20"}`,borderRadius:13,padding:"15px 14px",display:"flex",flexDirection:"column",gap:7,cursor:"pointer",transition:"all 0.2s ease"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:17}}>{c.e}</span>{c.pulse&&<span style={{width:7,height:7,borderRadius:"50%",background:"#10B981",animation:"pulse2 2s ease-in-out infinite",display:"inline-block"}}/>}</div>
              <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",letterSpacing:"-0.02em",lineHeight:1}}>{c.value}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{c.label} <span style={{fontSize:9,color:"#475569"}}>▼</span></div>
            </div>
          ))}
        </div>
        {statsExpanded&&(
          <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:14,padding:"16px",animation:"fadeIn 0.2s ease"}}>
            {statsExpanded==="students"&&(<>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:12}}>My Students ({students.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {students.map(s=>(
                  <div key={s.id} onClick={()=>openStudentDetail(s.id)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(15,23,42,0.5)",borderRadius:9,padding:"10px 12px",cursor:"pointer",transition:"border 0.15s",border:"1px solid transparent"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(148,163,184,0.2)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
                    <Avatar initials={s.initials} color={s.color} size={28}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{s.module}</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:s.mastery>=71?"#34D399":s.mastery>=41?"#FBBF24":"#FB7185"}}>{s.mastery}%</div>
                  </div>
                ))}
                {students.length===0&&<div style={{fontSize:12,color:"#64748B",padding:8}}>No students enrolled with you yet</div>}
              </div>
            </>)}
            {statsExpanded==="unassigned"&&(<>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Unassigned Students ({unassigned.length})</div>
              <div style={{fontSize:11,color:"#64748B",marginBottom:12}}>Students who haven't picked a mentor yet. You can help them or assign exercises.</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {unassigned.map(s=>(
                  <div key={s.id} onClick={()=>openStudentDetail(s.id)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(15,23,42,0.5)",borderRadius:9,padding:"10px 12px",cursor:"pointer",transition:"border 0.15s",border:"1px solid rgba(245,158,11,0.1)"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(245,158,11,0.25)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid rgba(245,158,11,0.1)"}>
                    <Avatar initials={s.initials} color={s.color} size={28}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{s.module}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:99,background:"rgba(245,158,11,0.1)",color:"#FBBF24"}}>unassigned</span>
                      <div style={{fontSize:12,fontWeight:700,color:s.mastery>=71?"#34D399":s.mastery>=41?"#FBBF24":"#FB7185"}}>{s.mastery}%</div>
                    </div>
                  </div>
                ))}
                {unassigned.length===0&&<div style={{fontSize:12,color:"#64748B",padding:8}}>All students have a mentor!</div>}
              </div>
            </>)}
            {statsExpanded==="mastery"&&(<>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:12}}>Mastery Distribution</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
                {[
                  {label:"Mastered (91-100%)",count:students.filter(s=>s.mastery>=91).length,color:"#60A5FA",bg:"rgba(96,165,250,0.1)"},
                  {label:"Proficient (71-90%)",count:students.filter(s=>s.mastery>=71&&s.mastery<91).length,color:"#34D399",bg:"rgba(52,211,153,0.1)"},
                  {label:"Learning (41-70%)",count:students.filter(s=>s.mastery>=41&&s.mastery<71).length,color:"#FBBF24",bg:"rgba(251,191,36,0.1)"},
                  {label:"Beginner (0-40%)",count:students.filter(s=>s.mastery<41).length,color:"#FB7185",bg:"rgba(251,113,133,0.1)"},
                ].map(l=>(
                  <div key={l.label} style={{background:l.bg,borderRadius:9,padding:"12px",textAlign:"center",border:`1px solid ${l.color}20`}}>
                    <div style={{fontSize:24,fontWeight:800,color:l.color}}>{l.count}</div>
                    <div style={{fontSize:10,color:l.color,marginTop:2}}>{l.label}</div>
                  </div>
                ))}
              </div>
            </>)}
            {statsExpanded==="active"&&(<>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:12}}>Active Students (last 30 min)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {students.filter(s=>s.active).map(s=>(
                  <div key={s.id} onClick={()=>openStudentDetail(s.id)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(15,23,42,0.5)",borderRadius:9,padding:"10px 12px",cursor:"pointer",transition:"border 0.15s",border:"1px solid transparent"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(148,163,184,0.2)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
                    <div style={{position:"relative"}}><Avatar initials={s.initials} color={s.color} size={28}/><span style={{position:"absolute",bottom:-1,right:-1,width:8,height:8,borderRadius:"50%",background:"#10B981",border:"2px solid #1E293B"}}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0"}}>{s.name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{s.module} — {s.mastery}%</div>
                    </div>
                  </div>
                ))}
                {students.filter(s=>s.active).length===0&&<div style={{fontSize:12,color:"#64748B",padding:8}}>No students active right now</div>}
              </div>
            </>)}
            {statsExpanded==="struggling"&&(<>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:12}}>Struggling Students</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {students.filter(s=>s.status==="Struggling"||s.status==="Needs Help").map(s=>(
                  <div key={s.id} onClick={()=>openStudentDetail(s.id)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(15,23,42,0.5)",borderRadius:9,padding:"10px 12px",borderLeft:`3px solid ${s.status==="Struggling"?"#F43F5E":"#F59E0B"}`,cursor:"pointer",transition:"opacity 0.15s"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <Avatar initials={s.initials} color={s.color} size={28}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0"}}>{s.name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{s.module}</div>
                    </div>
                    <Badge label={s.status} style={STATUS_STYLE[s.status]}/>
                  </div>
                ))}
                {students.filter(s=>s.status==="Struggling"||s.status==="Needs Help").length===0&&<div style={{fontSize:12,color:"#64748B",padding:8}}>No struggling students right now!</div>}
              </div>
            </>)}
          </div>
        )}
        <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)"}}>
            <span style={{fontSize:15}}>⚠️</span><span style={{fontSize:13,fontWeight:600,color:"#F1F5F9"}}>Struggle Alerts</span>
            <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"rgba(244,63,94,0.15)",color:"#FB7185",border:"1px solid rgba(244,63,94,0.25)"}}>{visible.length}</span>
            {!isDemo&&<span style={{fontSize:10,color:"#475569",marginLeft:"auto"}}>Auto-refresh 10s</span>}
          </div>
          {visible.length===0?<div style={{padding:"24px",textAlign:"center"}}><div style={{fontSize:22,marginBottom:5}}>🎉</div><div style={{fontSize:13,color:"#64748B"}}>No struggling students right now!</div></div>
          :visible.map((a,i)=>{
            const atype = ALERT_TYPE_LABELS[a.alert_type] || ALERT_TYPE_LABELS.repeated_error;
            return(
            <div key={a.id} style={{borderBottom:i<visible.length-1?"1px solid rgba(148,163,184,0.05)":"none",borderLeft:`3px solid ${atype.color}`,padding:"13px 15px",display:"flex",flexDirection:"column",gap:9}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <Avatar initials={a.initials} color={a.color} size={32}/>
                <div onClick={()=>{if(a.user_id)openStudentDetail(a.user_id);}} style={{flex:1,minWidth:0,cursor:a.user_id?"pointer":"default"}}><div style={{fontSize:13,fontWeight:600,color:"#E2E8F0",textDecoration:a.user_id?"underline":"none",textDecorationColor:"rgba(226,232,240,0.3)",textUnderlineOffset:2}}>{a.name}</div><div style={{fontSize:11,color:"#64748B"}}>{a.time}</div></div>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:atype.bg,color:atype.color,border:`1px solid ${atype.color}30`}}>{atype.label}</span>
                <button onClick={()=>resolveAlert(a.id)} title="Resolve" style={{padding:"4px 7px",borderRadius:6,border:"1px solid rgba(148,163,184,0.1)",background:"transparent",color:"#475569",fontSize:11,cursor:"pointer",flexShrink:0}}>✓</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#94A3B8"}}>Stuck on</span>
                <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0"}}>{a.topic}</span>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(244,63,94,0.1)",color:"#FB7185",border:"1px solid rgba(244,63,94,0.2)",marginLeft:"auto"}}>{a.attempts} attempts</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <button style={{padding:"7px 4px",borderRadius:7,border:"1px solid #3B82F630",background:"#3B82F612",color:"#3B82F6",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center"}}>View Code</button>
                <button onClick={()=>resolveAlert(a.id)} style={{padding:"7px 4px",borderRadius:7,border:"1px solid #10B98130",background:"#10B98112",color:"#10B981",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center"}}>Resolve</button>
                <button onClick={()=>setAssignModal({title:`Help: ${a.topic}`,description:`Practice exercise for ${a.topic} — assigned because you need extra practice.`,starter_code:`# Practice: ${a.topic}\n# Write your solution here\n`,difficulty:"beginner",topic:a.topic})} style={{padding:"7px 4px",borderRadius:7,border:"1px solid #8B5CF630",background:"#8B5CF612",color:"#8B5CF6",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center"}}>Assign</button>
              </div>
            </div>
          );})}
        </div>
        <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:13,fontWeight:600,color:"#F1F5F9"}}>Class Progress</span>
            <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:8,padding:"6px 10px"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:"transparent",border:"none",color:"#E2E8F0",fontSize:13,width:90,fontFamily:"inherit"}}/>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid rgba(148,163,184,0.06)"}}>
                {["Student","Mastery","Status"].map(h=><th key={h} style={{padding:"9px 15px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#475569"}}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map((s,i)=>(
                <tr key={s.id} onClick={()=>openStudentDetail(s.id)} style={{borderBottom:i<filtered.length-1?"1px solid rgba(148,163,184,0.04)":"none",cursor:"pointer",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(148,163,184,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 15px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={s.initials} color={s.color} size={26}/><div><div style={{fontSize:13,fontWeight:500,color:"#E2E8F0"}}>{s.name}</div><div style={{fontSize:10,color:"#475569"}}>{s.module}</div></div></div></td>
                  <td style={{padding:"10px 15px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:64,height:3,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${s.mastery}%`,borderRadius:99,background:s.mastery>=71?"#10B981":s.mastery>=41?"#F59E0B":"#F43F5E"}}/></div><span style={{fontSize:12,fontWeight:600,color:s.mastery>=71?"#34D399":s.mastery>=41?"#FBBF24":"#FB7185"}}>{s.mastery}%</span></div></td>
                  <td style={{padding:"10px 15px"}}><Badge label={s.status} style={STATUS_STYLE[s.status]}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden",marginBottom:4}}>
          <div style={{padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)"}}><div style={{fontSize:13,fontWeight:600,color:"#F1F5F9"}}>✦ Generate Exercises with AI</div><div style={{fontSize:11,color:"#475569",marginTop:1}}>Describe what you need — AI generates it, then assign to students</div></div>
          <div style={{padding:"15px"}}>
            <div style={{display:"flex",gap:8,marginBottom:generatedEx?14:0,flexWrap:"wrap"}}>
              <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generateExercise()} placeholder="e.g. list comprehensions for beginners…" style={{flex:1,minWidth:140,background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,padding:"9px 12px",color:"#E2E8F0",fontSize:13,fontFamily:"inherit"}}/>
              <button onClick={generateExercise} style={{padding:"9px 16px",borderRadius:9,border:"none",background:generating?"rgba(16,185,129,0.15)":"linear-gradient(135deg,#059669,#10B981)",color:generating?"#34D399":"white",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                {generating?<><span style={{width:12,height:12,border:"2px solid #34D399",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Generating…</>:"✦ Generate"}
              </button>
            </div>
            {generatedEx&&<div style={{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:11,overflow:"hidden",animation:"fadein 0.25s ease"}}>
              <div style={{padding:"11px 14px",borderBottom:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
                <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{generatedEx.title}</div>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(251,191,36,0.12)",color:"#FBBF24",border:"1px solid rgba(251,191,36,0.25)"}}>⚡ {generatedEx.difficulty}</span>
              </div>
              {generatedEx.description&&<div style={{padding:"10px 14px",fontSize:12,color:"#94A3B8",borderBottom:"1px solid rgba(148,163,184,0.04)"}}>{generatedEx.description}</div>}
              <div style={{background:"#0D1117",padding:"10px 0",fontFamily:"monospace",overflowX:"auto"}}>
                {(generatedEx.starter_code||generatedEx.starter||"").split("\n").map((line,i)=><div key={i} style={{display:"flex",lineHeight:"20px"}}><span style={{userSelect:"none",width:34,textAlign:"right",paddingRight:10,fontSize:11,color:"#3E4451",flexShrink:0}}>{i+1}</span><span style={{fontSize:11,color:"#ABB2BF"}} dangerouslySetInnerHTML={{__html:hl(line)||"&nbsp;"}}/></div>)}
              </div>
              <div style={{padding:"11px 14px",borderTop:"1px solid rgba(148,163,184,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:9}}>
                <pre style={{fontFamily:"monospace",fontSize:12,color:"#34D399",lineHeight:1.6,margin:0}}>{generatedEx.expected_output||generatedEx.expected||""}</pre>
                <button onClick={()=>setAssignModal(generatedEx)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#2563EB,#3B82F6)",color:"white",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>Assign to Student →</button>
              </div>
            </div>}
          </div>
        </div>
        <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden",marginBottom:4}}>
          <div style={{padding:"13px 15px",borderBottom:"1px solid rgba(148,163,184,0.06)"}}><div style={{fontSize:13,fontWeight:600,color:"#F1F5F9"}}>✦ Generate Quiz for Students</div><div style={{fontSize:11,color:"#475569",marginTop:1}}>AI-generated MCQ quizzes — auto-graded when students complete them</div></div>
          <div style={{padding:"15px"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:genQuizResult?12:0}}>
              <select value={quizTopic} onChange={e=>setQuizTopic(e.target.value)} style={{flex:1,minWidth:120,padding:"9px 12px",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,color:"#E2E8F0",fontSize:13,fontFamily:"inherit"}}>
                <option value="">Topic…</option>
                {["Variables","Data Types","Loops","Lists","Functions","OOP","Error Handling","Libraries"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <select value={quizDiff} onChange={e=>setQuizDiff(e.target.value)} style={{padding:"9px 12px",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,color:"#E2E8F0",fontSize:13,fontFamily:"inherit"}}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button onClick={async()=>{if(!quizTopic||genQuiz)return;setGenQuiz(true);try{const r=await fetch("/api/quizzes/generate",{method:"POST",headers:authHeaders,body:JSON.stringify({topic:quizTopic,difficulty:quizDiff,num_questions:5})});const d=await r.json();if(d.quiz_id)setGenQuizResult(d);}catch{}setGenQuiz(false);}} style={{padding:"9px 16px",borderRadius:9,border:"none",background:quizTopic&&!genQuiz?"linear-gradient(135deg,#7C3AED,#8B5CF6)":"rgba(148,163,184,0.1)",color:quizTopic&&!genQuiz?"white":"#475569",fontSize:13,fontWeight:600,cursor:quizTopic?"pointer":"default",display:"flex",alignItems:"center",gap:7}}>
                {genQuiz?<><span style={{width:12,height:12,border:"2px solid #C4B5FD",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Creating…</>:"✦ Generate Quiz"}
              </button>
            </div>
            {genQuizResult&&<div style={{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:11,padding:"12px 14px"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>{genQuizResult.title}</div>
              <div style={{fontSize:12,color:"#94A3B8",marginBottom:8}}>{genQuizResult.questions?.length||0} questions — Students can access it from their Exercises tab</div>
              <div style={{fontSize:11,color:"#34D399"}}>Quiz created and available for all students!</div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESS PAGE (Sidebar)
// ══════════════════════════════════════════════════════════════════════════════
function TeacherProgressPage({ user }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetch("/api/teacher/class-progress", { headers: authHeaders })
      .then(r => r.json()).then(d => { if (!d.error) setData(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={28} color="#3B82F6"/><span style={{fontSize:12,color:"#64748B"}}>Loading class analytics...</span></div>;
  if (!data) return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B"}}>Failed to load class data</div>;

  const o = data.overview;
  const dist = data.distribution;
  const totalInDist = dist.Beginner + dist.Learning + dist.Proficient + dist.Mastered;
  const distColors = { Beginner: "#F43F5E", Learning: "#FBBF24", Proficient: "#10B981", Mastered: "#3B82F6" };

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#F1F5F9",marginBottom:16}}>Class Analytics</div>

        {/* Overview Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:20}}>
          {[
            {e:"\ud83d\udc65",v:String(o.total_students),l:"Students",sub:"Total enrolled"},
            {e:"\ud83c\udfaf",v:o.avg_mastery+"%",l:"Avg Mastery",sub:"Class average"},
            {e:"\ud83d\udcdd",v:String(o.total_exercises),l:"Exercises",sub:"Total assigned"},
            {e:"\ud83d\udccb",v:String(o.total_quizzes),l:"Quizzes",sub:"Total created"},
          ].map(s=>(
            <div key={s.l} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:6}}>{s.e}</div>
              <div style={{fontSize:22,fontWeight:800,color:"#E2E8F0"}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:600,color:"#64748B",textTransform:"uppercase",marginTop:2}}>{s.l}</div>
              <div style={{fontSize:9,color:"#475569",marginTop:1}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Mastery Distribution */}
        <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>Mastery Distribution</div>
        <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"16px",marginBottom:20}}>
          {totalInDist > 0 ? (
            <>
              <div style={{display:"flex",height:24,borderRadius:8,overflow:"hidden",marginBottom:12}}>
                {Object.entries(dist).map(([level, count]) => count > 0 ? (
                  <div key={level} style={{width:`${(count/totalInDist)*100}%`,background:distColors[level],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",minWidth:count>0?20:0}}>{count}</div>
                ) : null)}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                {Object.entries(dist).map(([level, count]) => (
                  <div key={level} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:99,background:distColors[level]}}/>
                    <span style={{fontSize:11,color:"#94A3B8"}}>{level}: <span style={{fontWeight:700,color:"#E2E8F0"}}>{count}</span></span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{fontSize:12,color:"#64748B",textAlign:"center",padding:8}}>No student data yet</div>}
        </div>

        {/* Per-Topic Class Performance */}
        <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>Topic Performance (Class Average)</div>
        <div style={{display:"grid",gap:6,marginBottom:20}}>
          {data.topics.length > 0 ? data.topics.map(t => {
            const lvl = t.avg_score >= 91 ? "Mastered" : t.avg_score >= 71 ? "Proficient" : t.avg_score >= 41 ? "Learning" : "Beginner";
            const ls = LEVEL[lvl] || LEVEL.Beginner;
            return (
              <div key={t.topic} style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{t.topic}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:9,color:"#64748B"}}>{t.student_count} students</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,color:ls.color,background:ls.bg,border:`1px solid ${ls.border}`}}>{ls.label}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${t.avg_score}%`,borderRadius:99,background:ls.bar,transition:"width 0.3s"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:ls.color,width:35,textAlign:"right"}}>{t.avg_score}%</span>
                </div>
              </div>
            );
          }) : <div style={{fontSize:12,color:"#64748B",textAlign:"center",padding:12}}>No topic data yet</div>}
        </div>

        {/* Top Performers & Struggling — side by side */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:8}}>Top Performers</div>
            <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"10px"}}>
              {data.top_performers.length > 0 ? data.top_performers.map((s,i) => (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",borderBottom:i<data.top_performers.length-1?"1px solid rgba(148,163,184,0.06)":"none"}}>
                  <span style={{fontSize:12,fontWeight:700,color:i===0?"#FBBF24":i===1?"#94A3B8":i===2?"#CD7F32":"#64748B",width:16}}>{i+1}.</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0",flex:1}}>{s.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#10B981"}}>{s.avg_mastery}%</span>
                </div>
              )) : <div style={{fontSize:11,color:"#64748B",textAlign:"center",padding:8}}>No data yet</div>}
            </div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:8}}>Need Attention</div>
            <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"10px"}}>
              {data.struggling.length > 0 ? data.struggling.map((s,i) => (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",borderBottom:i<data.struggling.length-1?"1px solid rgba(148,163,184,0.06)":"none"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0",flex:1}}>{s.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#F43F5E"}}>{s.avg_mastery}%</span>
                  {s.alert_count > 0 && <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,background:"rgba(244,63,94,0.15)",color:"#FB7185"}}>{s.alert_count} alerts</span>}
                </div>
              )) : <div style={{fontSize:11,color:"#64748B",textAlign:"center",padding:8}}>No struggling students</div>}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>Recent Activity</div>
        <div style={{display:"grid",gap:6,marginBottom:20}}>
          {[...data.recent_quizzes.map(q => ({type:"quiz",name:q.student,detail:`${q.topic} - ${q.score}/${q.total}`,date:q.date,color:"#8B5CF6"})),
            ...data.recent_exercises.map(e => ({type:"exercise",name:e.student,detail:`${e.title||e.topic} - ${e.status}${e.grade?` (${e.grade}%)`:""  }`,date:e.date,color:"#3B82F6"}))
          ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,10).map((item,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:9,padding:"10px 14px"}}>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:6,background:item.type==="quiz"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",color:item.color}}>{item.type}</span>
              <span style={{fontSize:12,fontWeight:600,color:"#E2E8F0"}}>{item.name}</span>
              <span style={{fontSize:11,color:"#94A3B8",flex:1}}>{item.detail}</span>
              <span style={{fontSize:10,color:"#64748B"}}>{item.date?new Date(item.date).toLocaleDateString():""}</span>
            </div>
          ))}
          {data.recent_quizzes.length === 0 && data.recent_exercises.length === 0 && (
            <div style={{fontSize:12,color:"#64748B",textAlign:"center",padding:12}}>No recent activity yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressPage({ user, role }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [topics, setTopics] = useState([]);
  const [execStats, setExecStats] = useState({ total: 0, successes: 0, streak: 0, active_days: 0 });
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState(null);

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 3) setLoading(false); };
    fetch("/api/progress", { headers: authHeaders }).then(r => r.json()).then(d => { if (d && d.topics) setTopics(d.topics); }).catch(() => {}).finally(done);
    fetch("/api/submissions", { headers: authHeaders }).then(r => r.json()).then(d => { if (d && d.stats) setExecStats(d.stats); }).catch(() => {}).finally(done);
    fetch("/api/quizzes", { headers: authHeaders }).then(r => r.json()).then(d => { if (d && d.quizzes) setQuizHistory(d.quizzes); }).catch(() => {}).finally(done);
  }, []);

  if (role === "teacher") return <TeacherProgressPage user={user} />;

  if (loading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={28} color="#3B82F6"/><span style={{fontSize:12,color:"#64748B"}}>Loading progress...</span></div>;

  const avgMastery = topics.length ? Math.round(topics.reduce((a, t) => a + t.pct, 0) / topics.length) : 0;
  const topicsStarted = topics.filter(t => t.pct > 0).length;
  const successRate = execStats.total ? Math.round(execStats.successes / execStats.total * 100) : 0;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#F1F5F9",marginBottom:16}}>Your Progress</div>
        <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:140,background:"rgba(30,41,59,0.5)",borderRadius:14,padding:"18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
              <Ring pct={avgMastery} size={72} stroke={6}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18,fontWeight:800,color:"#F1F5F9"}}>{avgMastery}%</span>
              </div>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{user?.name || "Student"}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{topicsStarted} of {topics.length} topics started</div>
              <div style={{fontSize:11,color:"#64748B",marginTop:2}}>Level: {avgMastery >= 91 ? "Mastered" : avgMastery >= 71 ? "Proficient" : avgMastery >= 41 ? "Learning" : "Beginner"}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:20}}>
          {[
            {e:"🔥",v:execStats.streak+"d",l:"Streak",sub:"Consecutive days"},
            {e:"📝",v:String(execStats.total),l:"Code Runs",sub:"Total executions"},
            {e:"✅",v:successRate+"%",l:"Success Rate",sub:`${execStats.successes} passed`},
            {e:"📅",v:String(execStats.active_days),l:"Active Days",sub:"Total days active"},
            {e:"📚",v:String(topicsStarted),l:"Topics",sub:`of ${topics.length} total`},
            {e:"🏆",v:String(quizHistory.length),l:"Quizzes",sub:"Attempted"},
          ].map(s=>(
            <div key={s.l} style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:4}}>{s.e}</div>
              <div style={{fontSize:18,fontWeight:800,color:"#E2E8F0"}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:600,color:"#64748B",textTransform:"uppercase"}}>{s.l}</div>
              <div style={{fontSize:9,color:"#475569",marginTop:1}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>Topic Breakdown</div>
        <div style={{display:"grid",gap:8,marginBottom:20}}>
          {topics.map(t => {const ls=LEVEL[t.level]||LEVEL.Beginner;const isExp=expandedTopic===t.name;return(
            <div key={t.name} onClick={()=>setExpandedTopic(isExp?null:t.name)} style={{background:isExp?"rgba(30,41,59,0.6)":"rgba(30,41,59,0.4)",border:`1px solid ${isExp?ls.border:"rgba(148,163,184,0.07)"}`,borderRadius:11,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s ease"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:14,fontWeight:600,color:"#E2E8F0"}}>{t.name}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,color:ls.color,background:ls.bg,border:`1px solid ${ls.border}`}}>{ls.label}</span>
                  <span style={{fontSize:10,color:"#64748B",transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:4,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${t.pct}%`,borderRadius:99,background:ls.bar,transition:"width 0.3s"}}/></div>
                <span style={{fontSize:13,fontWeight:700,color:ls.color,width:35,textAlign:"right"}}>{t.pct}%</span>
              </div>
              {isExp&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(148,163,184,0.1)"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {label:"Exercises",value:t.exercises_completed||0,weight:"40%",color:"#3B82F6"},
                      {label:"Quizzes",value:t.quiz_score||0,weight:"30%",color:"#8B5CF6"},
                      {label:"Code Quality",value:t.code_quality||0,weight:"20%",color:"#10B981"},
                      {label:"Streak",value:Math.min((t.streak||0)*10,100),weight:"10%",color:"#F59E0B"},
                    ].map(m=>(
                      <div key={m.label} style={{background:"rgba(15,23,42,0.5)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:"#94A3B8"}}>{m.label}</span>
                          <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.value}%</span>
                        </div>
                        <div style={{height:3,borderRadius:99,background:"rgba(148,163,184,0.08)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${m.value}%`,borderRadius:99,background:m.color,transition:"width 0.3s ease"}}/>
                        </div>
                        <div style={{fontSize:9,color:"#475569",marginTop:3}}>Weight: {m.weight}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );})}
        </div>
        {quizHistory.length>0&&(<>
          <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>Quiz History</div>
          <div style={{display:"grid",gap:6,marginBottom:20}}>
            {quizHistory.slice(0,10).map((q,i)=>(
              <div key={q.id||i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:9,padding:"10px 14px"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0",flex:1}}>{q.topic||"General"}</span>
                <span style={{fontSize:10,padding:"2px 6px",borderRadius:6,background:q.difficulty==="advanced"?"rgba(244,63,94,0.1)":q.difficulty==="intermediate"?"rgba(251,191,36,0.1)":"rgba(52,211,153,0.1)",color:q.difficulty==="advanced"?"#FB7185":q.difficulty==="intermediate"?"#FBBF24":"#34D399",fontWeight:600}}>{q.difficulty||"beginner"}</span>
                <span style={{fontSize:12,color:"#64748B"}}>{q.created_at?new Date(q.created_at).toLocaleDateString():""}</span>
              </div>
            ))}
          </div>
        </>)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHERS PAGE (Sidebar — Students browse & pick mentor)
// ══════════════════════════════════════════════════════════════════════════════
function TeachersPage({ user }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [teachers, setTeachers] = useState([]);
  const [myMentorId, setMyMentorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch("/api/teachers/list", { headers: authHeaders })
      .then(r => r.json()).then(d => { if (d.teachers) { setTeachers(d.teachers); setMyMentorId(d.my_mentor_id); } })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const enroll = async (teacherId) => {
    setEnrolling(true);
    try {
      const res = await fetch("/api/teachers/enroll", {
        method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: teacherId })
      });
      if (res.ok) {
        setMyMentorId(teacherId);
        setTeachers(prev => prev.map(t => ({ ...t, is_my_mentor: t.id === teacherId, student_count: t.id === teacherId ? t.student_count + 1 : (t.is_my_mentor ? t.student_count - 1 : t.student_count) })));
        setSelectedTeacher(null);
        setToast({ message: "Mentor selected successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {}
    setEnrolling(false);
  };

  if (loading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={28} color="#3B82F6"/><span style={{fontSize:12,color:"#64748B"}}>Loading teachers...</span></div>;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#F1F5F9",marginBottom:4}}>Faculty</div>
        <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>
          {myMentorId ? "You have a mentor. You can switch anytime." : "Choose a mentor to get personalized guidance."}
        </div>

        {/* Current mentor banner */}
        {myMentorId && (() => {
          const mentor = teachers.find(t => t.id === myMentorId);
          if (!mentor) return null;
          return (
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#10B981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white",flexShrink:0}}>{mentor.initials}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{mentor.name}</div>
                <div style={{fontSize:11,color:"#34D399"}}>Your current mentor</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99,background:"rgba(16,185,129,0.12)",color:"#34D399"}}>Enrolled</span>
            </div>
          );
        })()}

        {/* Teacher list */}
        <div style={{display:"grid",gap:10}}>
          {teachers.map(t => (
            <div key={t.id} onClick={() => setSelectedTeacher(t)}
              style={{background:t.is_my_mentor?"rgba(16,185,129,0.04)":"rgba(30,41,59,0.4)",border:`1px solid ${t.is_my_mentor?"rgba(16,185,129,0.15)":"rgba(148,163,184,0.07)"}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.is_my_mentor?"rgba(16,185,129,0.3)":"rgba(59,130,246,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.is_my_mentor?"rgba(16,185,129,0.15)":"rgba(148,163,184,0.07)";}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${t.color},${t.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{t.initials}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14,fontWeight:600,color:"#E2E8F0"}}>{t.name}</span>
                    {t.is_my_mentor && <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"rgba(16,185,129,0.12)",color:"#34D399"}}>My Mentor</span>}
                  </div>
                  <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{t.specialization || "Python Instructor"}</div>
                  <div style={{display:"flex",gap:10,marginTop:4,fontSize:10,color:"#475569"}}>
                    <span>{t.student_count} student{t.student_count!==1?"s":""}</span>
                    {t.experience && <><span>·</span><span>{t.experience}</span></>}
                  </div>
                </div>
                <span style={{fontSize:14,color:"#64748B"}}>→</span>
              </div>
            </div>
          ))}
          {teachers.length === 0 && <div style={{fontSize:12,color:"#64748B",textAlign:"center",padding:20}}>No teachers available yet.</div>}
        </div>
      </div>

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <div onClick={() => setSelectedTeacher(null)} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadein 0.2s ease"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0F172A",border:"1px solid rgba(148,163,184,0.15)",borderRadius:18,padding:"28px 24px",maxWidth:480,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 24px 64px -16px rgba(0,0,0,0.6)"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${selectedTeacher.color},${selectedTeacher.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"white",flexShrink:0}}>{selectedTeacher.initials}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:700,color:"#F1F5F9"}}>{selectedTeacher.name}</div>
                <div style={{fontSize:12,color:"#64748B"}}>{selectedTeacher.specialization || "Python Instructor"}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:2}}>{selectedTeacher.student_count} student{selectedTeacher.student_count!==1?"s":""} enrolled</div>
              </div>
              <button onClick={() => setSelectedTeacher(null)} style={{width:30,height:30,borderRadius:8,border:"1px solid rgba(148,163,184,0.1)",background:"rgba(30,41,59,0.6)",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>x</button>
            </div>

            {/* Bio */}
            {selectedTeacher.bio && (
              <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",marginBottom:6}}>About</div>
                <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7}}>{selectedTeacher.bio}</div>
              </div>
            )}

            {/* Details */}
            <div style={{display:"grid",gap:8,marginBottom:16}}>
              {[
                { label: "Education", value: selectedTeacher.education, icon: "🎓" },
                { label: "Experience", value: selectedTeacher.experience, icon: "💼" },
                { label: "Specialization", value: selectedTeacher.specialization, icon: "🎯" },
                { label: "Achievements", value: selectedTeacher.achievements, icon: "🏆" },
              ].filter(d => d.value).map(d => (
                <div key={d.label} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:16,flexShrink:0}}>{d.icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{d.label}</div>
                    <div style={{fontSize:12,color:"#CBD5E1",lineHeight:1.6}}>{d.value}</div>
                  </div>
                </div>
              ))}
              {!selectedTeacher.education && !selectedTeacher.experience && !selectedTeacher.specialization && !selectedTeacher.achievements && !selectedTeacher.bio && (
                <div style={{fontSize:12,color:"#475569",textAlign:"center",padding:12}}>This teacher hasn't completed their profile yet.</div>
              )}
            </div>

            {/* Enroll button */}
            {selectedTeacher.is_my_mentor ? (
              <div style={{padding:"12px",borderRadius:10,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",textAlign:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#34D399"}}>This is your current mentor ✓</span>
              </div>
            ) : (
              <button onClick={() => enroll(selectedTeacher.id)} disabled={enrolling}
                style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1D4ED8,#2563EB)",color:"white",fontWeight:600,fontSize:13,cursor:"pointer",opacity:enrolling?0.7:1}}>
                {enrolling ? "Enrolling..." : myMentorId ? "Switch to This Mentor" : "Choose as My Mentor"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEARN PAGE (Sidebar — Students only)
// ══════════════════════════════════════════════════════════════════════════════
const LEARN_TOPICS = ["Variables","Data Types","Loops","Lists","Functions","OOP","Error Handling","Libraries"];

const BUILD_ASSIGNMENTS = {
  "Variables": { title: "Build a Calculator", desc: "Create a calculator that takes two numbers and an operator (+, -, *, /) from the user and displays the result. Handle division by zero.", starter: "# Calculator App\n# Ask user for two numbers and an operator\n# Print the result\n\nnum1 = float(input('Enter first number: '))\noperator = input('Enter operator (+, -, *, /): ')\nnum2 = float(input('Enter second number: '))\n\n# Your code here\n" },
  "Data Types": { title: "Build a Type Converter", desc: "Create a program that takes user input and converts it to different data types (int, float, string, bool, list). Display the converted values and their types.", starter: "# Type Converter\n# Take input and show conversions\n\nuser_input = input('Enter a value: ')\n\n# Convert and display each type\n# Your code here\n" },
  "Loops": { title: "Build a Number Guessing Game", desc: "Create a game where the computer picks a random number (1-100) and the player guesses. Give hints (too high/low). Track number of attempts.", starter: "# Number Guessing Game\nimport random\n\nsecret = random.randint(1, 100)\nattempts = 0\n\nprint('I picked a number between 1 and 100!')\n\n# Your game loop here\n" },
  "Lists": { title: "Build a Contact Book", desc: "Create a contact book that can add, search, delete, and list contacts. Each contact has a name, phone, and email. Use a list of dictionaries.", starter: "# Contact Book\ncontacts = []\n\ndef add_contact(name, phone, email):\n    # Your code here\n    pass\n\ndef search_contact(name):\n    # Your code here\n    pass\n\ndef list_contacts():\n    # Your code here\n    pass\n\n# Test your contact book\nadd_contact('Alice', '555-0101', 'alice@email.com')\nadd_contact('Bob', '555-0102', 'bob@email.com')\nlist_contacts()\nprint(search_contact('Alice'))\n" },
  "Functions": { title: "Build a Password Generator", desc: "Create a function that generates random passwords with configurable length, uppercase, lowercase, numbers, and special characters. Include a strength checker.", starter: "# Password Generator\nimport random\nimport string\n\ndef generate_password(length=12, uppercase=True, numbers=True, special=True):\n    # Your code here\n    pass\n\ndef check_strength(password):\n    # Return: weak, medium, or strong\n    pass\n\n# Test\npwd = generate_password(16)\nprint(f'Password: {pwd}')\nprint(f'Strength: {check_strength(pwd)}')\n" },
  "OOP": { title: "Build a Bank Account System", desc: "Create a BankAccount class with deposit, withdraw, transfer methods. Add an InterestAccount subclass. Track transaction history.", starter: "# Bank Account System\n\nclass BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n        self.history = []\n\n    def deposit(self, amount):\n        # Your code here\n        pass\n\n    def withdraw(self, amount):\n        # Your code here\n        pass\n\n    def transfer(self, other, amount):\n        # Your code here\n        pass\n\nclass InterestAccount(BankAccount):\n    def __init__(self, owner, balance=0, rate=0.05):\n        super().__init__(owner, balance)\n        self.rate = rate\n\n    def apply_interest(self):\n        # Your code here\n        pass\n\n# Test\nacc1 = BankAccount('Alice', 1000)\nacc2 = InterestAccount('Bob', 500)\nacc1.deposit(200)\nacc1.transfer(acc2, 300)\nacc2.apply_interest()\nprint(f'{acc1.owner}: ${acc1.balance}')\nprint(f'{acc2.owner}: ${acc2.balance}')\n" },
  "Error Handling": { title: "Build a Safe Input Validator", desc: "Create a robust input validator that handles: number parsing, email format, date parsing, age range. Every function must use try/except with specific error types.", starter: "# Safe Input Validator\n\ndef get_number(prompt):\n    # Keep asking until valid number\n    # Handle ValueError\n    pass\n\ndef validate_email(email):\n    # Check format, raise ValueError if invalid\n    pass\n\ndef validate_age(age_str):\n    # Must be int, 0-150 range\n    # Handle ValueError, out of range\n    pass\n\n# Test all validators\ntry:\n    validate_email('test@example.com')\n    print('Email valid!')\n    validate_age('25')\n    print('Age valid!')\n    validate_age('200')\nexcept ValueError as e:\n    print(f'Error: {e}')\n" },
  "Libraries": { title: "Build a Weather App", desc: "Create a program that uses the json and datetime libraries to process weather data. Parse a JSON weather forecast, display formatted output with dates.", starter: "# Weather App\nimport json\nfrom datetime import datetime, timedelta\n\n# Sample weather data (simulating API response)\nweather_json = '''\n{\n  \"city\": \"San Francisco\",\n  \"forecast\": [\n    {\"date\": \"2024-01-15\", \"temp_high\": 15, \"temp_low\": 8, \"condition\": \"Sunny\"},\n    {\"date\": \"2024-01-16\", \"temp_high\": 13, \"temp_low\": 7, \"condition\": \"Cloudy\"},\n    {\"date\": \"2024-01-17\", \"temp_high\": 11, \"temp_low\": 6, \"condition\": \"Rainy\"}\n  ]\n}\n'''\n\n# Parse and display weather\n# Your code here\n" },
};

function LearnPage({ user }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("lesson");
  const [loading, setLoading] = useState(true);
  const [practiceCode, setPracticeCode] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const [runningEx, setRunningEx] = useState(null);
  const [extraExercises, setExtraExercises] = useState([]);
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [buildCode, setBuildCode] = useState("");
  const [buildResult, setBuildResult] = useState(null);
  const [buildRunning, setBuildRunning] = useState(false);
  const [toast, setToast] = useState(null);

  const loadStatus = () => {
    fetch("/api/learn/status", { headers: authHeaders })
      .then(r => r.json()).then(d => { if (d.topics) setTopics(d.topics); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadStatus, []);

  const openTopic = (t) => {
    if (!t.unlocked) return;
    setActiveTopic(t);
    setActiveStep(t.current_step === "done" ? "lesson" : t.current_step);
    setLesson(null);
    setLessonLoading(true);
    setPracticeResults({});
    setPracticeCode({});
    setExtraExercises([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setBuildCode(BUILD_ASSIGNMENTS[t.topic]?.starter || "# Your code here\n");
    setBuildResult(null);
    fetch(`/api/learn/topic?topic=${encodeURIComponent(t.topic)}`, { headers: authHeaders })
      .then(r => r.json()).then(d => { if (d.lesson) setLesson(d.lesson); })
      .catch(() => {}).finally(() => setLessonLoading(false));
  };

  const markComplete = async (step) => {
    await fetch("/api/learn/complete", {
      method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ topic: activeTopic.topic, step })
    });
    loadStatus();
    setToast({ message: `${step.charAt(0).toUpperCase() + step.slice(1)} completed!`, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const runExercise = async (idx) => {
    const allExercises = [...(lesson?.practice_exercises || []), ...extraExercises];
    const code = practiceCode[idx] || allExercises[idx]?.starter_code || "";
    setRunningEx(idx);
    try {
      const res = await fetch("/api/execute", {
        method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setPracticeResults(prev => ({ ...prev, [idx]: { output: data.output || data.error || "No output", success: !data.error } }));
    } catch { setPracticeResults(prev => ({ ...prev, [idx]: { output: "Execution failed", success: false } })); }
    setRunningEx(null);
  };

  const generateMore = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/learn/practice", {
        method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic.topic, difficulty: genDifficulty })
      });
      const data = await res.json();
      if (data.exercise) setExtraExercises(prev => [...prev, data.exercise]);
    } catch {}
    setGenerating(false);
  };

  const runBuild = async () => {
    setBuildRunning(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ code: buildCode })
      });
      const data = await res.json();
      setBuildResult({ output: data.output || data.error || "No output", success: !data.error });
    } catch { setBuildResult({ output: "Execution failed", success: false }); }
    setBuildRunning(false);
  };

  if (loading) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><LoadingSpinner size={28} color="#3B82F6"/><span style={{fontSize:12,color:"#64748B"}}>Loading learning path...</span></div>;

  // Topic list view
  if (!activeTopic) {
    const completed = topics.filter(t => t.completed).length;
    return (
      <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{fontSize:18,fontWeight:800,color:"#F1F5F9",marginBottom:4}}>Learning Path</div>
          <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>{completed} of {topics.length} topics completed</div>
          <div style={{display:"flex",gap:4,marginBottom:20,height:6,borderRadius:99,overflow:"hidden",background:"rgba(148,163,184,0.08)"}}>
            {topics.map((t,i) => (
              <div key={i} style={{flex:1,background:t.completed?"#10B981":t.unlocked&&!t.completed?"#3B82F6":"transparent",borderRadius:99,transition:"background 0.3s"}}/>
            ))}
          </div>
          <div style={{display:"grid",gap:8}}>
            {topics.map((t,i) => {
              const isLocked = !t.unlocked;
              const isCurrent = t.unlocked && !t.completed;
              const isDone = t.completed;
              return (
                <div key={t.topic} onClick={() => openTopic(t)}
                  style={{background:isCurrent?"rgba(59,130,246,0.06)":isDone?"rgba(16,185,129,0.04)":"rgba(30,41,59,0.4)",
                    border:`1px solid ${isCurrent?"rgba(59,130,246,0.2)":isDone?"rgba(16,185,129,0.15)":"rgba(148,163,184,0.07)"}`,
                    borderRadius:12,padding:"16px 18px",cursor:isLocked?"not-allowed":"pointer",opacity:isLocked?0.5:1,transition:"all 0.2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,
                      background:isDone?"rgba(16,185,129,0.12)":isCurrent?"rgba(59,130,246,0.12)":"rgba(148,163,184,0.08)",
                      color:isDone?"#10B981":isCurrent?"#3B82F6":"#475569",border:`1px solid ${isDone?"rgba(16,185,129,0.2)":isCurrent?"rgba(59,130,246,0.2)":"rgba(148,163,184,0.1)"}`}}>
                      {isDone?"✓":isLocked?"🔒":String(i+1).padStart(2,"0")}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:isLocked?"#475569":"#E2E8F0"}}>{t.topic}</div>
                      <div style={{fontSize:11,color:"#64748B",marginTop:2}}>
                        {isDone?"Completed":isCurrent?(t.current_step==="lesson"?"Start lesson":"Continue — "+t.current_step):"Complete previous topic to unlock"}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      {["lesson","practice","quiz","build"].map(s => (
                        <div key={s} style={{width:8,height:8,borderRadius:99,background:t[s+"_done"]?"#10B981":isCurrent&&t.current_step===s?"#3B82F6":"rgba(148,163,184,0.15)"}}/>
                      ))}
                    </div>
                    {!isLocked && <span style={{fontSize:14,color:"#64748B"}}>→</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active topic view
  const steps = [
    { id: "lesson", label: "Read", icon: "📖", done: activeTopic.lesson_done },
    { id: "practice", label: "Practice", icon: "💪", done: activeTopic.practice_done },
    { id: "quiz", label: "Prove", icon: "🏆", done: activeTopic.quiz_done },
    { id: "build", label: "Build", icon: "🛠️", done: activeTopic.build_done },
  ];
  const stepIdx = steps.findIndex(s => s.id === activeStep);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{maxWidth:700,margin:"0 auto"}}>
        {/* Back + Topic header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={() => { setActiveTopic(null); loadStatus(); }}
            style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(148,163,184,0.1)",background:"rgba(30,41,59,0.6)",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>←</button>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#F1F5F9"}}>{activeTopic.topic}</div>
            <div style={{fontSize:11,color:"#64748B"}}>Step {stepIdx+1} of 4 — {steps[stepIdx]?.label}</div>
          </div>
        </div>

        {/* Step tabs */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {steps.map(s => (
            <button key={s.id} onClick={() => setActiveStep(s.id)}
              style={{flex:1,padding:"10px 8px",borderRadius:10,border:`1px solid ${activeStep===s.id?"rgba(59,130,246,0.3)":"rgba(148,163,184,0.07)"}`,
                background:activeStep===s.id?"rgba(59,130,246,0.08)":"rgba(30,41,59,0.4)",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
              <div style={{fontSize:16,marginBottom:2}}>{s.done?"✅":s.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:activeStep===s.id?"#93C5FD":"#64748B"}}>{s.label}</div>
            </button>
          ))}
        </div>

        {lessonLoading && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:40}}><LoadingSpinner size={28} color="#3B82F6"/><span style={{fontSize:12,color:"#64748B"}}>Generating lesson...</span></div>}

        {/* ── LESSON STEP ── */}
        {!lessonLoading && lesson && activeStep === "lesson" && (
          <div style={{display:"grid",gap:14}}>
            <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"18px 20px"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>{lesson.title}</div>
              <div style={{fontSize:13,color:"#CBD5E1",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{lesson.explanation}</div>
            </div>
            <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"18px 20px"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#FBBF24",marginBottom:8}}>Why It Matters</div>
              <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7}}>{lesson.why_it_matters}</div>
            </div>
            <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(59,130,246,0.1)",borderRadius:12,padding:"18px 20px"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#60A5FA",marginBottom:8}}>Real-World Analogy</div>
              <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7}}>{lesson.real_world}</div>
            </div>
            {lesson.code_examples?.map((ex, i) => (
              <div key={i} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",marginBottom:8}}>Example {i+1}: {ex.title}</div>
                <pre style={{background:"rgba(15,23,42,0.7)",borderRadius:8,padding:"12px 14px",fontSize:12,color:"#93C5FD",overflow:"auto",marginBottom:8,fontFamily:"monospace",lineHeight:1.6}}>{ex.code}</pre>
                <div style={{fontSize:11,color:"#64748B"}}>{ex.explanation}</div>
              </div>
            ))}
            {lesson.key_rules?.length > 0 && (
              <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(245,158,11,0.1)",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#F59E0B",marginBottom:10}}>Key Rules</div>
                <div style={{display:"grid",gap:6}}>
                  {lesson.key_rules.map((r, i) => (
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{fontSize:11,color:"#F59E0B",flexShrink:0,marginTop:1}}>•</span>
                      <span style={{fontSize:12,color:"#94A3B8",lineHeight:1.6}}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!activeTopic.lesson_done && (
              <button onClick={() => { markComplete("lesson"); setActiveStep("practice"); setActiveTopic(prev => ({...prev, lesson_done: true, current_step: "practice"})); }}
                style={{padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1D4ED8,#2563EB)",color:"white",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Mark Lesson Complete & Continue to Practice →
              </button>
            )}
          </div>
        )}

        {/* ── PRACTICE STEP ── */}
        {!lessonLoading && lesson && activeStep === "practice" && (
          <div style={{display:"grid",gap:12}}>
            <div style={{fontSize:13,color:"#64748B",marginBottom:4}}>Complete the exercises below. Want more? Generate additional practice at any difficulty.</div>
            {[...(lesson.practice_exercises || []), ...extraExercises].map((ex, idx) => {
              const result = practiceResults[idx];
              const diffColor = ex.difficulty === "easy" ? "#10B981" : ex.difficulty === "medium" ? "#FBBF24" : "#F43F5E";
              return (
                <div key={idx} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:99,background:`${diffColor}15`,color:diffColor,textTransform:"uppercase"}}>{ex.difficulty}</span>
                    <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{ex.title}</span>
                    {idx >= (lesson.practice_exercises?.length || 0) && <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:99,background:"rgba(139,92,246,0.1)",color:"#A78BFA"}}>bonus</span>}
                  </div>
                  <div style={{fontSize:12,color:"#94A3B8",marginBottom:10,lineHeight:1.6}}>{ex.description}</div>
                  <textarea
                    value={practiceCode[idx] ?? ex.starter_code ?? ""}
                    onChange={e => setPracticeCode(prev => ({ ...prev, [idx]: e.target.value }))}
                    style={{width:"100%",minHeight:80,background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#93C5FD",fontFamily:"monospace",resize:"vertical",outline:"none"}}
                  />
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={() => runExercise(idx)} disabled={runningEx === idx}
                      style={{padding:"8px 16px",borderRadius:8,border:"none",background:"rgba(59,130,246,0.15)",color:"#60A5FA",fontWeight:600,fontSize:12,cursor:"pointer",opacity:runningEx===idx?0.6:1}}>
                      {runningEx === idx ? "Running..." : "Run Code"}
                    </button>
                  </div>
                  {result && (
                    <pre style={{marginTop:8,background:result.success?"rgba(16,185,129,0.06)":"rgba(244,63,94,0.06)",border:`1px solid ${result.success?"rgba(16,185,129,0.15)":"rgba(244,63,94,0.15)"}`,borderRadius:8,padding:"10px 12px",fontSize:11,color:result.success?"#34D399":"#FB7185",fontFamily:"monospace",overflow:"auto",whiteSpace:"pre-wrap"}}>{result.output}</pre>
                  )}
                </div>
              );
            })}

            {/* Generate More Practice */}
            <div style={{background:"rgba(30,41,59,0.5)",border:"1px dashed rgba(139,92,246,0.25)",borderRadius:12,padding:"16px 20px"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#A78BFA",marginBottom:10}}>Want More Practice?</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid rgba(148,163,184,0.1)"}}>
                  {["easy","medium","hard"].map(d => (
                    <button key={d} onClick={() => setGenDifficulty(d)}
                      style={{padding:"6px 12px",border:"none",fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize",
                        background:genDifficulty===d?"rgba(139,92,246,0.15)":"rgba(30,41,59,0.4)",
                        color:genDifficulty===d?"#A78BFA":"#64748B"}}>
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={generateMore} disabled={generating}
                  style={{padding:"7px 16px",borderRadius:8,border:"none",background:"rgba(139,92,246,0.15)",color:"#A78BFA",fontWeight:600,fontSize:12,cursor:"pointer",opacity:generating?0.6:1}}>
                  {generating ? "Generating..." : "Generate Exercise"}
                </button>
              </div>
            </div>

            {!activeTopic.practice_done && (
              <button onClick={() => { markComplete("practice"); setActiveStep("quiz"); setActiveTopic(prev => ({...prev, practice_done: true, current_step: "quiz"})); }}
                style={{padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1D4ED8,#2563EB)",color:"white",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Mark Practice Complete & Continue to Quiz →
              </button>
            )}
          </div>
        )}

        {/* ── QUIZ STEP ── */}
        {!lessonLoading && lesson && activeStep === "quiz" && (
          <div style={{display:"grid",gap:12}}>
            <div style={{fontSize:13,color:"#64748B",marginBottom:4}}>Answer these questions to prove your understanding. Score 70%+ to proceed to the final build.</div>
            {(lesson.key_rules || []).map((rule, idx) => {
              const isCorrect = quizSubmitted && quizAnswers[idx] === "true";
              return (
                <div key={idx} style={{background:"rgba(30,41,59,0.5)",border:`1px solid ${quizSubmitted?(isCorrect?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.2)"):"rgba(148,163,184,0.07)"}`,borderRadius:12,padding:"16px 18px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0",marginBottom:10}}>Q{idx+1}: Is this statement true about {activeTopic.topic}?</div>
                  <div style={{fontSize:12,color:"#CBD5E1",marginBottom:12,padding:"8px 12px",background:"rgba(15,23,42,0.5)",borderRadius:8,fontStyle:"italic"}}>"{rule}"</div>
                  <div style={{display:"flex",gap:8}}>
                    {["true","false"].map(opt => (
                      <button key={opt} onClick={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [idx]: opt}))}
                        style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${quizAnswers[idx]===opt?"rgba(59,130,246,0.3)":"rgba(148,163,184,0.1)"}`,
                          background:quizAnswers[idx]===opt?"rgba(59,130,246,0.1)":"rgba(30,41,59,0.4)",color:quizAnswers[idx]===opt?"#93C5FD":"#64748B",
                          fontWeight:600,fontSize:12,cursor:quizSubmitted?"default":"pointer",textTransform:"capitalize"}}>
                        {opt === "true" ? "True" : "False"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {!quizSubmitted ? (
              <button onClick={() => {
                const total = (lesson.key_rules || []).length;
                const correct = Object.values(quizAnswers).filter(a => a === "true").length;
                const score = total > 0 ? Math.round((correct / total) * 100) : 0;
                setQuizScore(score);
                setQuizSubmitted(true);
                if (score >= 70) {
                  markComplete("quiz");
                  setActiveTopic(prev => ({...prev, quiz_done: true, current_step: "build"}));
                }
              }}
                disabled={Object.keys(quizAnswers).length < (lesson.key_rules || []).length}
                style={{padding:"12px",borderRadius:10,border:"none",background:Object.keys(quizAnswers).length<(lesson.key_rules||[]).length?"rgba(148,163,184,0.1)":"linear-gradient(135deg,#1D4ED8,#2563EB)",
                  color:Object.keys(quizAnswers).length<(lesson.key_rules||[]).length?"#475569":"white",fontWeight:600,fontSize:13,cursor:Object.keys(quizAnswers).length<(lesson.key_rules||[]).length?"not-allowed":"pointer"}}>
                Submit Quiz
              </button>
            ) : (
              <div style={{background:quizScore>=70?"rgba(16,185,129,0.06)":"rgba(244,63,94,0.06)",border:`1px solid ${quizScore>=70?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.2)"}`,borderRadius:12,padding:"18px 20px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:quizScore>=70?"#10B981":"#F43F5E",marginBottom:6}}>{quizScore}%</div>
                <div style={{fontSize:13,color:quizScore>=70?"#34D399":"#FB7185",fontWeight:600}}>
                  {quizScore >= 70 ? "Passed! Continue to the Build challenge." : "Not quite — review the lesson and try again."}
                </div>
                {quizScore < 70 && (
                  <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}
                    style={{marginTop:12,padding:"8px 20px",borderRadius:8,border:"none",background:"rgba(244,63,94,0.12)",color:"#FB7185",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    Retry Quiz
                  </button>
                )}
                {quizScore >= 70 && (
                  <button onClick={() => setActiveStep("build")}
                    style={{marginTop:12,padding:"8px 20px",borderRadius:8,border:"none",background:"rgba(16,185,129,0.12)",color:"#34D399",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    Continue to Build →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── BUILD STEP ── */}
        {!lessonLoading && activeStep === "build" && (() => {
          const assignment = BUILD_ASSIGNMENTS[activeTopic.topic];
          if (!assignment) return <div style={{color:"#64748B",textAlign:"center",padding:40}}>No build assignment for this topic yet.</div>;
          return (
            <div style={{display:"grid",gap:14}}>
              <div style={{background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.08))",border:"1px solid rgba(139,92,246,0.2)",borderRadius:14,padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:20}}>🛠️</span>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{assignment.title}</div>
                    <div style={{fontSize:11,color:"#A78BFA",fontWeight:600}}>Final Project — {activeTopic.topic}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:"#CBD5E1",lineHeight:1.7,marginTop:8}}>{assignment.desc}</div>
              </div>

              <div style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#E2E8F0",marginBottom:8}}>Your Code</div>
                <textarea
                  value={buildCode}
                  onChange={e => setBuildCode(e.target.value)}
                  style={{width:"100%",minHeight:180,background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:8,padding:"12px 14px",fontSize:12,color:"#93C5FD",fontFamily:"monospace",resize:"vertical",outline:"none",lineHeight:1.6}}
                />
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={runBuild} disabled={buildRunning}
                    style={{padding:"8px 20px",borderRadius:8,border:"none",background:"rgba(59,130,246,0.15)",color:"#60A5FA",fontWeight:600,fontSize:12,cursor:"pointer",opacity:buildRunning?0.6:1}}>
                    {buildRunning ? "Running..." : "Run Code"}
                  </button>
                  {!activeTopic.build_done && (
                    <button onClick={() => { markComplete("build"); setActiveTopic(prev => ({...prev, build_done: true, current_step: "done", completed: true})); }}
                      style={{padding:"8px 20px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"white",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                      Submit & Complete Topic
                    </button>
                  )}
                </div>
                {buildResult && (
                  <pre style={{marginTop:10,background:buildResult.success?"rgba(16,185,129,0.06)":"rgba(244,63,94,0.06)",border:`1px solid ${buildResult.success?"rgba(16,185,129,0.15)":"rgba(244,63,94,0.15)"}`,borderRadius:8,padding:"10px 12px",fontSize:11,color:buildResult.success?"#34D399":"#FB7185",fontFamily:"monospace",overflow:"auto",whiteSpace:"pre-wrap"}}>{buildResult.output}</pre>
                )}
              </div>

              {activeTopic.build_done && (
                <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"18px 20px",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:6}}>🎉</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#10B981",marginBottom:4}}>Topic Complete!</div>
                  <div style={{fontSize:12,color:"#34D399",marginBottom:12}}>You've mastered {activeTopic.topic}. The next topic is now unlocked.</div>
                  <button onClick={() => { setActiveTopic(null); loadStatus(); }}
                    style={{padding:"8px 24px",borderRadius:8,border:"none",background:"rgba(16,185,129,0.12)",color:"#34D399",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    Back to Learning Path
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SNIPPETS PAGE (Sidebar)
// ══════════════════════════════════════════════════════════════════════════════
function SnippetsPage({ user, onLoadSnippet }) {
  const [snippets, setSnippets] = useState([]);
  const [starters, setStarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("mine"); // mine | starters
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const authHeaders = { Authorization: `Bearer ${typeof window!=="undefined"?localStorage.getItem("lf_token")||"":""}` };

  const load = () => {
    fetch("/api/snippets", { headers: authHeaders })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setSnippets(d.snippets||[]); setStarters(d.starters||[]); }})
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleStar = async (id) => {
    await fetch("/api/snippets", { method:"PATCH", headers:{"Content-Type":"application/json",...authHeaders}, body:JSON.stringify({id}) });
    setSnippets(prev => prev.map(s => s.id===id ? {...s, starred:!s.starred} : s));
  };

  const deleteSnippet = async (id) => {
    await fetch("/api/snippets", { method:"DELETE", headers:{"Content-Type":"application/json",...authHeaders}, body:JSON.stringify({id}) });
    setSnippets(prev => prev.filter(s => s.id!==id));
    setToast({message:"Snippet deleted",type:"info"});
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(()=>setToast({message:"Copied to clipboard!",type:"success"})).catch(()=>setToast({message:"Copy failed",type:"error"}));
  };

  const items = tab==="mine" ? snippets : starters;
  const filtered = search.trim()
    ? items.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || (s.tags||"").toLowerCase().includes(search.toLowerCase()) || (s.description||"").toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div style={{maxWidth:640,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>Code Snippets</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{snippets.length} saved · {starters.length} starter templates</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,marginBottom:16,background:"rgba(30,41,59,0.6)",borderRadius:10,border:"1px solid rgba(148,163,184,0.08)",overflow:"hidden"}}>
          {[{id:"mine",label:`My Snippets (${snippets.length})`},{id:"starters",label:`Starter Templates (${starters.length})`}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 14px",border:"none",background:tab===t.id?"rgba(139,92,246,0.12)":"transparent",color:tab===t.id?"#A78BFA":"#64748B",fontSize:12,fontWeight:tab===t.id?700:500,cursor:"pointer",transition:"all 0.15s"}}>{t.label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:16}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{width:14,height:14,position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, tags, description..."
            style={{width:"100%",padding:"10px 12px 10px 34px",background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,fontSize:13,color:"#E2E8F0",outline:"none",fontFamily:"inherit"}}/>
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:14}}>x</button>}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px",color:"#475569"}}>
            <div style={{fontSize:32,marginBottom:8}}>{search?"🔍":"📌"}</div>
            <div style={{fontSize:14,fontWeight:600,color:"#64748B",marginBottom:4}}>{search?"No snippets match your search":tab==="mine"?"No saved snippets yet":"No starter templates"}</div>
            <div style={{fontSize:12,color:"#475569"}}>{tab==="mine"?"Save code from the editor using the Save button":"Check back later for templates"}</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(s => {
              const isExp = expanded === (s.id);
              const tags = (s.tags||"").split(",").map(t=>t.trim()).filter(Boolean);
              return (
                <div key={s.id} style={{background:"rgba(30,41,59,0.4)",border:`1px solid ${isExp?"rgba(139,92,246,0.2)":"rgba(148,163,184,0.07)"}`,borderRadius:12,overflow:"hidden",transition:"border-color 0.2s"}}>
                  <div onClick={()=>setExpanded(isExp?null:s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(148,163,184,0.03)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                    {tab==="mine"&&!s.is_starter&&(
                      <button onClick={e=>{e.stopPropagation();toggleStar(s.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:0,flexShrink:0}}>
                        {s.starred?"⭐":"☆"}
                      </button>
                    )}
                    {s.is_starter&&<span style={{fontSize:16,flexShrink:0}}>📦</span>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{s.title}</span>
                        {s.starred&&<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,color:"#F59E0B",background:"rgba(245,158,11,0.1)"}}>STARRED</span>}
                      </div>
                      {s.description&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>{s.description}</div>}
                      {tags.length>0&&(
                        <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                          {tags.map(t=><span key={t} style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.15)",color:"#A78BFA",fontWeight:600}}>{t}</span>)}
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:11,color:"#475569",transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"rotate(0)",flexShrink:0}}>▼</span>
                  </div>
                  {isExp && (
                    <div style={{borderTop:"1px solid rgba(148,163,184,0.05)",padding:"12px 14px"}}>
                      <pre style={{padding:"12px 14px",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:8,fontSize:12,color:"#93C5FD",fontFamily:"'Fira Code',monospace",overflow:"auto",lineHeight:1.6,maxHeight:200,marginBottom:10}}>{s.code}</pre>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>{onLoadSnippet(s.code);setToast({message:`"${s.title}" loaded into editor`,type:"success"});}}
                          style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#7C3AED,#8B5CF6)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"/></svg>
                          Load in Editor
                        </button>
                        <button onClick={()=>copyCode(s.code)}
                          style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#94A3B8",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                          Copy
                        </button>
                        {tab==="mine"&&!s.is_starter&&(
                          <button onClick={()=>deleteSnippet(s.id)}
                            style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(244,63,94,0.15)",background:"rgba(244,63,94,0.06)",color:"#FB7185",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CHAT HISTORY PAGE (Sidebar)
// ══════════════════════════════════════════════════════════════════════════════
function ChatHistoryPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);
  const authHeaders = { Authorization: `Bearer ${typeof window!=="undefined"?localStorage.getItem("lf_token")||"":""}` };

  useEffect(() => {
    fetch("/api/chat/history", { headers: authHeaders })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.messages) setMessages(d.messages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? messages.filter(m => m.text.toLowerCase().includes(search.toLowerCase()) || (m.agent||"").toLowerCase().includes(search.toLowerCase()))
    : messages;

  // Group by date
  const grouped = {};
  filtered.forEach(m => {
    const d = new Date(m.created_at);
    const key = d.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  const days = Object.keys(grouped).reverse(); // newest first

  const totalUser = messages.filter(m => m.role === "user").length;
  const totalAI = messages.filter(m => m.role !== "user").length;
  const agents = [...new Set(messages.filter(m => m.agent).map(m => m.agent))];

  // Auto-expand first day
  useEffect(() => { if (days.length > 0 && !expandedDay) setExpandedDay(days[0]); }, [days.length]);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      <div style={{maxWidth:640,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>Chat History</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{messages.length} messages across {days.length} day{days.length!==1?"s":""}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[
            {emoji:"💬",label:"Your Messages",value:totalUser},
            {emoji:"🤖",label:"AI Responses",value:totalAI},
            {emoji:"🧠",label:"Agents Used",value:agents.length},
          ].map(s=>(
            <div key={s.label} style={{flex:1,minWidth:100,background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:16}}>{s.emoji}</div>
              <div style={{fontSize:16,fontWeight:800,color:"#E2E8F0"}}>{s.value}</div>
              <div style={{fontSize:10,color:"#475569"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:16}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{width:14,height:14,position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages, agents..."
            style={{width:"100%",padding:"10px 12px 10px 34px",background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,fontSize:13,color:"#E2E8F0",outline:"none",fontFamily:"inherit"}}/>
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:14}}>x</button>}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px",color:"#475569"}}>
            <div style={{fontSize:32,marginBottom:8}}>{search?"🔍":"💬"}</div>
            <div style={{fontSize:14,fontWeight:600,color:"#64748B",marginBottom:4}}>{search?"No messages match your search":"No chat history yet"}</div>
            <div style={{fontSize:12,color:"#475569"}}>{search?"Try different keywords":"Start a conversation in the Dashboard to see your history here"}</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {days.map(day => {
              const dayMsgs = grouped[day];
              const isExpanded = expandedDay === day;
              const userCount = dayMsgs.filter(m=>m.role==="user").length;
              const aiCount = dayMsgs.length - userCount;
              return (
                <div key={day} style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:12,overflow:"hidden"}}>
                  <div onClick={()=>setExpandedDay(isExpanded?null:day)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer",transition:"background 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(148,163,184,0.04)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:14}}>📅</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{day}</div>
                        <div style={{fontSize:11,color:"#64748B"}}>{userCount} sent · {aiCount} received</div>
                      </div>
                    </div>
                    <span style={{fontSize:11,color:"#475569",transition:"transform 0.2s",transform:isExpanded?"rotate(180deg)":"rotate(0)"}}>▼</span>
                  </div>
                  {isExpanded && (
                    <div style={{borderTop:"1px solid rgba(148,163,184,0.05)",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                      {dayMsgs.map(m => {
                        const isUser = m.role === "user";
                        const time = new Date(m.created_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
                        return (
                          <div key={m.id} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:isUser?"row-reverse":"row"}}>
                            <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:isUser?"linear-gradient(135deg,#1D4ED8,#3B82F6)":"rgba(59,130,246,0.12)",border:isUser?"none":"1px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white"}}>
                              {isUser?(user?.name?user.name[0].toUpperCase():"U"):"🤖"}
                            </div>
                            <div style={{flex:1,minWidth:0,maxWidth:"80%"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexDirection:isUser?"row-reverse":"row"}}>
                                <span style={{fontSize:11,fontWeight:600,color:isUser?"#60A5FA":"#94A3B8"}}>{isUser?(user?.name||"You"):(m.agent||"AI Tutor")}</span>
                                <span style={{fontSize:10,color:"#334155"}}>{time}</span>
                              </div>
                              <div style={{padding:"8px 12px",borderRadius:isUser?"14px 14px 4px 14px":"4px 14px 14px 14px",fontSize:13,lineHeight:1.6,color:isUser?"#EFF6FF":"#CBD5E1",background:isUser?"linear-gradient(135deg,#1D4ED8,#3B82F6)":"rgba(30,41,59,0.7)",border:isUser?"none":"1px solid rgba(148,163,184,0.07)",wordBreak:"break-word"}}>
                                {m.text.length > 300 ? m.text.slice(0,300)+"..." : m.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD PAGE (Sidebar)
// ══════════════════════════════════════════════════════════════════════════════
function LeaderboardPage({ user }) {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const authHeaders = { Authorization: `Bearer ${typeof window!=="undefined"?localStorage.getItem("lf_token")||"":""}` };

  const load = (p) => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${p}`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const podiumColors = ["#F59E0B","#94A3B8","#CD7F32"]; // gold, silver, bronze
  const podiumBg = ["rgba(245,158,11,0.08)","rgba(148,163,184,0.06)","rgba(205,127,50,0.06)"];
  const podiumBorder = ["rgba(245,158,11,0.25)","rgba(148,163,184,0.15)","rgba(205,127,50,0.2)"];
  const medals = ["🥇","🥈","🥉"];

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>Leaderboard</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:2}}>See how you rank among all students</div>
          </div>
          <div style={{display:"flex",background:"rgba(30,41,59,0.6)",borderRadius:10,border:"1px solid rgba(148,163,184,0.08)",overflow:"hidden"}}>
            {[{id:"all",label:"All Time"},{id:"weekly",label:"This Week"}].map(t=>(
              <button key={t.id} onClick={()=>setPeriod(t.id)} style={{padding:"7px 14px",border:"none",background:period===t.id?"rgba(59,130,246,0.15)":"transparent",color:period===t.id?"#60A5FA":"#64748B",fontSize:12,fontWeight:period===t.id?700:500,cursor:"pointer",transition:"all 0.15s"}}>{t.label}</button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : !data || data.leaderboard.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:"#475569",fontSize:13}}>No students have started learning yet. Be the first!</div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {data.leaderboard.length >= 3 && (
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8,marginBottom:24,padding:"10px 0"}}>
                {[1,0,2].map(idx => {
                  const s = data.leaderboard[idx];
                  if (!s) return null;
                  const isCenter = idx === 0;
                  const h = isCenter ? 120 : 95;
                  return (
                    <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",width:isCenter?140:110}}>
                      <div style={{fontSize:isCenter?28:22,marginBottom:4}}>{medals[idx]}</div>
                      <div style={{width:isCenter?52:42,height:isCenter?52:42,borderRadius:"50%",background:`linear-gradient(135deg,${s.color},${s.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCenter?18:14,fontWeight:800,color:"white",border:`3px solid ${podiumColors[idx]}`,marginBottom:6}}>{s.initials}</div>
                      <div style={{fontSize:isCenter?14:12,fontWeight:700,color:"#E2E8F0",textAlign:"center",marginBottom:2,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}{s.is_me?" (You)":""}</div>
                      <div style={{fontSize:isCenter?20:16,fontWeight:800,color:podiumColors[idx],marginBottom:4}}>{s.avg_mastery}%</div>
                      <div style={{width:"100%",height:h,background:podiumBg[idx],border:`1px solid ${podiumBorder[idx]}`,borderRadius:"12px 12px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                        <div style={{fontSize:10,color:"#94A3B8"}}>🔥 {s.streak}d streak</div>
                        <div style={{fontSize:10,color:"#94A3B8"}}>{s.topics_started} topics</div>
                        <div style={{fontSize:10,color:"#94A3B8"}}>{s.code_runs} runs</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* My Rank Card (if not in top 3) */}
            {data.my_rank && data.my_rank.rank > 3 && (
              <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:12,fontWeight:800,color:"#60A5FA",width:28,textAlign:"center"}}>#{data.my_rank.rank}</div>
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>{data.my_rank.initials}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{data.my_rank.name} (You)</div>
                  <div style={{fontSize:11,color:"#64748B"}}>{data.my_rank.streak}d streak  ·  {data.my_rank.topics_started} topics  ·  {data.my_rank.code_runs} runs</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:"#60A5FA"}}>{data.my_rank.avg_mastery}%</div>
              </div>
            )}

            {/* Full Rankings List */}
            <div style={{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(148,163,184,0.07)",borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid rgba(148,163,184,0.07)",fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.05em"}}>
                <span style={{width:36}}>Rank</span>
                <span style={{flex:1}}>Student</span>
                <span style={{width:60,textAlign:"center"}}>Streak</span>
                <span style={{width:60,textAlign:"center"}}>Topics</span>
                <span style={{width:50,textAlign:"center"}}>Runs</span>
                <span style={{width:60,textAlign:"right"}}>Mastery</span>
              </div>
              {data.leaderboard.map((s, i) => (
                <div key={s.id} style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:i<data.leaderboard.length-1?"1px solid rgba(148,163,184,0.04)":"none",background:s.is_me?"rgba(59,130,246,0.04)":"transparent",transition:"background 0.15s"}}
                  onMouseEnter={e=>{if(!s.is_me)e.currentTarget.style.background="rgba(148,163,184,0.03)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=s.is_me?"rgba(59,130,246,0.04)":"transparent";}}>
                  <span style={{width:36,fontSize:13,fontWeight:700,color:i<3?podiumColors[i]:"#475569"}}>{i<3?medals[i]:`#${s.rank}`}</span>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${s.color},${s.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>{s.initials}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:s.is_me?700:600,color:s.is_me?"#60A5FA":"#E2E8F0"}}>{s.name}{s.is_me?" (You)":""}</div>
                      {s.topics_mastered>0&&<div style={{fontSize:9,color:"#10B981",fontWeight:600}}>{s.topics_mastered} mastered</div>}
                    </div>
                  </div>
                  <span style={{width:60,textAlign:"center",fontSize:12,color:"#F59E0B",fontWeight:600}}>🔥{s.streak}d</span>
                  <span style={{width:60,textAlign:"center",fontSize:12,color:"#94A3B8"}}>{s.topics_started}</span>
                  <span style={{width:50,textAlign:"center",fontSize:12,color:"#94A3B8"}}>{s.code_runs}</span>
                  <div style={{width:60,textAlign:"right"}}>
                    <span style={{fontSize:14,fontWeight:800,color:s.avg_mastery>=91?"#60A5FA":s.avg_mastery>=71?"#10B981":s.avg_mastery>=41?"#F59E0B":"#94A3B8"}}>{s.avg_mastery}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{textAlign:"center",padding:"16px",fontSize:11,color:"#334155"}}>
              {data.leaderboard.length} student{data.leaderboard.length!==1?"s":""} ranked  ·  {period==="weekly"?"This week":"All time"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE (Sidebar)
// ══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ user, role, theme, setTheme }) {
  const darkMode = theme === "dark";
  const [fontSize, setFontSize] = useState(14);
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState({ education:"", experience:"", specialization:"", achievements:"", bio:"" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (role === "teacher") {
      setProfileLoading(true);
      const token = localStorage.getItem("lf_token");
      fetch("/api/teachers/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setProfile({ education: data.education||"", experience: data.experience||"", specialization: data.specialization||"", achievements: data.achievements||"", bio: data.bio||"" }))
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    }
  }, [role]);

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const token = localStorage.getItem("lf_token");
      const res = await fetch("/api/teachers/profile", { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify(profile) });
      if (res.ok) setToast({message:"Profile saved successfully!",type:"success"});
      else setToast({message:"Failed to save profile",type:"error"});
    } catch(e) { setToast({message:"Network error",type:"error"}); }
    setProfileSaving(false);
  };

  const inputStyle = {width:"100%",background:"var(--lf-input-bg)",border:"1px solid var(--lf-border)",borderRadius:8,padding:"10px 12px",fontSize:12,color:"var(--lf-text2)",outline:"none",fontFamily:"inherit",resize:"vertical"};
  const cardStyle = {background:"var(--lf-card)",border:"1px solid var(--lf-card-border)",borderRadius:14,padding:"20px",marginBottom:14,boxShadow:"var(--lf-shadow)",transition:"background 0.3s, border-color 0.3s"};

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px"}}>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:800,color:"var(--lf-text)",marginBottom:20}}>Settings</div>
        <div style={cardStyle}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",marginBottom:14}}>Profile</div>
          <div style={{display:"grid",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Name</span>
              <span style={{fontSize:12,fontWeight:600,color:"var(--lf-text2)"}}>{user?.name || "User"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Email</span>
              <span style={{fontSize:12,fontWeight:600,color:"var(--lf-text2)"}}>{user?.email || "—"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Role</span>
              <span style={{fontSize:12,fontWeight:600,color:"var(--lf-text2)",textTransform:"capitalize"}}>{role}</span>
            </div>
          </div>
        </div>

        {role==="teacher"&&(
          <div style={cardStyle}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",marginBottom:4}}>Teacher Profile</div>
            <div style={{fontSize:11,color:"var(--lf-text-muted)",marginBottom:16}}>This information is visible to students browsing the Faculty page</div>
            {profileLoading ? <LoadingSpinner/> : (
              <div style={{display:"grid",gap:14}}>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"var(--lf-text-muted)",marginBottom:4,display:"block"}}>Education</label>
                  <input value={profile.education} onChange={e=>setProfile(p=>({...p,education:e.target.value}))} placeholder="e.g. PhD Computer Science, Stanford University" style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"var(--lf-text-muted)",marginBottom:4,display:"block"}}>Experience</label>
                  <input value={profile.experience} onChange={e=>setProfile(p=>({...p,experience:e.target.value}))} placeholder="e.g. 10 years teaching Python & ML" style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"var(--lf-text-muted)",marginBottom:4,display:"block"}}>Specialization</label>
                  <input value={profile.specialization} onChange={e=>setProfile(p=>({...p,specialization:e.target.value}))} placeholder="e.g. Machine Learning, Data Science, Web Development" style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"var(--lf-text-muted)",marginBottom:4,display:"block"}}>Achievements</label>
                  <textarea value={profile.achievements} onChange={e=>setProfile(p=>({...p,achievements:e.target.value}))} placeholder="e.g. Published 20+ papers, Google AI Mentor Award" rows={2} style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"var(--lf-text-muted)",marginBottom:4,display:"block"}}>Bio</label>
                  <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="Tell students about yourself and your teaching style..." rows={3} style={inputStyle}/>
                </div>
                <button onClick={saveProfile} disabled={profileSaving}
                  style={{padding:"10px 0",borderRadius:8,border:"none",background:"linear-gradient(135deg,#10B981,#059669)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",opacity:profileSaving?0.6:1,marginTop:4}}>
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </div>
        )}
        <div style={cardStyle}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",marginBottom:14}}>Appearance</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Dark Mode</span>
            <div onClick={()=>{setTheme(darkMode?"light":"dark");setToast({message:darkMode?"Light mode activated":"Dark mode activated",type:"info"});}} style={{width:40,height:22,borderRadius:99,background:darkMode?"#3B82F6":"rgba(148,163,184,0.3)",cursor:"pointer",padding:2,transition:"background 0.2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"white",transform:darkMode?"translateX(18px)":"translateX(0)",transition:"transform 0.2s"}}/>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",marginBottom:14}}>Code Editor</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Font Size</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setFontSize(Math.max(10,fontSize-1))} style={{width:26,height:26,borderRadius:6,border:"1px solid var(--lf-border)",background:"transparent",color:"var(--lf-text-muted)",cursor:"pointer",fontSize:14}}>−</button>
              <span style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",width:24,textAlign:"center"}}>{fontSize}</span>
              <button onClick={()=>setFontSize(Math.min(24,fontSize+1))} style={{width:26,height:26,borderRadius:6,border:"1px solid var(--lf-border)",background:"transparent",color:"var(--lf-text-muted)",cursor:"pointer",fontSize:14}}>+</button>
            </div>
          </div>
        </div>
        <div style={{...cardStyle,marginBottom:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--lf-text2)",marginBottom:14}}>About</div>
          <div style={{display:"grid",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"var(--lf-text-muted)"}}>App</span><span style={{fontSize:12,color:"var(--lf-text2)"}}>LearnFlow v1.0</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"var(--lf-text-muted)"}}>AI Model</span><span style={{fontSize:12,color:"var(--lf-text2)"}}>GPT-4o-mini</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"var(--lf-text-muted)"}}>Stack</span><span style={{fontSize:12,color:"var(--lf-text2)"}}>Next.js + K8s + Kafka</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════════
function AppShell({ role, user, onLogout, theme, setTheme }) {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activePage, setActivePage]         = useState("dashboard");
  const [isMobile, setIsMobile]             = useState(typeof window!=="undefined"?window.innerWidth<768:false);
  const [snippetCode, setSnippetCode]       = useState(null);
  const accent = role==="teacher"?"#10B981":"#3B82F6";
  const grad   = role==="teacher"?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#3B82F6,#6366F1)";

  useEffect(()=>{
    const h=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",h);
    return ()=>window.removeEventListener("resize",h);
  },[]);

  return (
    <div style={{display:"flex",height:"100vh",background:"var(--lf-bg,#0F172A)",overflow:"hidden",transition:"background 0.3s"}}>
      {!isMobile&&<Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} activePage={activePage} setActivePage={setActivePage} role={role} user={user} onLogout={onLogout} isMobile={false} onClose={()=>{}} theme={theme}/>}
      {isMobile&&<Sidebar expanded={sidebarOpen} setExpanded={setSidebarOpen} activePage={activePage} setActivePage={setActivePage} role={role} user={user} onLogout={onLogout} isMobile={true} onClose={()=>setSidebarOpen(false)} theme={theme}/>}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{height:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",background:"var(--lf-header)",borderBottom:"1px solid var(--lf-border)",flexShrink:0,gap:8,transition:"background 0.3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            {isMobile&&<button onClick={()=>setSidebarOpen(v=>!v)} style={{background:"var(--lf-surface)",border:"1px solid var(--lf-border)",borderRadius:7,padding:"5px 7px",color:"var(--lf-text-muted)",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            </button>}
            <span style={{fontSize:13,fontWeight:500,color:"var(--lf-text-muted)",textTransform:"capitalize"}}>{activePage}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px 3px 3px",background:"var(--lf-surface)",border:"1px solid var(--lf-border)",borderRadius:99}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white"}}>{user?.name?user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():role==="teacher"?"R":"M"}</div>
              <span style={{fontSize:12,fontWeight:500,color:"var(--lf-text3)",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name||"User"}</span>
            </div>
            <button onClick={onLogout} style={{background:"rgba(244,63,94,0.08)",border:"1px solid rgba(244,63,94,0.15)",borderRadius:8,padding:"6px 10px",color:"#FB7185",cursor:"pointer",fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
              <span style={{display:isMobile?"none":"inline"}}>Sign Out</span>
            </button>
          </div>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {activePage==="dashboard"&&role==="student"&&<StudentDashboard user={user} snippetCode={snippetCode} clearSnippetCode={()=>setSnippetCode(null)}/>}
          {activePage==="dashboard"&&role==="teacher"&&<TeacherDashboard user={user}/>}
          {activePage==="learn"&&role==="student"&&<LearnPage user={user}/>}
          {activePage==="teachers"&&role==="student"&&<TeachersPage user={user}/>}
          {activePage==="snippets"&&role==="student"&&<SnippetsPage user={user} onLoadSnippet={(code)=>{setSnippetCode(code);setActivePage("dashboard");}}/>}
          {activePage==="history"&&role==="student"&&<ChatHistoryPage user={user}/>}
          {activePage==="leaderboard"&&<LeaderboardPage user={user}/>}
          {activePage==="progress"&&<ProgressPage user={user} role={role}/>}
          {activePage==="settings"&&<SettingsPage user={user} role={role} theme={theme} setTheme={setTheme}/>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONBOARDING FLOW (First-time users)
// ══════════════════════════════════════════════════════════════════════════════
function OnboardingFlow({ user, role, onComplete }) {
  const [step, setStep] = useState(0); // 0=welcome, 1=survey, 2=tour, 3=first-win
  const [level, setLevel] = useState(null);
  const [goal, setGoal] = useState(null);
  const [tourStep, setTourStep] = useState(0);
  const [demoCode] = useState('# Try running this!\nfor i in range(5):\n    print(f"Step {i+1}: Learning Python!")');
  const [demoOutput, setDemoOutput] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const accent = role==="teacher"?"#10B981":"#3B82F6";
  const grad = role==="teacher"?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#3B82F6,#6366F1)";

  const levels = [
    { id:"beginner", emoji:"🌱", label:"Beginner", desc:"New to programming" },
    { id:"intermediate", emoji:"🌿", label:"Intermediate", desc:"Know basics, learning more" },
    { id:"advanced", emoji:"🌳", label:"Advanced", desc:"Experienced, want mastery" },
  ];

  const goals = [
    { id:"projects", emoji:"🛠️", label:"Build Projects", desc:"Hands-on coding" },
    { id:"career", emoji:"💼", label:"Career Switch", desc:"Get job-ready" },
    { id:"exams", emoji:"📝", label:"Pass Exams", desc:"Academic prep" },
    { id:"explore", emoji:"🔍", label:"Just Exploring", desc:"Curious & learning" },
  ];

  const tourSteps = [
    { emoji:"💬", title:"Meet Your AI Tutor", desc:"Ask any Python question and get expert answers. Your tutor adapts to your level and remembers your progress.", highlight:"Chat" },
    { emoji:"💻", title:"Live Code Editor", desc:"Write and run Python code right in your browser. Instant feedback, error detection, and auto-tracking.", highlight:"Code Editor" },
    { emoji:"📊", title:"Smart Progress Tracking", desc:"Watch your mastery grow across topics. Color-coded levels from Beginner to Mastered.", highlight:"Progress" },
    { emoji:"🏆", title:"Leaderboard & Streaks", desc:"Compete with other students, maintain your streak, and climb the rankings!", highlight:"Leaderboard" },
  ];

  const runDemoCode = async () => {
    setDemoRunning(true);
    setDemoOutput("");
    try {
      const token = localStorage.getItem("lf_token");
      const res = await fetch("/api/execute", { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token||""}`}, body:JSON.stringify({code:demoCode}) });
      const data = await res.json();
      setDemoOutput(data.output || data.error || "(no output)");
    } catch(e) { setDemoOutput("Step 1: Learning Python!\nStep 2: Learning Python!\nStep 3: Learning Python!\nStep 4: Learning Python!\nStep 5: Learning Python!"); }
    setDemoRunning(false);
    setTimeout(() => setCelebrated(true), 500);
  };

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`lf_onboarded_${user?.id||0}`, "true");
      if (level) localStorage.setItem(`lf_level_${user?.id||0}`, level);
      if (goal) localStorage.setItem(`lf_goal_${user?.id||0}`, goal);
    }
    onComplete({ level, goal });
  };

  const cardBase = {background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:14,padding:"16px",cursor:"pointer",transition:"all 0.2s"};
  const selectedCard = (sel) => sel ? {background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)"} : {};

  return (
    <div style={{position:"fixed",inset:0,background:"#0F172A",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",overflow:"auto",padding:20}}>
      <div style={{width:"100%",maxWidth:520,animation:"fadein 0.4s ease"}}>

        {/* Step 0: Welcome */}
        {step===0 && (
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:18,background:grad,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{width:32,height:32}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div style={{fontSize:28,fontWeight:800,color:"#F1F5F9",marginBottom:8}}>Welcome to LearnFlow{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!</div>
            <div style={{fontSize:15,color:"#94A3B8",lineHeight:1.7,marginBottom:32,maxWidth:400,margin:"0 auto 32px"}}>
              {role==="teacher"
                ? "You're about to set up your teaching dashboard. Let's get you started in under a minute."
                : "Your AI-powered Python learning journey starts here. Let's personalize your experience in under a minute."}
            </div>
            <button onClick={()=>setStep(1)} style={{padding:"14px 48px",borderRadius:12,border:"none",background:grad,color:"white",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
              Let's Go
            </button>
            <div style={{marginTop:16}}>
              <button onClick={finish} style={{background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.15)",borderRadius:8,padding:"8px 20px",color:"#CBD5E1",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(148,163,184,0.15)";e.currentTarget.style.color="#F1F5F9";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(148,163,184,0.08)";e.currentTarget.style.color="#CBD5E1";}}>Skip onboarding</button>
            </div>
          </div>
        )}

        {/* Step 1: Survey */}
        {step===1 && (
          <div>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",marginBottom:6}}>
                {role==="teacher" ? "What do you teach?" : "What's your Python level?"}
              </div>
              <div style={{fontSize:13,color:"#64748B"}}>This helps us personalize your experience</div>
            </div>

            <div style={{display:"grid",gap:10,marginBottom:24}}>
              {levels.map(l => (
                <div key={l.id} onClick={()=>setLevel(l.id)}
                  style={{...cardBase,...selectedCard(level===l.id),display:"flex",alignItems:"center",gap:14}}
                  onMouseEnter={e=>{if(level!==l.id)e.currentTarget.style.borderColor="rgba(148,163,184,0.2)";}}
                  onMouseLeave={e=>{if(level!==l.id)e.currentTarget.style.borderColor="rgba(148,163,184,0.1)";}}>
                  <div style={{fontSize:28}}>{l.emoji}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:level===l.id?"#60A5FA":"#E2E8F0"}}>{l.label}</div>
                    <div style={{fontSize:12,color:"#64748B"}}>{l.desc}</div>
                  </div>
                  {level===l.id && <div style={{marginLeft:"auto",fontSize:18,color:"#60A5FA"}}>✓</div>}
                </div>
              ))}
            </div>

            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:6}}>What's your goal?</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
              {goals.map(g => (
                <div key={g.id} onClick={()=>setGoal(g.id)}
                  style={{...cardBase,...selectedCard(goal===g.id),textAlign:"center",padding:"18px 12px"}}
                  onMouseEnter={e=>{if(goal!==g.id)e.currentTarget.style.borderColor="rgba(148,163,184,0.2)";}}
                  onMouseLeave={e=>{if(goal!==g.id)e.currentTarget.style.borderColor="rgba(148,163,184,0.1)";}}>
                  <div style={{fontSize:24,marginBottom:6}}>{g.emoji}</div>
                  <div style={{fontSize:13,fontWeight:700,color:goal===g.id?"#60A5FA":"#E2E8F0"}}>{g.label}</div>
                  <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{g.desc}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(0)} style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#94A3B8",fontSize:14,fontWeight:600,cursor:"pointer"}}>Back</button>
              <button onClick={()=>setStep(2)} disabled={!level}
                style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:level?grad:"rgba(148,163,184,0.1)",color:level?"white":"#475569",fontSize:14,fontWeight:700,cursor:level?"pointer":"not-allowed"}}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Feature Tour */}
        {step===2 && (
          <div>
            <div style={{textAlign:"center",marginBottom:6}}>
              <div style={{fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Feature Tour · {tourStep+1} of {tourSteps.length}</div>
            </div>

            <div style={{display:"flex",gap:4,marginBottom:24,justifyContent:"center"}}>
              {tourSteps.map((_, i) => (
                <div key={i} style={{width:i===tourStep?32:16,height:4,borderRadius:99,background:i===tourStep?accent:i<tourStep?"rgba(59,130,246,0.3)":"rgba(148,163,184,0.15)",transition:"all 0.3s"}} />
              ))}
            </div>

            <div style={{textAlign:"center",animation:"fadein 0.3s ease"}} key={tourStep}>
              <div style={{width:80,height:80,borderRadius:20,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.15)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                <span style={{fontSize:40}}>{tourSteps[tourStep].emoji}</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",marginBottom:8}}>{tourSteps[tourStep].title}</div>
              <div style={{fontSize:14,color:"#94A3B8",lineHeight:1.7,maxWidth:380,margin:"0 auto 28px"}}>{tourSteps[tourStep].desc}</div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>tourStep>0?setTourStep(tourStep-1):setStep(1)}
                style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid rgba(148,163,184,0.15)",background:"transparent",color:"#94A3B8",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                Back
              </button>
              <button onClick={()=>tourStep<tourSteps.length-1?setTourStep(tourStep+1):setStep(3)}
                style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:grad,color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {tourStep<tourSteps.length-1 ? "Next" : "Try It Out!"}
              </button>
            </div>

            <div style={{textAlign:"center",marginTop:12}}>
              <button onClick={()=>setStep(3)} style={{background:"none",border:"none",color:"#475569",fontSize:12,cursor:"pointer"}}>Skip tour</button>
            </div>
          </div>
        )}

        {/* Step 3: First Win — run code */}
        {step===3 && (
          <div>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",marginBottom:6}}>
                {celebrated ? "You Did It!" : "Your First Code Run"}
              </div>
              <div style={{fontSize:13,color:"#64748B"}}>
                {celebrated ? "You just ran your first Python code on LearnFlow!" : "Hit Run to execute your first Python program"}
              </div>
            </div>

            {!celebrated ? (
              <>
                <div style={{background:"#181E2D",borderRadius:12,overflow:"hidden",border:"1px solid rgba(148,163,184,0.1)",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid rgba(148,163,184,0.07)",gap:6}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#F43F5E"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#F59E0B"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#10B981"}}/>
                    <span style={{marginLeft:8,fontSize:11,color:"#475569"}}>main.py</span>
                  </div>
                  <pre style={{padding:"16px 18px",margin:0,fontSize:13,lineHeight:1.7,color:"#93C5FD",fontFamily:"'Fira Code',monospace",overflow:"auto"}}>{demoCode}</pre>
                </div>

                <button onClick={runDemoCode} disabled={demoRunning}
                  style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:grad,color:"white",fontSize:15,fontWeight:700,cursor:demoRunning?"wait":"pointer",opacity:demoRunning?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd"/></svg>
                  {demoRunning ? "Running..." : "Run Code"}
                </button>

                {demoOutput && (
                  <div style={{marginTop:12,background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:10,padding:"12px 16px"}}>
                    <pre style={{margin:0,fontSize:12,color:"#34D399",fontFamily:"monospace",lineHeight:1.6}}>{demoOutput}</pre>
                  </div>
                )}
              </>
            ) : (
              <div style={{textAlign:"center",animation:"fadein 0.4s ease"}}>
                <div style={{fontSize:64,marginBottom:16}}>🎉</div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
                  {[
                    {emoji:"🌱", label:"Level", value:levels.find(l=>l.id===level)?.label||"Beginner"},
                    {emoji:"🎯", label:"Goal", value:goals.find(g=>g.id===goal)?.label||"Exploring"},
                    {emoji:"✅", label:"First Run", value:"Complete!"},
                  ].map(s => (
                    <div key={s.label} style={{background:"rgba(30,41,59,0.5)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:12,padding:"14px 8px",textAlign:"center"}}>
                      <div style={{fontSize:20,marginBottom:4}}>{s.emoji}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{s.value}</div>
                      <div style={{fontSize:10,color:"#475569",marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.7,marginBottom:24}}>
                  {role==="teacher"
                    ? "Your dashboard is ready. Monitor students, create exercises, and track class progress."
                    : level==="beginner"
                      ? "We've set up your path starting with Python Basics. Your AI tutor is ready!"
                      : level==="advanced"
                        ? "We'll challenge you with advanced topics. Your AI tutor adapts to your expertise!"
                        : "Your personalized learning path is ready. Let's build something great!"}
                </div>

                <button onClick={finish}
                  style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:grad,color:"white",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
                  Start Learning
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — Landing → Login → App
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | login | onboarding | app
  const [role, setRole]     = useState(null);
  const [user, setUser]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme]   = useLocalStorage("lf_theme", "dark");

  // Apply theme CSS variables to document
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--lf-bg",          "#F1F5F9");
      root.style.setProperty("--lf-bg2",         "#FFFFFF");
      root.style.setProperty("--lf-bg3",         "#E2E8F0");
      root.style.setProperty("--lf-surface",     "rgba(255,255,255,0.85)");
      root.style.setProperty("--lf-surface2",    "rgba(241,245,249,0.9)");
      root.style.setProperty("--lf-border",      "rgba(148,163,184,0.2)");
      root.style.setProperty("--lf-text",        "#0F172A");
      root.style.setProperty("--lf-text2",       "#334155");
      root.style.setProperty("--lf-text3",       "#64748B");
      root.style.setProperty("--lf-text-muted",  "#94A3B8");
      root.style.setProperty("--lf-sidebar",     "rgba(255,255,255,0.97)");
      root.style.setProperty("--lf-header",      "rgba(255,255,255,0.97)");
      root.style.setProperty("--lf-card",        "rgba(255,255,255,0.7)");
      root.style.setProperty("--lf-card-border", "rgba(148,163,184,0.15)");
      root.style.setProperty("--lf-code-bg",     "#F8FAFC");
      root.style.setProperty("--lf-code-text",   "#1E293B");
      root.style.setProperty("--lf-input-bg",    "rgba(241,245,249,0.8)");
      root.style.setProperty("--lf-shadow",      "0 1px 3px rgba(0,0,0,0.08)");
    } else {
      root.style.setProperty("--lf-bg",          "#0F172A");
      root.style.setProperty("--lf-bg2",         "#1E293B");
      root.style.setProperty("--lf-bg3",         "#0D1117");
      root.style.setProperty("--lf-surface",     "rgba(30,41,59,0.4)");
      root.style.setProperty("--lf-surface2",    "rgba(30,41,59,0.5)");
      root.style.setProperty("--lf-border",      "rgba(148,163,184,0.07)");
      root.style.setProperty("--lf-text",        "#F1F5F9");
      root.style.setProperty("--lf-text2",       "#E2E8F0");
      root.style.setProperty("--lf-text3",       "#CBD5E1");
      root.style.setProperty("--lf-text-muted",  "#64748B");
      root.style.setProperty("--lf-sidebar",     "rgba(13,20,36,0.99)");
      root.style.setProperty("--lf-header",      "rgba(15,23,42,0.97)");
      root.style.setProperty("--lf-card",        "rgba(30,41,59,0.4)");
      root.style.setProperty("--lf-card-border", "rgba(148,163,184,0.07)");
      root.style.setProperty("--lf-code-bg",     "rgba(15,23,42,0.7)");
      root.style.setProperty("--lf-code-text",   "#ABB2BF");
      root.style.setProperty("--lf-input-bg",    "rgba(15,23,42,0.5)");
      root.style.setProperty("--lf-shadow",      "none");
    }
    document.body.style.background = theme === "light" ? "#F1F5F9" : "#0F172A";
  }, [theme]);

  // Check for existing token on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("lf_token") : null;
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          setUser(data.user);
          setRole(data.user.role);
          const onboarded = localStorage.getItem(`lf_onboarded_${data.user.id}`);
          setScreen(onboarded ? "app" : "onboarding");
        })
        .catch(() => {
          localStorage.removeItem("lf_token");
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("lf_token", token);
    setUser(userData);
    setRole(userData.role);
    const onboarded = localStorage.getItem(`lf_onboarded_${userData.id}`);
    setScreen(onboarded ? "app" : "onboarding");
  };

  const handleDemoLogin = (demoRole) => {
    const demoUser = { id: 0, name: demoRole === "teacher" ? "Dr. Rodriguez" : "Maya Chen", email: "demo@learnflow.ai", role: demoRole };
    setUser(demoUser);
    setRole(demoRole);
    const onboarded = localStorage.getItem(`lf_onboarded_${demoUser.id}`);
    setScreen(onboarded ? "app" : "onboarding");
  };

  const handleOnboardingComplete = () => {
    setScreen("app");
  };

  const handleLogout = () => {
    localStorage.removeItem("lf_token");
    setUser(null);
    setRole(null);
    setScreen("landing");
  };

  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--lf-bg,#0F172A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, border:"3px solid rgba(59,130,246,0.2)", borderTopColor:"#3B82F6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
          <span style={{ color:"#64748B", fontSize:13 }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { background:var(--lf-bg,#0F172A); font-family:'Inter',system-ui,sans-serif; height:100%; transition:background 0.3s; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(148,163,184,0.15); border-radius:99px; }
        input:focus, button:focus, textarea:focus { outline:none; }
        a { text-decoration:none; }
        @keyframes fadein  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse2  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes tdot    { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-5px);opacity:1} }

        /* Responsive helpers */
        .lf-hide-mobile { display:flex; }
        .lf-show-mobile { display:none; }
        .lf-cta-row     { flex-direction:row; }

        @media (max-width:640px) {
          .lf-hide-mobile { display:none !important; }
          .lf-show-mobile { display:flex !important; }
          .lf-cta-row     { flex-direction:column !important; }
        }

        /* Mobile responsive tweaks for app shell */
        @media (max-width:768px) {
          textarea { font-size:16px !important; } /* prevent iOS zoom */
        }
      `}</style>

      {screen==="landing" && (
        <LandingPage onNavigate={(dest)=>setScreen(dest)}/>
      )}
      {screen==="login" && (
        <LoginPage
          onLogin={handleLogin}
          onDemoLogin={handleDemoLogin}
          onBack={()=>setScreen("landing")}
        />
      )}
      {screen==="onboarding" && role && (
        <OnboardingFlow user={user} role={role} onComplete={handleOnboardingComplete}/>
      )}
      {screen==="app" && role && (
        <AppShell
          role={role}
          user={user}
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </>
  );
}
