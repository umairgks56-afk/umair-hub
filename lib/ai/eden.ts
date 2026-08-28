import OpenAI from "openai";
import type { TextGenerationInput, TextProvider } from "./providers";

export function getEdenAITextProvider(): TextProvider {
  const apiKey = process.env.EDEN_AI_API_KEY;
  if (!apiKey) throw new Error("EDEN_AI_API_KEY is not configured.");

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.EDEN_AI_BASE_URL ?? "https://api.edenai.run/v3",
  });

  return {
    async generate(input: TextGenerationInput) {
      const response = await client.chat.completions.create({
        model: process.env.EDEN_AI_MODEL ?? "google/gemma-4-26b-a4b-it",
        temperature: input.temperature ?? 0.2,
        messages: [
          {
            role: "system",
            content:
              input.system ??
              "You are UMAIR HUB, a helpful academic AI. Ground answers in supplied source material when provided.",
          },
          { role: "user", content: input.prompt },
        ],
      });

      return response.choices[0]?.message?.content ?? "";
    },
  };
}
