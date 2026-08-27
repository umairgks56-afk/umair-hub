import { BookOpen, Brain, FileText, Presentation, Sparkles, ClipboardCheck, ArrowUpRight, Plus, Upload } from "lucide-react";
import "./globals.css";

const tools = [
  { icon: Presentation, title: "Presentation", text: "Turn your material into polished slides." },
  { icon: FileText, title: "Smart Notes", text: "Create clear, exam-focused notes." },
  { icon: Brain, title: "AI Tutor", text: "Learn any topic from your own sources." },
  { icon: ClipboardCheck, title: "Quiz & MCQs", text: "Generate practice from your material." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm"><Sparkles size={19} /></div>
          <div><div className="font-black tracking-tight">UMAIR HUB</div><div className="text-[11px] font-medium text-slate-400">Personal AI</div></div>
        </div>
        <nav className="mt-10 space-y-1 text-sm font-semibold">
          {[[BookOpen,"Overview"],[FileText,"My Library"],[Presentation,"Presentations"],[Brain,"AI Tutor"],[ClipboardCheck,"Quizzes & Tests"]].map(([Icon,label], i) => {
            const I = Icon as typeof Sparkles;
            return <div key={String(label)} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition ${i === 0 ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><I size={18}/>{String(label)}</div>
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-slate-950 p-4 text-white"><div className="text-sm font-bold">Study smarter</div><div className="mt-1 text-xs leading-5 text-slate-400">One source → everything you need to learn.</div></div>
      </aside>

      <section className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-5 backdrop-blur md:px-10">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Thursday, August 27</p><h1 className="mt-1 text-xl font-black tracking-tight">Good afternoon, Umair 👋</h1></div>
          <button className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Plus size={19}/></button>
        </header>

        <div className="mx-auto max-w-7xl p-5 md:p-10">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950 p-7 text-white shadow-xl md:p-10">
            <div className="relative z-10 max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold"><Sparkles size={14}/> Personal AI for Students</div><h2 className="text-3xl font-black tracking-tight md:text-5xl md:leading-[1.05]">Your study material.<br/><span className="text-slate-400">Your AI workspace.</span></h2><p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 md:text-base">Upload a PDF, presentation, image or notes and turn one source into notes, quizzes, tests and presentations.</p><button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02]">Upload material <Upload size={16}/></button></div>
            <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-white/[.06] blur-3xl" />
          </div>

          <div className="mt-10 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Quick actions</p><h3 className="mt-1 text-2xl font-black tracking-tight">What do you want to create?</h3></div><span className="hidden text-sm text-slate-400 md:block">Start from your material</span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{tools.map(({icon:Icon,title,text}) => <button key={title} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"><div className="grid size-11 place-items-center rounded-xl bg-slate-100 transition group-hover:bg-slate-950 group-hover:text-white"><Icon size={20}/></div><div className="mt-5 flex items-center justify-between"><h4 className="font-extrabold">{title}</h4><ArrowUpRight size={17} className="text-slate-300 transition group-hover:text-slate-900"/></div><p className="mt-2 text-sm leading-5 text-slate-500">{text}</p></button>)}</div>

          <div className="mt-10 grid gap-5 xl:grid-cols-[1.4fr_.6fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h3 className="font-black">Recent workspace</h3><span className="text-xs font-bold text-slate-400">Coming next</span></div><div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100"><BookOpen size={20}/></div><p className="mt-3 text-sm font-bold">Your courses and files will appear here</p><p className="mt-1 text-xs text-slate-400">Upload your first study material to get started.</p></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><h3 className="font-black">Your progress</h3><div className="mt-6 flex items-center gap-4"><div className="grid size-20 place-items-center rounded-full border-8 border-slate-950 text-lg font-black">0%</div><div><p className="text-sm font-bold">Semester readiness</p><p className="mt-1 text-xs leading-5 text-slate-400">Your AI will track mastery, practice and revision.</p></div></div></div></div>
        </div>
      </section>
    </main>
  );
}
