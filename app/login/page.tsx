"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";
  const authError = searchParams.get("error");
  const supabase = createSupabaseBrowserClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(authError ? "Google sign-in could not be completed. Please try again." : "");

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Account created. Check your email to confirm your account, then sign in.");
    window.location.assign(next);
  }

  async function signInWithGoogle() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) { setLoading(false); setMessage(error.message); }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7fb] p-5 text-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[.05] sm:p-9">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white"><Sparkles size={18}/></div><div><p className="font-black">UMAIR HUB</p><p className="text-xs text-slate-400">Personal AI workspace</p></div></div>
        <div className="mt-8"><h1 className="text-2xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Sign in to continue your study workspace." : "Start turning your study material into everything you need."}</p></div>
        <button type="button" onClick={signInWithGoogle} disabled={loading} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-60"><span className="grid size-6 place-items-center rounded-full bg-white text-sm font-black">G</span>Continue with Google</button>
        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-300"><span className="h-px flex-1 bg-slate-200"/>or<span className="h-px flex-1 bg-slate-200"/></div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && <label className="block text-sm font-bold">Full name<input value={name} onChange={e=>setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-slate-500"/></label>}
          <label className="block text-sm font-bold">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-slate-500"/></label>
          <label className="block text-sm font-bold">Password<input type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-slate-500"/></label>
          {message && <p className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-600">{message}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 size={17} className="animate-spin"/>}{mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button onClick={()=>{setMode(mode === "login" ? "signup" : "login");setMessage("")}} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950">{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400"><BookOpen size={14}/> Your material stays in your private workspace.</div>
      </section>
    </main>
  );
}
