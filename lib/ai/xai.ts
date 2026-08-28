import OpenAI from "openai";
import { getTextProvider as getConfiguredTextProviderFromRegistry } from "./providers";
import type { ImageGenerationInput, TextGenerationInput, TextProvider, ImageProvider } from "./providers";

const xai = () => {
  if (!process.env.XAI_API_KEY) throw new Error("XAI_API_KEY is not configured.");
  return new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1" });
};

export function getXAITextProvider(): TextProvider {
  return {
    async generate(input: TextGenerationInput) {
      const response = await xai().chat.completions.create({ model: process.env.XAI_MODEL ?? "grok-4.6", temperature: input.temperature ?? 0.2, messages: [ ...(input.system ? [{ role: "system" as const, content: input.system }] : []), { role: "user", content: input.prompt } ] });
      return response.choices[0]?.message?.content ?? "";
    },
  };
}

export function getXAIImageProvider(): ImageProvider {
  return {
    async generate(input: ImageGenerationInput) {
      const response = await xai().images.generate({ model: process.env.XAI_IMAGE_MODEL ?? "grok-imagine-image-2.0", prompt: input.prompt, size: input.size as any });
      const url = response.data?.[0]?.url;
      if (!url) throw new Error("xAI did not return an image URL.");
      return { url };
    },
  };
}

export function getConfiguredTextProvider(): TextProvider {
  return getConfiguredTextProviderFromRegistry();
}

export function getConfiguredImageProvider(): ImageProvider {
  const provider = process.env.AI_IMAGE_PROVIDER ?? "disabled";
  if (provider === "xai") return getXAIImageProvider();
  throw new Error(`Unsupported or disabled image provider: ${provider}`);
}
