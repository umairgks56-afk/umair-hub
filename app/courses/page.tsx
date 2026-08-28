"use client";

import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Loader2, Plus, ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function CoursesPage() {
  const supabase = createSupabaseBrowserClient();
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { window.location.href = "/login"; return; }
    const response = await fetch("/api/courses", { headers: { Authorization: `Bearer ${session.session.access_token}` } });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Could not load courses."); else setCourses(data.courses ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { window.location.href = "/login"; return; }
    const response = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.session.access_token}` }, body: JSON.stringify({ title, code }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) return setError(data.error ?? "Could not create course.");
    setCourses(current => [data.course, ...current]); setTitle(""); setCode(""); setShowCreate(false);
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-6xl p-6 md:p-10">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Study workspace</p><h1 className="mt-2 text-3xl font-black tracking-tight">My Courses</h1><p className="mt-2 text-sm text-slate-500">Organize your material and keep every AI workflow grounded in the right course.</p></div><button onClick={()=>setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"><Plus size={17}/> New course</button></header>
    {showCreate && <form onSubmit={create} className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">Create a course</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Course name" className="rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-slate-500"/><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Course code (optional)" className="rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-slate-500"/></div>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-5 flex gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">{saving&&<Loader2 size={15} className="animate-spin"/>}Create</button><button type="button" onClick={()=>setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Cancel</button></div></form>}
    {loading ? <div className="mt-10 flex justify-center py-16"><Loader2 className="animate-spin"/></div> : courses.length === 0 ? <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100"><BookOpen/></div><h2 className="mt-4 font-black">No courses yet</h2><p className="mt-2 text-sm text-slate-500">Create your first course, then upload the material you want UMAIR HUB to understand.</p><button onClick={()=>setShowCreate(true)} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Create your first course</button></div> : <div className="mt-8 grid gap-4 md:grid-cols-3">{courses.map(course=><a href={`/courses/${course.id}`} key={course.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="grid size-11 place-items-center rounded-xl bg-slate-100"><BookOpen size={19}/></div><h2 className="mt-5 font-black">{course.title}</h2><p className="mt-1 text-xs text-slate-400">{course.code || "Course"}</p><div className="mt-5 flex items-center justify-between text-sm font-bold">Open course <ArrowRight size={16} className="transition group-hover:translate-x-1"/></div></a>)}</div>}
    {error && !showCreate && <p className="mt-4 text-sm text-red-600">{error}</p>}
  </div></main>;
}
