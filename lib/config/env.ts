export const env = {
  xaiApiKey: process.env.XAI_API_KEY,
  imageApiKey: process.env.IMAGE_API_KEY,
  imageBaseUrl: process.env.IMAGE_API_BASE_URL,
  databaseUrl: process.env.DATABASE_URL,
  storageBucket: process.env.STORAGE_BUCKET,
};

export function requireServerEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`Missing server environment variable for ${name}.`);
  return value;
}
