"use client";

import { useEffect, useState } from "react";
import { Brain, FileText, Sparkles, ArrowRight, Search, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Material = { id: string; name: string; status: string | null; extracted_text: string | null };

export default function Notes() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
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
        if (!session?.access_token) throw new Error("Sign in to create notes.");
        const response = await fetch("/api/materials", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load materials.");
        if (active) {
          const ready = (data.materials ?? []).filter((item: Material) => item.status === "ready");
          setMaterials(ready);
          if (ready[0]) setMaterialId(ready[0].id);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load materials.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function generateNotes() {
    if (!materialId || generating) return;
    setGenerating(true);
    setError("");
    setResult("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/study/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "notes", materialId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Note generation failed.");
      setResult(data.result || "No notes were generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Note generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-6xl p-6 md:p-10"><header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Study workspace</p><h1 className="mt-2 text-3xl font-black tracking-tight">Smart Notes</h1><p className="mt-2 text-sm text-slate-500">Turn your source material into notes that are made for understanding and revision.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"><Plus size={17}/> Create notes</button></header>
<div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-950 p-5 text-white md:col-span-2"><div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Sparkles size={15}/> AI NOTE GENERATOR</div><h2 className="mt-4 text-2xl font-black">What are you studying?</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">Choose a ready source and generate quick, detailed, exam-focused notes from the same material used by your AI workspace.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><select value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={loading || generating || !materials.length} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white outline-none"><option value="" className="text-slate-950">{loading ? "Loading materials…" : materials.length ? "Select material" : "No ready material"}</option>{materials.map((material) => <option key={material.id} value={material.id} className="text-slate-950">{material.name}</option>)}</select><button onClick={generateNotes} disabled={!materialId || generating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{generating ? "Generating…" : "Generate notes"} <ArrowRight size={16}/></button></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="grid size-11 place-items-center rounded-xl bg-slate-100"><Brain size={20}/></div><h3 className="mt-5 font-black">One source → many formats</h3><p className="mt-2 text-sm leading-6 text-slate-500">Quick notes, detailed notes, exam notes, definitions, key points and cheat sheets.</p></div></div>
{error && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div>}
{result && <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100"><FileText size={18}/></div><div><h2 className="font-black">Generated notes</h2><p className="text-xs text-slate-400">Grounded in your selected material</p></div></div><div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{result}</div></article>}
<div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-black">Your ready material</h2><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400"><Search size={16}/>{materials.length} source{materials.length === 1 ? "" : "s"}</div></div><div className="mt-4 grid gap-4 md:grid-cols-3">{materials.length ? materials.map((material)=><article key={material.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="grid size-11 place-items-center rounded-xl bg-slate-100"><FileText size={19}/></div><h3 className="mt-5 truncate font-extrabold">{material.name}</h3><p className="mt-2 text-xs text-slate-400">Ready for AI generation</p><button onClick={()=>setMaterialId(material.id)} className="mt-5 text-sm font-bold text-slate-900 hover:underline">Use this material</button></article>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-400 md:col-span-3">Upload and process a study material in Library first. It will appear here when its status is ready.</div>}</div></div></main>;
}
