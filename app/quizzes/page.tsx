"use client";

import { useEffect, useState } from "react";
import { Brain, CheckCircle2, Clock3, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Material = { id: string; name: string; status: string | null };
type Question = { question: string; options: string[]; correctAnswer: number; explanation?: string; sourceReference?: string };

function parseQuestions(value: string): Question[] {
  try {
    const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [];
    return list.filter((item: unknown): item is Question => {
      if (!item || typeof item !== "object") return false;
      const x = item as Record<string, unknown>;
      return typeof x.question === "string" && Array.isArray(x.options) && x.options.length === 4 && x.options.every((option) => typeof option === "string") && typeof x.correctAnswer === "number" && x.correctAnswer >= 0 && x.correctAnswer < 4;
    });
  } catch { return []; }
}

export default function Quizzes() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Sign in to use quizzes.");
        const response = await fetch("/api/materials", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load materials.");
        if (active) {
          const ready = (data.materials ?? []).filter((item: Material) => item.status === "ready");
          setMaterials(ready);
          if (ready[0]) setMaterialId(ready[0].id);
        }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Could not load materials."); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  async function generateQuiz() {
    if (!materialId || generating) return;
    setGenerating(true); setError(""); setQuestions([]); setAnswers({});
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/study/generate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: "mcqs", materialId, options: { count, difficulty: "mixed" } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quiz generation failed.");
      const parsed = parseQuestions(data.result || "");
      if (!parsed.length) throw new Error("The AI returned an invalid question set. Please try again.");
      setQuestions(parsed);
    } catch (err) { setError(err instanceof Error ? err.message : "Quiz generation failed."); }
    finally { setGenerating(false); }
  }

  const answered = Object.keys(answers).length;
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0), 0);

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-6xl p-6 md:p-10"><header><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Practice engine</p><h1 className="mt-2 text-3xl font-black tracking-tight">Quizzes & MCQs</h1><p className="mt-2 text-sm text-slate-500">Generate source-grounded questions and practice directly from your processed study material.</p></header>
<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 border border-slate-200"><Brain size={20}/><p className="mt-4 text-2xl font-black">{answered}</p><p className="text-xs text-slate-400">Questions answered</p></div><div className="rounded-2xl bg-white p-5 border border-slate-200"><CheckCircle2 size={20}/><p className="mt-4 text-2xl font-black">{answered ? `${Math.round((score / answered) * 100)}%` : "—"}</p><p className="text-xs text-slate-400">Current accuracy</p></div><div className="rounded-2xl bg-slate-950 p-5 text-white"><Trophy size={20}/><p className="mt-4 text-2xl font-black">{questions.length ? `${score}/${questions.length}` : "0"}</p><p className="text-xs text-slate-400">Current score</p></div></div>
<div className="mt-8 rounded-3xl bg-white border border-slate-200 p-6 md:p-8"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-slate-400"><Sparkles size={15}/> AI quiz builder</div><h2 className="mt-3 text-2xl font-black">Build a test from your material</h2><div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]"><select value={materialId} onChange={(event)=>setMaterialId(event.target.value)} disabled={loading || generating || !materials.length} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"><option value="">{loading ? "Loading materials…" : "Select material"}</option>{materials.map((material)=><option key={material.id} value={material.id}>{material.name}</option>)}</select><select value={count} onChange={(event)=>setCount(Number(event.target.value))} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"><option value={10}>10 Questions</option><option value={25}>25 Questions</option><option value={50}>50 Questions</option></select><button onClick={generateQuiz} disabled={!materialId || generating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">{generating ? "Generating…" : "Generate quiz"}<ArrowRight size={16}/></button></div></div>
{error && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div>}
{questions.length > 0 && <section className="mt-8 space-y-4">{questions.map((question,index)=><article key={`${question.question}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><h3 className="font-extrabold leading-6"><span className="mr-2 text-xs text-slate-400">Q{index + 1}</span>{question.question}</h3><Clock3 size={16} className="shrink-0 text-slate-300"/></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex)=>{const selected=answers[index]===optionIndex; const reveal=answers[index]!==undefined; const correct=optionIndex===question.correctAnswer; return <button key={option} onClick={()=>setAnswers((current)=>({...current,[index]:optionIndex}))} className={`rounded-xl border p-3 text-left text-sm transition ${reveal && correct ? "border-emerald-300 bg-emerald-50" : reveal && selected && !correct ? "border-rose-300 bg-rose-50" : selected ? "border-slate-950 bg-slate-50" : "border-slate-200 hover:bg-slate-50"}`}>{option}</button>})}</div>{answers[index]!==undefined && question.explanation && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><b>Explanation:</b> {question.explanation}</p>}</article>)}</section>}
</div></main>;
}
