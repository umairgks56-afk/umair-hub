"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, Search, FolderOpen, FileText, Presentation, Image, MoreHorizontal, Plus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "../globals.css";

type Material = { id: string; course_id: string | null; name: string; mime_type: string | null; size: number | null; status: string | null; created_at: string };
type Course = { id: string; title: string; code: string | null; created_at: string };

function formatSize(bytes: number | null) { if (!bytes) return "—"; if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
function materialIcon(mimeType: string | null) { if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return Presentation; if (mimeType?.startsWith("image/")) return Image; return FileText; }

export default function Library() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function authHeaders() {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please sign in before uploading or viewing your library.");
    return { Authorization: `Bearer ${session.access_token}` };
  }

  async function loadMaterials() {
    setLoading(true); setError("");
    try {
      const headers = await authHeaders();
      const [materialsResponse, coursesResponse] = await Promise.all([fetch("/api/materials", { headers, cache: "no-store" }), fetch("/api/courses", { headers, cache: "no-store" })]);
      const materialsJson = await materialsResponse.json(); const coursesJson = await coursesResponse.json();
      if (!materialsResponse.ok) throw new Error(materialsJson.error || "Could not load your materials.");
      if (!coursesResponse.ok) throw new Error(coursesJson.error || "Could not load your courses.");
      setMaterials(materialsJson.materials ?? []); setCourses(coursesJson.courses ?? []);
      if (!selectedCourse && coursesJson.courses?.[0]) setSelectedCourse(coursesJson.courses[0].id);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load your library."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadMaterials(); }, []);

  const visibleMaterials = useMemo(() => { const term = query.trim().toLowerCase(); return term ? materials.filter(m => m.name.toLowerCase().includes(term)) : materials; }, [materials, query]);
  const courseName = new Map(courses.map(c => [c.id, c.title]));

  function openUpload() { setUploadError(""); setUploadSuccess(""); setUploadOpen(true); if (!selectedCourse && courses[0]) setSelectedCourse(courses[0].id); }

  async function createCourse() {
    if (!courseTitle.trim()) return;
    setCreatingCourse(true); setUploadError("");
    try {
      const headers = { ...(await authHeaders()), "Content-Type": "application/json" };
      const response = await fetch("/api/courses", { method: "POST", headers, body: JSON.stringify({ title: courseTitle.trim() }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not create course.");
      setCourses(prev => [json.course, ...prev]); setSelectedCourse(json.course.id); setCourseTitle("");
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Could not create course."); }
    finally { setCreatingCourse(false); }
  }

  async function uploadFiles(files: FileList | File[]) {
    const fileList = Array.from(files);
    if (!fileList.length) return;
    if (!selectedCourse) { setUploadError("Select or create a course first."); return; }
    setUploading(true); setUploadError(""); setUploadSuccess("");
    try {
      const headers = await authHeaders();
      for (const file of fileList) {
        const form = new FormData(); form.append("file", file); form.append("courseId", selectedCourse);
        const response = await fetch("/api/materials/upload", { method: "POST", headers, body: form });
        const json = await response.json();
        if (!response.ok) throw new Error(`${file.name}: ${json.error || "Upload failed."}`);
      }
      setUploadSuccess(`${fileList.length} material${fileList.length === 1 ? "" : "s"} uploaded successfully.`);
      await loadMaterials();
      setTimeout(() => setUploadOpen(false), 900);
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><Link href="/" className="text-xs font-bold uppercase tracking-[.16em] text-slate-400 hover:text-slate-900">UMAIR HUB</Link><h1 className="mt-2 text-3xl font-black tracking-tight">My Library</h1><p className="mt-2 text-sm text-slate-500">Upload your material once. Use it across notes, quizzes, tests and presentations.</p></div><button onClick={openUpload} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"><Plus size={17}/> Upload material</button></header>
      <button onClick={openUpload} className="mt-8 block w-full rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center transition hover:border-slate-400 hover:bg-slate-50"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100"><FileUp size={24}/></div><h2 className="mt-4 text-lg font-black">Drop your study material here</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">PDF, PPTX, DOCX, images and text. Your material becomes a searchable knowledge base for UMAIR HUB.</p><span className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Choose files</span></button>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Recent material</h2><p className="mt-1 text-xs text-slate-400">{loading ? "Loading…" : `${visibleMaterials.length} of ${materials.length} material${materials.length === 1 ? "" : "s"}`}</p></div><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400"><Search size={16}/><input aria-label="Search files" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search files..." className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"/></label></div>
      {error ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"><AlertCircle size={17}/>{error}</div> : loading ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Loading your materials…</div> : visibleMaterials.length ? <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">{visibleMaterials.map(material => { const Icon = materialIcon(material.mime_type); return <div key={material.id} className="group flex items-center gap-4 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100"><Icon size={19}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{material.name}</p><p className="mt-1 truncate text-xs text-slate-400">{courseName.get(material.course_id ?? "") ?? "Unassigned course"} · {material.mime_type?.split("/").pop()?.toUpperCase() ?? "FILE"} · {formatSize(material.size)} · {formatDate(material.created_at)}</p></div><span className="mr-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-500">{material.status ?? "pending"}</span><button aria-label={`More options for ${material.name}`} className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-900 group-hover:opacity-100"><MoreHorizontal size={18}/></button></div>; })}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100"><FolderOpen size={20}/></div><p className="mt-3 text-sm font-bold">{query ? "No matching material" : "No material uploaded yet"}</p><p className="mt-1 text-xs text-slate-400">{query ? "Try another file name." : "Upload your first study material to build your knowledge base."}</p></div>}
      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-3"><FolderOpen size={19}/><p className="text-sm font-extrabold">Knowledge base</p></div><p className="mt-2 text-xs leading-5 text-slate-400">Uploaded materials are scoped to your authenticated account and can be reused across AI features.</p></div>
    </div>
    {uploadOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Upload study material</h2><p className="mt-1 text-xs text-slate-400">Choose where this material belongs before uploading.</p></div><button onClick={() => setUploadOpen(false)} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div><div className="mt-6"><label className="text-xs font-bold text-slate-500">Course</label><select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-slate-500"><option value="">Select a course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.title}{course.code ? ` · ${course.code}` : ""}</option>)}</select></div><div className="mt-3 flex gap-2"><input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="New course name" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"/><button onClick={createCourse} disabled={creatingCourse || !courseTitle.trim()} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold disabled:opacity-50">{creatingCourse ? <Loader2 className="animate-spin" size={15}/> : "Create"}</button></div><button onClick={() => inputRef.current?.click()} disabled={uploading || !selectedCourse} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm font-bold transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{uploading ? <Loader2 className="animate-spin" size={20}/> : <FileUp size={20}/>} {uploading ? "Uploading…" : "Choose files to upload"}</button><input ref={inputRef} type="file" multiple accept=".pdf,.pptx,.docx,.txt,.png,.jpg,.jpeg,.webp" className="hidden" onChange={e => { if (e.target.files) void uploadFiles(e.target.files); e.currentTarget.value = ""; }}/>{uploadError && <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertCircle size={15}/>{uploadError}</div>}{uploadSuccess && <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15}/>{uploadSuccess}</div>}<p className="mt-4 text-[11px] leading-5 text-slate-400">Maximum 50 MB per file. Supported: PDF, PPTX, DOCX, TXT, PNG, JPG and WEBP.</p></div></div>}
  </main>;
}
