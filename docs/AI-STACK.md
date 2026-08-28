# UMAIR HUB AI/Data Stack

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only)
- `EDEN_AI_API_KEY` (server only)
- `EDEN_AI_MODEL`
- `EDEN_AI_EMBEDDING_DIMENSIONS` (default: 384)

## AI provider

Eden AI is the primary text/embedding gateway. Text generation uses Eden AI's OpenAI-compatible V3 chat endpoint, while embeddings currently use Eden AI's V2 embeddings endpoint with a 384-dimensional output so it matches the live Supabase vector column. The text model remains configurable through `EDEN_AI_MODEL` so the app is not coupled to a single model.

xAI remains available as an optional alternate text/image provider through the existing provider abstraction.

## Storage

Bucket: `study-materials` (private)

Upload validation currently accepts PDF, PPTX, DOCX, TXT, PNG, JPEG and WEBP, up to 50 MB. The indexing parser currently has dedicated text extraction for PDF, DOCX and TXT; PPTX/image OCR still requires a dedicated parser before those uploads can be indexed.

## RAG

`public.material_chunks.embedding` uses 384 dimensions. Retrieval is exposed through `match_material_chunks` and is scoped to the authenticated user's ID.

## Security

Never put `SUPABASE_SECRET_KEY` or `EDEN_AI_API_KEY` in client-side code or Git. Use Vercel environment variables for deployment secrets.
