import OpenAI from "openai";
import type { ImageGenerationInput, TextGenerationInput, TextProvider } from "./providers";

const xai = () => new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1" });

export function getXAITextProvider(): TextProvider {
  return {
    async generate(input: TextGenerationInput) {
      if (!process.env.XAI_API_KEY) throw new Error("XAI_API_KEY is not configured.");
      const response = await xai().chat.completions.create({
        model: process.env.XAI_MODEL ?? "grok-3-mini",
        temperature: input.temperature ?? 0.2,
        messages: [
          ...(input.system ? [{ role: "system" as const, content: input.system }] : []),
          { role: "user", content: input.prompt },
        ],
      });
      return response.choices[0]?.message?.content ?? "";
    },
  };
}

export function getConfiguredTextProvider(): TextProvider {
  const provider = process.env.AI_TEXT_PROVIDER ?? "xai";
  if (provider === "xai") return getXAITextProvider();
  throw new Error(`Unsupported text provider: ${provider}`);
}

export function imageInput(input: ImageGenerationInput) {
  return { prompt: input.prompt, size: input.size ?? "1024x1024" };
}
