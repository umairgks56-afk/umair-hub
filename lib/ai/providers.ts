import OpenAI from "openai";

export interface TextGenerationInput { prompt: string; system?: string; temperature?: number; }
export interface ImageGenerationInput { prompt: string; size?: string; }
export interface TextProvider { generate(input: TextGenerationInput): Promise<string>; }
export interface ImageProvider { generate(input: ImageGenerationInput): Promise<{ url: string }>; }

/** xAI is OpenAI-compatible. Keep XAI_API_KEY server-side. */
export function getTextProvider(): TextProvider {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("XAI_API_KEY is not configured.");
  const client = new OpenAI({ apiKey: key, baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1" });
  return { async generate(input) {
    const response = await client.chat.completions.create({
      model: process.env.XAI_MODEL || "grok-3-mini",
      temperature: input.temperature ?? 0.3,
      messages: [
        { role: "system", content: input.system || "You are UMAIR HUB, a helpful academic AI. Ground answers in supplied source material when provided." },
        { role: "user", content: input.prompt },
      ],
    });
    return response.choices[0]?.message?.content || "";
  }};
}

/** Image provider is intentionally configurable; no provider is assumed to be permanently free. */
export function getImageProvider(): ImageProvider {
  return {
    async generate(input) {
      const endpoint = process.env.IMAGE_GENERATION_URL;
      const key = process.env.IMAGE_GENERATION_API_KEY;
      if (!endpoint || !key) throw new Error("Image provider is not configured.");
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ prompt: input.prompt, size: input.size || "1024x1024" }) });
      if (!response.ok) throw new Error(`Image provider returned ${response.status}.`);
      const data = await response.json();
      const url = data?.data?.[0]?.url || data?.url || data?.image_url;
      if (!url) throw new Error("Image provider returned no image URL.");
      return { url };
    },
  };
}
