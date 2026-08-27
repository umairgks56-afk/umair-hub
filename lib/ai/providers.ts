export type AIProvider = "xai" | "image";

export interface TextGenerationInput {
  prompt: string;
  system?: string;
  temperature?: number;
}

export interface ImageGenerationInput {
  prompt: string;
  size?: string;
}

/** Provider-agnostic interfaces. Keep secrets server-side and swap providers through env/config. */
export interface TextProvider {
  generate(input: TextGenerationInput): Promise<string>;
}

export interface ImageProvider {
  generate(input: ImageGenerationInput): Promise<{ url: string }>;
}

export function getTextProvider(): TextProvider {
  return {
    async generate() {
      throw new Error("Text AI provider is not configured. Set the server-side provider credentials.");
    },
  };
}

export function getImageProvider(): ImageProvider {
  return {
    async generate() {
      throw new Error("Image AI provider is not configured. Set a server-side image provider credential.");
    },
  };
}
