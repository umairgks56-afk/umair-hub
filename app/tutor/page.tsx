"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, BookOpen, Send, Sparkles, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Message = { role: "user" | "assistant"; content: string };

export default function TutorPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    createSupabaseBrowserClient().auth.getSession().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.session));
      setAuthReady(true);
    });
    return () => { active = false; };
  }, []);

  async function askTutor(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", content: text }]);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ question: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI Tutor request failed.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer || "I couldn't generate an answer." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-5xl p-6 md:p-10"><header><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">UMAIR HUB</p><h1 className="mt-2 text-3xl font-black tracking-tight">AI Tutor</h1><p className="mt-2 text-sm text-slate-500">Ask questions and get answers grounded in your uploaded study material.</p></header>
    {!authReady ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">Checking your session…</div> : !signedIn ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">Sign in to use the authenticated AI Tutor.</div> : <>
      <div className="mt-8 min-h-[420px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">{messages.length === 0 ? <div className="flex h-[360px] flex-col items-center justify-center text-center"><div className="grid size-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"><Sparkles size={24}/></div><h2 className="mt-5 text-xl font-black">Study with your own material</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Ask about a concept, request an explanation, or test your understanding. Relevant indexed material is retrieved before the AI answers.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Explain this topic simply</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">What should I revise?</span></div></div> : <div className="space-y-5">{messages.map((message, index)=><div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`grid size-9 shrink-0 place-items-center rounded-xl ${message.role === "user" ? "order-2 bg-slate-950 text-white" : "bg-slate-100"}`}>{message.role === "user" ? <UserRound size={16}/> : <Bot size={17}/>}</div><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "order-1 bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>{message.content}</div></div>)}{loading && <div className="flex items-center gap-3 text-sm text-slate-400"><div className="grid size-9 place-items-center rounded-xl bg-slate-100"><Bot size={17}/></div>Retrieving your material and thinking…</div>}</div>}</div>
      <form onSubmit={askTutor} className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex items-end gap-3"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Ask your AI Tutor…" rows={2} maxLength={4000} className="min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"/><button disabled={!question.trim() || loading} className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"><Send size={17}/></button></div><div className="mt-2 flex items-center gap-2 px-2 text-[11px] text-slate-400"><BookOpen size={13}/> Answers use your authenticated material knowledge base when relevant.</div></form>
    </>}</div></main>;
}
