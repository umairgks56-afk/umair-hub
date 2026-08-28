export const aiConfig = {
  textProvider: process.env.AI_TEXT_PROVIDER ?? "xai",
  imageProvider: process.env.AI_IMAGE_PROVIDER ?? "disabled",
  maxInputChars: Number(process.env.AI_MAX_INPUT_CHARS ?? 120000),
  maxMcqsPerRequest: Number(process.env.AI_MAX_MCQS_PER_REQUEST ?? 100),
};

export function assertServerAIConfig() {
  if (aiConfig.textProvider === "xai" && !process.env.XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not configured on the server.");
  }
}
