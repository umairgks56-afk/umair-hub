# UMAIR HUB AI/Data Stack

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only)
- `EDEN_AI_API_KEY` (server only)

## Storage

Bucket: `study-materials` (private)

Supported upload types: PDF, PPTX, DOCX, TXT, PNG, JPEG, WEBP.
Maximum application upload size: 50 MB.

## RAG

`public.material_chunks.embedding` uses 384 dimensions to match the Supabase/gte-small embedding model family. Retrieval is exposed through `match_material_chunks` and is scoped to the authenticated user's ID.

## Security

Never put `SUPABASE_SECRET_KEY` or `EDEN_AI_API_KEY` in client-side code or Git. Use Vercel environment variables for deployment secrets.
