import { NextResponse } from "next/server";
import { createEmbedding } from "@/lib/study/embeddings";
import { retrieveMaterialContext } from "@/lib/rag/retrieve";
import { getTextProvider } from "@/lib/ai/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function authenticatedUser(request: Request) { const auth=request.headers.get("authorization"); if(!auth?.startsWith("Bearer "))return null; const {data}=await createSupabaseAdminClient().auth.getUser(auth.slice(7)); return data.user??null; }

export async function POST(request: Request) {
 try {
  const user=await authenticatedUser(request); if(!user)return NextResponse.json({error:"Authentication required."},{status:401});
  const body=await request.json().catch(()=>null); const question=typeof body?.question==="string"?body.question.trim():""; if(!question)return NextResponse.json({error:"A question is required."},{status:400}); if(question.length>4000)return NextResponse.json({error:"Question is too long."},{status:400});
  const supabase=createSupabaseAdminClient(); const embedding=await createEmbedding(question); const matches=await retrieveMaterialContext(user.id,embedding,8);
  const ids=[...new Set(matches.map((m:{material_id?:string})=>m.material_id).filter(Boolean))] as string[]; const {data:materials}=ids.length?await supabase.from("materials").select("id,name").eq("user_id",user.id).in("id",ids):{data:[]}; const names=new Map((materials??[]).map(m=>[m.id,m.name]));
  const context=matches.map((m:{content?:string;material_id?:string;similarity?:number},i:number)=>`[Source ${i+1}${m.material_id?` · ${names.get(m.material_id)||"Material"}`:""}]\n${m.content??""}`).join("\n\n");
  const result=await getTextProvider().generate({system:"You are UMAIR HUB AI Tutor. Answer as a clear academic tutor. Use the supplied course material as the primary source. If the sources do not contain enough information, say so instead of inventing facts. Explain concepts simply, preserve important terminology, and cite source numbers like [Source 1] when a claim comes from the material.",prompt:context?`Student question:\n${question}\n\nRelevant course material:\n${context}`:`Student question:\n${question}\n\nNo relevant course material was found. Explain that the answer is not grounded in the student's uploaded material and provide only general educational guidance if appropriate.`,temperature:0.2});
  return NextResponse.json({answer:result,sources:matches.map((m:{material_id?:string;similarity?:number},i:number)=>({materialId:m.material_id??null,materialName:m.material_id?names.get(m.material_id)??null:null,similarity:m.similarity??null,source:i+1}))});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"AI Tutor request failed."},{status:503});}
}
