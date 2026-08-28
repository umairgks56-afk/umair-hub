export const env = {
  edenAiApiKey: process.env.EDEN_AI_API_KEY,
  xaiApiKey: process.env.XAI_API_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "study-materials",
};

export function requireServerEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`Missing server environment variable for ${name}.`);
  return value;
}
