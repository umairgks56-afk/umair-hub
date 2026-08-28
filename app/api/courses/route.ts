import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/data/memory-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.userId || !body?.title) return NextResponse.json({ error: "userId and title are required." }, { status: 400 });
  const course = await memoryStore.createCourse({ userId: String(body.userId), title: String(body.title), code: body.code ? String(body.code) : undefined });
  return NextResponse.json({ course }, { status: 201 });
}
