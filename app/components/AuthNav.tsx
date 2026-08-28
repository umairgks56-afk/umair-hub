"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthNav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? null); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (pathname === "/login" || loading) return null;
  if (!email) return <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="fixed right-4 top-4 z-[100] inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"><LogIn size={15}/> Sign in</Link>;
  return <div className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-xl"><Link href="/" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><span className="grid size-6 place-items-center rounded-full bg-slate-100"><UserRound size={13}/></span><span className="hidden max-w-40 truncate sm:inline">{email}</span></Link><button onClick={async () => { const supabase = createSupabaseBrowserClient(); await supabase.auth.signOut(); window.location.href = "/login"; }} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Sign out" title="Sign out"><LogOut size={15}/></button></div>;
}
