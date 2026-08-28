import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function userFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function POST(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const quizId = typeof body?.quizId === "string" ? body.quizId : "";
  const attempted = Number.isInteger(body?.attempted) ? body.attempted : 0;
  const correct = Number.isInteger(body?.correct) ? body.correct : 0;
  if (!quizId || attempted < 0 || correct < 0 || correct > attempted) return NextResponse.json({ error: "Invalid quiz attempt." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: quiz } = await supabase.from("quizzes").select("id").eq("id", quizId).eq("user_id", user.id).single();
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  const score = attempted ? Math.round((correct / attempted) * 10000) / 100 : 0;
  const { data: attempt, error } = await supabase.from("study_attempts").insert({ quiz_id: quizId, user_id: user.id, score, correct, attempted }).select("id,quiz_id,score,correct,attempted,completed_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attempt }, { status: 201 });
}

export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("study_attempts").select("id,quiz_id,score,correct,attempted,completed_at,quizzes(title)").eq("user_id", user.id).order("completed_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attempts: data ?? [] });
}
