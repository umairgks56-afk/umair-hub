"use client";

import { useEffect, useState } from "react";
import { Presentation, Sparkles, Upload, FileText, ArrowRight, WandSparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Material = { id: string; name: string; status: string | null };

export default function Presentations() {
 const [materials, setMaterials] = useState<Material[]>([]);
 const [materialId, setMaterialId] = useState("");
 const [topic, setTopic] = useState("");
 const [slides, setSlides] = useState(10);
 const [result, setResult] = useState("");
 const [loading, setLoading] = useState(true);
 const [generating, setGenerating] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
   let active = true;
   async function load() {
     try {
       const supabase = createSupabaseBrowserClient();
       const { data: { session } } = await supabase.auth.getSession();
       if (!session?.access_token) throw new Error("Sign in to create presentations.");
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

 async function generatePresentation() {
   if (!materialId || generating) return;
   setGenerating(true); setError(""); setResult("");
   try {
     const supabase = createSupabaseBrowserClient();
     const { data: { session } } = await supabase.auth.getSession();
     if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");
     const response = await fetch("/api/study/generate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: "presentation", materialId, options: { topic: topic.trim() || "Study Topic", slides } }) });
     const data = await response.json();
     if (!response.ok) throw new Error(data.error || "Presentation generation failed.");
     setResult(data.result || "No presentation outline was generated.");
   } catch (err) { setError(err instanceof Error ? err.message : "Presentation generation failed."); }
   finally { setGenerating(false); }
 }

 return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-6xl p-6 md:p-10"><header><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Creation studio</p><h1 className="mt-2 text-3xl font-black tracking-tight">Presentations</h1><p className="mt-2 text-sm text-slate-500">Turn lectures, PDFs and notes into polished academic presentations.</p></header>
 <div className="mt-8 rounded-3xl bg-slate-950 p-7 text-white md:p-10"><div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Sparkles size={15}/> SOURCE → SLIDES</div><h2 className="mt-4 text-3xl font-black">Create a presentation in minutes.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Choose a processed source, set your topic and slide count, and let the AI build an academic outline with slide content and speaker notes.</p><div className="mt-7 grid gap-3 md:grid-cols-[1.4fr_1fr_auto]"><select value={materialId} onChange={(event)=>setMaterialId(event.target.value)} disabled={loading || generating || !materials.length} className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none"><option value="" className="text-slate-950">{loading ? "Loading materials…" : "Select material"}</option>{materials.map((material)=><option key={material.id} value={material.id} className="text-slate-950">{material.name}</option>)}</select><input value={topic} onChange={(event)=>setTopic(event.target.value)} placeholder="Presentation topic (optional)" className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"/><button onClick={generatePresentation} disabled={!materialId || generating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><WandSparkles size={16}/>{generating ? "Generating…" : "Create with AI"}</button></div><div className="mt-3 flex items-center gap-3"><label className="text-xs font-bold text-slate-400">Slides</label><select value={slides} onChange={(event)=>setSlides(Number(event.target.value))} className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white"><option value={6} className="text-slate-950">6</option><option value={10} className="text-slate-950">10</option><option value={15} className="text-slate-950">15</option></select></div></div>
 {error && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div>}
 {result && <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100"><Presentation size={18}/></div><div><h2 className="font-black">Generated presentation outline</h2><p className="text-xs text-slate-400">Grounded in your selected material</p></div></div><div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{result}</div></article>}
 <div className="mt-10 grid gap-4 md:grid-cols-3">{[{i:FileText,t:"Choose source",d:"Use your course material so slides stay grounded."},{i:WandSparkles,t:"Generate outline",d:"Control slide count, topic and academic structure."},{i:Presentation,t:"Present confidently",d:"Get slide content and speaker notes ready for refinement."}].map(({i:Icon,t,d})=><div key={t} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="grid size-11 place-items-center rounded-xl bg-slate-100"><Icon size={19}/></div><h3 className="mt-5 font-black">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></div>)}</div>
 <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="font-black">Your presentations</h2><span className="text-xs text-slate-400">{materials.length ? `${materials.length} ready source${materials.length === 1 ? "" : "s"}` : "No ready sources"}</span></div><div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center"><Presentation className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-bold">Generate a deck outline from a ready source above.</p><p className="mt-1 text-xs text-slate-400">Generated content stays grounded in your authenticated material.</p><button onClick={generatePresentation} disabled={!materialId || generating} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold disabled:opacity-40">Create your first deck <ArrowRight size={15}/></button></div></div>
 </div></main>;
}
