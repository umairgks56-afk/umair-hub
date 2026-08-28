"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, FileText, Presentation, Sparkles, ClipboardCheck, ArrowUpRight, Plus, Upload, Search, Menu, X, BarChart3, Clock3, ChevronRight, CheckCircle2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./globals.css";

const tools = [
  { icon: Presentation, title: "Presentation", text: "Turn your material into polished slides.", href: "/presentations" },
  { icon: FileText, title: "Smart Notes", text: "Create clear, exam-focused notes.", href: "/notes" },
  { icon: Brain, title: "AI Tutor", text: "Learn any topic from your own sources.", href: "/tutor" },
  { icon: ClipboardCheck, title: "Quiz & MCQs", text: "Generate practice from your material.", href: "/quizzes" },
];
const nav = [
  [BookOpen, "Overview", "/"],
  [FileText, "My Library", "/library"],
  [Presentation, "Presentations", "/presentations"],
  [Brain, "AI Tutor", "/tutor"],
  [ClipboardCheck, "Quizzes & Tests", "/quizzes"],
] as const;

type Course = { id: string; title: string; code: string | null; created_at: string };
type Material = { id: string; course_id: string | null; name: string; mime_type: string | null; size: number | null; status: string | null; created_at: string };

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (active) setError("Sign in to load your study data.");
          return;
        }
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [coursesResponse, materialsResponse] = await Promise.all([
          fetch("/api/courses", { headers, cache: "no-store" }),
          fetch("/api/materials", { headers, cache: "no-store" }),
        ]);
        const [coursesJson, materialsJson] = await Promise.all([coursesResponse.json(), materialsResponse.json()]);
        if (!coursesResponse.ok) throw new Error(coursesJson.error || "Could not load courses.");
        if (!materialsResponse.ok) throw new Error(materialsJson.error || "Could not load materials.");
        if (active) { setCourses(coursesJson.courses ?? []); setMaterials(materialsJson.materials ?? []); }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load dashboard data.");
      } finally { if (active) setLoading(false); }
    }
    loadDashboard();
    return () => { active = false; };
  }, []);

  const visibleMaterials = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return materials;
    return materials.filter((material) => material.name.toLowerCase().includes(term));
  }, [materials, query]);
  const courseName = new Map(courses.map((course) => [course.id, course.title]));
  const processedMaterials = materials.filter((material) => material.status === "ready").length;
  const readiness = materials.length ? Math.round((processedMaterials / materials.length) * 100) : 0;
  const recent = visibleMaterials.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950 selection:bg-slate-950 selection:text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] border-r border-slate-200/80 bg-white/95 px-5 py-6 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 px-2"><div className="brand-mark grid size-10 place-items-center rounded-[14px] text-white"><Sparkles size={18}/></div><div><div className="font-black tracking-tight">UMAIR HUB</div><div className="text-[11px] font-medium text-slate-400">Personal AI workspace</div></div></Link>
        <nav className="mt-10 space-y-1 text-sm font-semibold">{nav.map(([Icon,label,href],i)=><Link key={label} href={href} className={`nav-item flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${i===0?"nav-active":"text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}><Icon size={18}/>{label}</Link>)}</nav>
        <div className="sidebar-promo absolute bottom-6 left-5 right-5 overflow-hidden rounded-2xl p-4 text-white shadow-xl"><div className="relative z-10 flex items-center gap-2 text-sm font-bold"><Sparkles size={14}/> Study smarter</div><div className="relative z-10 mt-1 text-xs leading-5 text-slate-300">One source → everything you need to learn.</div></div>
      </aside>
      <div className={`fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden ${open?"block":"hidden"}`} onClick={()=>setOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[285px] bg-white p-5 shadow-2xl transition-transform lg:hidden ${open?"translate-x-0":"-translate-x-full"}`}><div className="flex items-center justify-between"><Link href="/" onClick={()=>setOpen(false)} className="font-black">UMAIR HUB</Link><button onClick={()=>setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div><nav className="mt-8 space-y-1">{nav.map(([Icon,label,href])=><Link key={label} href={href} onClick={()=>setOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Icon size={18}/>{label}</Link>)}</nav></aside>
      <section className="lg:ml-[268px]"><header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 md:px-10"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm lg:hidden"><Menu size={19}/></button><div><p className="hidden text-[11px] font-bold uppercase tracking-[.18em] text-slate-400 sm:block">Your study workspace</p><h1 className="mt-0.5 text-lg font-black tracking-tight">Good afternoon, Umair <span className="inline-block">👋</span></h1></div></div><div className="hidden items-center gap-3 sm:flex"><div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your workspace" className="w-60 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"/></div><Link href="/library" className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="Open library"><Plus size={19}/></Link></div></header>
        <div className="mx-auto max-w-[1440px] p-4 sm:p-6 md:p-10">
          <div className="hero-panel relative overflow-hidden rounded-[30px] p-6 text-white shadow-2xl shadow-slate-900/10 sm:p-8 md:p-10"><div className="relative z-10 max-w-2xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.08] px-3 py-1.5 text-[11px] font-bold tracking-wide"><Sparkles size={13}/> PERSONAL AI FOR STUDENTS</div><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl md:text-5xl md:leading-[1.04]">Your study material.<br/><span className="text-slate-400">Your AI workspace.</span></h2><p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Upload a PDF, presentation, image or notes and turn one source into notes, quizzes, tests and presentations.</p><Link href="/library" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"><Upload size={16}/> Upload material <ChevronRight size={15}/></Link></div><div className="hero-orb absolute -right-24 -top-28 size-80 rounded-full blur-3xl"/><div className="hero-orb-secondary absolute -bottom-32 right-20 size-72 rounded-full blur-3xl"/></div>
          <div className="mt-10 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Quick actions</p><h3 className="mt-1 text-2xl font-black tracking-tight">What do you want to create?</h3></div><span className="hidden text-sm text-slate-400 md:block">Start from your material <ArrowUpRight size={14} className="ml-1 inline"/></span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{tools.map(({icon:Icon,title,text,href})=><Link href={href} key={title} className="tool-card group rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/[.06]"><div className="tool-icon grid size-11 place-items-center rounded-xl bg-slate-100 transition-all duration-200 group-hover:bg-slate-950 group-hover:text-white group-hover:shadow-lg"><Icon size={20}/></div><div className="mt-5 flex items-center justify-between"><h4 className="font-extrabold">{title}</h4><ArrowUpRight size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900"/></div><p className="mt-2 text-sm leading-5 text-slate-500">{text}</p></Link>)}</div>
          <div className="mt-10 grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><div className="dashboard-card rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h3 className="font-black">Recent workspace</h3><p className="mt-1 text-xs text-slate-400">{loading ? "Loading your latest study activity…" : `${courses.length} course${courses.length === 1 ? "" : "s"} · ${materials.length} material${materials.length === 1 ? "" : "s"}`}</p></div><div className="grid size-9 place-items-center rounded-lg bg-slate-50"><Clock3 size={17} className="text-slate-400"/></div></div>{error ? <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div> : loading ? <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-8 text-center text-sm text-slate-400">Loading your workspace…</div> : recent.length ? <div className="mt-5 divide-y divide-slate-100">{recent.map((material)=><div key={material.id} className="flex items-center gap-4 py-3"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100"><FileText size={19}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{material.name}</p><p className="mt-1 truncate text-xs text-slate-400">{courseName.get(material.course_id ?? "") ?? "Unassigned course"} · {formatSize(material.size)} · {material.status ?? "pending"}</p></div><span className="hidden shrink-0 text-xs text-slate-400 sm:block">{relativeDate(material.created_at)}</span></div>)}</div> : <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white shadow-sm"><BookOpen size={20}/></div><p className="mt-3 text-sm font-bold">Your courses and files will appear here</p><p className="mt-1 text-xs text-slate-400">Upload your first study material to get started.</p></div>}</div><div className="dashboard-card rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h3 className="font-black">Your progress</h3><p className="mt-1 text-xs text-slate-400">AI readiness overview</p></div><div className="grid size-9 place-items-center rounded-lg bg-slate-50"><BarChart3 size={17} className="text-slate-400"/></div></div><div className="mt-7 flex items-center gap-4"><div className="progress-ring grid size-[82px] shrink-0 place-items-center rounded-full text-lg font-black" style={{"--progress": `${readiness}%`} as React.CSSProperties}><div className="grid size-[66px] place-items-center rounded-full bg-white">{readiness}%</div></div><div><p className="text-sm font-bold">Material readiness</p><p className="mt-1 text-xs leading-5 text-slate-400">{processedMaterials} of {materials.length} material{materials.length === 1 ? "" : "s"} processed and ready for AI features.</p></div></div><div className="mt-6 space-y-2 text-xs"><div className="flex items-center justify-between text-slate-500"><span>Ready for AI</span><span className="font-bold text-slate-900">{processedMaterials}/{materials.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950 transition-all duration-700" style={{width: `${readiness}%`}}/></div></div><Link href="/library" className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"><span className="flex items-center gap-2"><CheckCircle2 size={15}/> Manage materials</span><ChevronRight size={15}/></Link></div></div>
        </div>
      </section>
    </main>
  );
}
