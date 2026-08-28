"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUp, Search, FolderOpen, FileText, Presentation, Image, MoreHorizontal, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Material = {
  id: string;
  course_id: string | null;
  name: string;
  mime_type: string | null;
  size: number | null;
  status: string | null;
  created_at: string;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function materialIcon(mimeType: string | null) {
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return Presentation;
  if (mimeType?.startsWith("image/")) return Image;
  return FileText;
}

export default function Library() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMaterials() {
      setLoading(true);
      setError("");
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (active) setError("Sign in to view your library.");
          return;
        }
        const response = await fetch("/api/materials", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Could not load your materials.");
        if (active) setMaterials(json.materials ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your materials.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMaterials();
    return () => { active = false; };
  }, []);

  const visibleMaterials = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return materials;
    return materials.filter((material) => material.name.toLowerCase().includes(term));
  }, [materials, query]);

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950"><div className="mx-auto max-w-6xl p-6 md:p-10"><header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">UMAIR HUB</p><h1 className="mt-2 text-3xl font-black tracking-tight">My Library</h1><p className="mt-2 text-sm text-slate-500">Upload your material once. Use it across notes, quizzes, tests and presentations.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"><Plus size={17}/> Upload material</button></header>
  <div className="mt-8 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center transition hover:border-slate-300"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100"><FileUp size={24}/></div><h2 className="mt-4 text-lg font-black">Drop your study material here</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">PDF, PPTX, DOCX, images and more. Your material becomes a searchable knowledge base for UMAIR HUB.</p><button className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Choose files</button></div>
  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Recent material</h2><p className="mt-1 text-xs text-slate-400">{loading ? "Loading…" : `${visibleMaterials.length} of ${materials.length} material${materials.length === 1 ? "" : "s"}`}</p></div><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400"><Search size={16}/><input aria-label="Search files" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"/></label></div>
  {error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div> : loading ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Loading your materials…</div> : visibleMaterials.length ? <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">{visibleMaterials.map((material)=>(()=>{const Icon = materialIcon(material.mime_type); return <div key={material.id} className="group flex items-center gap-4 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100"><Icon size={19}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{material.name}</p><p className="mt-1 text-xs text-slate-400">{material.mime_type?.split("/").pop()?.toUpperCase() ?? "FILE"} · {formatSize(material.size)} · {formatDate(material.created_at)}</p></div><span className="mr-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-500">{material.status ?? "pending"}</span><button aria-label={`More options for ${material.name}`} className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-900 group-hover:opacity-100"><MoreHorizontal size={18}/></button></div>})())}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100"><FolderOpen size={20}/></div><p className="mt-3 text-sm font-bold">{query ? "No matching material" : "No material uploaded yet"}</p><p className="mt-1 text-xs text-slate-400">{query ? "Try another file name." : "Upload your first study material to build your knowledge base."}</p></div>}
  <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-3"><FolderOpen size={19}/><p className="text-sm font-extrabold">Knowledge base</p></div><p className="mt-2 text-xs leading-5 text-slate-400">Your uploaded materials are shared by the authenticated API with the AI features, so you can reuse the same source across your workspace.</p></div></div></main>;
}
